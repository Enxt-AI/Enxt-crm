import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
  assignedEmployeeIds: string[]; // supports multiple assignees
}

const tasksFile = path.join(process.cwd(), 'src', 'data', 'tasks.json');

/** Migrate old single-assignee tasks to new array format */
function migrateTasks(raw: any[]): Task[] {
  return raw.map((t) => {
    if (t.assignedEmployeeIds) return t as Task;
    // Legacy: convert single string to array
    return {
      ...t,
      assignedEmployeeIds: t.assignedEmployeeId ? [t.assignedEmployeeId] : [],
      assignedEmployeeId: undefined,
    } as Task;
  });
}

async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(tasksFile, 'utf-8');
    const raw = JSON.parse(data);
    return migrateTasks(raw);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await fs.mkdir(path.dirname(tasksFile), { recursive: true });
  await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get('employeeId');
  const tasks = await loadTasks();
  const filtered = employeeId
    ? tasks.filter((t) => t.assignedEmployeeIds.includes(employeeId))
    : tasks;
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, dueDate, assignedEmployeeIds, status } = body;

  // Normalise: accept old single-id payload too
  let ids: string[] = [];
  if (Array.isArray(assignedEmployeeIds)) {
    ids = assignedEmployeeIds;
  } else if (body.assignedEmployeeId) {
    ids = [body.assignedEmployeeId];
  }

  const tasks = await loadTasks();
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    description,
    dueDate,
    status: status || 'Pending',
    assignedEmployeeIds: ids,
  };
  tasks.push(newTask);
  await saveTasks(tasks);
  return NextResponse.json(newTask);
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();
  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return new Response('Task not found', { status: 404 });
  }
  tasks[index] = { ...tasks[index], ...updates };
  await saveTasks(tasks);
  return NextResponse.json(tasks[index]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const tasks = await loadTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  await saveTasks(filtered);
  return NextResponse.json({ success: true });
}
