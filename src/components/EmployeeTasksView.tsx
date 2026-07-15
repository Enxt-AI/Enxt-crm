import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Trash2, RefreshCw, Pencil, Plus, ClipboardList, Clock, AlertCircle } from 'lucide-react';
import TaskAssignmentModal, { TaskData } from './TaskAssignmentModal';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  assignedEmployeeIds: string[];
}

interface Employee {
  id: string;
  fields: { name?: string; phone?: string };
  title: string;
}

interface Props {
  employees: Employee[];
  onAssignClick?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

function isOverdue(dueDate: string, status: string): boolean {
  if (!dueDate || status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function isDueToday(dueDate: string, status: string): boolean {
  if (!dueDate || status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
}

function Stopwatch({ startTime, deadlineTime }: { startTime: string; deadlineTime?: Date | null }) {
  const [elapsed, setElapsed] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const deadline = deadlineTime ? deadlineTime.getTime() : null;
    
    const update = () => {
      const now = Date.now();
      
      if (deadline && now >= deadline) {
        setIsExpired(true);
        return;
      }
      
      const diff = Math.max(0, now - start);
      
      const secs = Math.floor((diff / 1000) % 60);
      const mins = Math.floor((diff / 60000) % 60);
      const hrs = Math.floor(diff / 3600000);
      
      const pad = (num: number) => String(num).padStart(2, '0');
      setElapsed(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, deadlineTime]);

  if (isExpired) return null;

  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px', 
      background: 'rgba(16, 185, 129, 0.1)', 
      color: '#10b981', 
      padding: '2px 6px', 
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 700,
      fontFamily: 'monospace',
      marginLeft: '6px'
    }}>
      <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{elapsed}
    </span>
  );
}

export default function EmployeeTasksView({ employees, onAssignClick, onShowToast }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const load = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/tasks?_t=${Date.now()}`);
      const data = await res.json();
      
      const reqRes = await fetch(`/api/time-change-requests?_t=${Date.now()}`);
      const reqData = await reqRes.json();
      
      // Migrate old tasks that may still have single assignedEmployeeId
      const migrated = data.map((t: any) => ({
        ...t,
        assignedEmployeeIds: t.assignedEmployeeIds ?? (t.assignedEmployeeId ? [t.assignedEmployeeId] : []),
      }));
      setTasks(migrated);
      setChangeRequests(reqData || []);
    } catch {
      onShowToast?.('Failed to load tasks.', 'error');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const approveTimeChange = async (req: any) => {
    try {
      // 1. Update task deadline
      const res1 = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.taskId,
          updates: {
            dueDate: req.requestedDueDate,
            dueTime: req.requestedDueTime
          }
        })
      });

      if (!res1.ok) {
        const errorText = await res1.text();
        throw new Error(`Failed to update task: ${res1.status} ${errorText}`);
      }

      // 2. Update status of request to 'approved' and start stopwatch
      const res2 = await fetch('/api/time-change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.id,
          status: 'approved',
          timerStartedAt: new Date().toISOString()
        })
      });

      if (!res2.ok) {
        const errorText = await res2.text();
        throw new Error(`Failed to update request: ${res2.status} ${errorText}`);
      }

      // 3. Send WhatsApp notification
      const emp = employees.find(e => e.id === req.employeeId);
      const phone = emp?.fields?.phone;
      if (phone) {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            body: `🔔 *Deadline Extension Approved!*\n\nYour request for task "${req.taskTitle}" has been approved.\n📅 *New Deadline:* ${req.requestedDueDate} at ${req.requestedDueTime}\n⏱️ Your stopwatch has started on the dashboard!`
          })
        }).catch(err => console.error("Failed to send approval WhatsApp:", err));
      }

      onShowToast?.("Extension request approved!", "success");
      load();
    } catch (err) {
      console.error(err);
      onShowToast?.("Failed to approve request.", "error");
    }
  };

  const rejectTimeChange = async (req: any) => {
    try {
      // 1. Update status of request to 'rejected'
      const res = await fetch('/api/time-change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.id,
          status: 'rejected'
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to reject request: ${res.status} ${errorText}`);
      }

      // 2. Send WhatsApp notification
      const emp = employees.find(e => e.id === req.employeeId);
      const phone = emp?.fields?.phone;
      if (phone) {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            body: `❌ *Deadline Extension Rejected*\n\nYour request for task "${req.taskTitle}" has been rejected. Please complete the work by the original deadline.`
          })
        }).catch(err => console.error("Failed to send rejection WhatsApp:", err));
      }

      onShowToast?.("Extension request rejected.", "success");
      load();
    } catch (err) {
      console.error(err);
      onShowToast?.("Failed to reject request.", "error");
    }
  };

  useEffect(() => {
    load(true);

    const interval = setInterval(() => {
      load(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const updateStatus = async (id: string, newStatus: Task['status']) => {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { status: newStatus } }),
    });
    load();
  };

  const sendReminder = async (taskId: string) => {
    setSendingReminder(taskId);
    try {
      const res = await fetch(`/api/tasks/remind?taskId=${taskId}`);
      const data = await res.json();
      const sent = data.totalRemindersSent ?? 0;
      if (sent > 0) {
        onShowToast?.(`🔔 Reminder sent to ${sent} employee${sent > 1 ? 's' : ''}!`, 'success');
      } else {
        onShowToast?.('No reminders sent — employees may not have phone numbers.', 'error');
      }
    } catch {
      onShowToast?.('Failed to send reminder.', 'error');
    } finally {
      setSendingReminder(null);
    }
  };

  const sendAllReminders = async () => {
    setSendingAll(true);
    try {
      const res = await fetch('/api/tasks/remind');
      const data = await res.json();
      const sent = data.totalRemindersSent ?? 0;
      const processed = data.totalTasksProcessed ?? 0;
      if (processed === 0) {
        onShowToast?.('No tasks are overdue or due soon — nothing to remind!', 'success');
      } else if (sent > 0) {
        onShowToast?.(`🔔 ${sent} reminder${sent > 1 ? 's' : ''} sent across ${processed} task${processed > 1 ? 's' : ''}!`, 'success');
      } else {
        onShowToast?.('Tasks found but no reminders sent — check phone numbers.', 'error');
      }
    } catch {
      onShowToast?.('Failed to send reminders.', 'error');
    } finally {
      setSendingAll(false);
    }
  };

  const getEmployeeNames = (ids: string[]) =>
    ids.map((id) => {
      const emp = employees.find((e) => e.id === id);
      return emp?.fields?.name || emp?.title || id;
    });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', display: 'inline' }} />
        <span style={{ marginLeft: '10px' }}>Loading tasks…</span>
      </div>
    );
  }

  const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} style={{ color: 'var(--green)', marginRight: '8px' }} />Employee Tasks
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            {overdueCount > 0 && (
              <span style={{ marginLeft: '10px', color: '#e53e3e', fontWeight: 700 }}>
                • {overdueCount} overdue
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Send All Reminders button */}
          <button
            type="button"
            className="secondary-button"
            onClick={sendAllReminders}
            disabled={sendingAll || pendingCount === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '38px',
              padding: '0 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: pendingCount === 0 ? 0.5 : 1,
            }}
            title="Send WhatsApp reminders for all overdue / due-today / due-tomorrow tasks"
          >
            <BellRing size={14} />
            {sendingAll ? 'Sending…' : 'Send Reminders'}
          </button>

          {onAssignClick && (
            <button
              className="primary-button"
              onClick={onAssignClick}
              type="button"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                height: '38px', 
                padding: '0 16px', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Plus size={14} /> Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Pending Extension Requests Panel */}
      {(() => {
        const pending = changeRequests.filter(r => r.status === 'pending');
        if (pending.length === 0) return null;

        return (
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: 'var(--shadow)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
              <Clock size={16} style={{ color: 'var(--amber)', marginRight: '6px' }} />Pending Extension Requests
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map(req => (
                <div key={req.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <strong style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{req.employeeName}</strong>
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem', marginLeft: '8px' }}>
                      requested extension for task <strong>{req.taskTitle}</strong>
                    </span>
                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                      📅 New Deadline: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{req.requestedDueDate} {req.requestedDueTime || ''}</span>
                      <span style={{ marginLeft: '12px', fontStyle: 'italic' }}>Reason: "{req.reason}"</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="primary-button"
                      onClick={() => approveTimeChange(req)}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        background: '#10b981',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => rejectTimeChange(req)}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        borderColor: '#e53e3e',
                        color: '#e53e3e',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {tasks.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <strong>No tasks assigned yet.</strong>
          <span>Click the "Assign Task" button to create and assign tasks to employees.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const dueToday = isDueToday(task.dueDate, task.status);
            const assigneeNames = getEmployeeNames(task.assignedEmployeeIds);

            return (
              <div
                key={task.id}
                className="panel"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--panel)',
                  borderColor: overdue ? '#fed7d7' : dueToday ? '#fef3c7' : 'var(--line)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '240px',
                  boxShadow: overdue
                    ? '0 0 0 2px rgba(229,62,62,0.15)'
                    : 'var(--shadow)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
              >
                {/* Overdue / Due Today banner */}
                {(overdue || dueToday) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      borderRadius: '12px 12px 0 0',
                      background: overdue ? '#e53e3e' : '#d69e2e',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      padding: '4px 0',
                    }}
                  >
                    {overdue ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <AlertCircle size={12} /> Overdue
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Clock size={12} /> Due Today
                      </span>
                    )}
                  </div>
                )}

                <div style={{ marginTop: overdue || dueToday ? '22px' : '0' }}>
                  {/* Title + status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--ink)', margin: 0, fontWeight: 600, lineHeight: '1.3' }}>
                      {task.title || 'Untitled Task'}
                    </h3>
                    <span
                      className={`status-badge ${
                        task.status === 'Pending'
                          ? 'amber'
                          : task.status === 'In Progress'
                          ? 'teal'
                          : task.status === 'Completed'
                          ? 'green'
                          : task.status === 'Blocked'
                          ? 'red'
                          : 'neutral'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: '1.45', margin: '8px 0 14px' }}>
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', marginTop: 'auto' }}>
                  {/* Due date + Assignees */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '14px' }}>
                    <div>
                      <span style={{ display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: '#888b86', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                        DUE DATE
                      </span>
                      <span style={{ color: overdue ? '#e53e3e' : 'var(--ink)', fontWeight: 600 }}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'No due date'}
                        {task.dueTime && (
                          <span style={{ marginLeft: '6px', color: 'var(--muted)', fontWeight: 500, fontSize: '0.75rem' }}>
                            at {task.dueTime}
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: '#888b86', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        ASSIGNEES
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {task.assignedEmployeeIds && task.assignedEmployeeIds.length > 0 ? (
                          task.assignedEmployeeIds.map((empId) => {
                            const emp = employees.find((e) => e.id === empId);
                            const name = emp?.fields?.name || emp?.title || empId;
                            
                            // Check if there is an approved time change request for this task and employee
                            const activeRequest = changeRequests.find(r => 
                              r.taskId === task.id && 
                              r.employeeId === empId && 
                              r.status === 'approved' && 
                              r.timerStartedAt
                            );

                            let deadlineDate: Date | null = null;
                            if (activeRequest && task.dueDate) {
                              let combined = task.dueDate;
                              if (!combined.includes('T')) {
                                combined = `${combined}T${task.dueTime || '18:00'}`;
                              }
                              if (!combined.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(combined)) {
                                if ((combined.match(/:/g) || []).length === 1) {
                                  combined = `${combined}:00`;
                                }
                                combined = `${combined}+05:30`;
                              }
                              deadlineDate = new Date(combined);
                            }

                            return (
                              <span key={empId} className="assignee-pill" style={{ 
                                fontSize: '0.72rem', 
                                padding: '2px 8px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {name}
                                {activeRequest && <Stopwatch startTime={activeRequest.timerStartedAt} deadlineTime={deadlineDate} />}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value as any)}
                      className="input"
                      style={{ minHeight: '32px', flex: '1', padding: '0 8px', fontSize: '0.82rem', borderRadius: '6px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask({
                          id: task.id,
                          title: task.title,
                          description: task.description,
                          dueDate: task.dueDate,
                          dueTime: task.dueTime,
                          status: task.status,
                          assignedEmployeeIds: task.assignedEmployeeIds,
                        });
                        setEditModalOpen(true);
                      }}
                      className="icon-button"
                      title="Edit task"
                      style={{
                        minHeight: '32px',
                        width: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        color: 'var(--accent)',
                      }}
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Per-task reminder button */}
                    <button
                      type="button"
                      onClick={() => sendReminder(task.id)}
                      disabled={sendingReminder === task.id || task.status === 'Completed'}
                      className="icon-button"
                      title="Send WhatsApp reminder for this task"
                      style={{
                        minHeight: '32px',
                        width: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        opacity: task.status === 'Completed' ? 0.4 : 1,
                        color: '#d69e2e',
                      }}
                    >
                      <Bell size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="icon-button"
                      title="Delete task"
                      style={{
                        minHeight: '32px',
                        width: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        color: '#e53e3e',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Task Modal */}
      <TaskAssignmentModal
        employees={employees}
        open={editModalOpen}
        setOpen={(v) => {
          setEditModalOpen(v);
          if (!v) setEditingTask(null);
        }}
        editTask={editingTask}
        onTaskCreated={() => {
          load();
          setEditingTask(null);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
