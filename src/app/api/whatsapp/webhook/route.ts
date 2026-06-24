import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[whatsapp webhook GET] incoming params:', { mode, token, challenge });

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'rd_3FWejpxocF2rjWq8z9ve1jKCq2z';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[whatsapp webhook] Verification successful');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.warn('[whatsapp webhook] Verification failed');
      return new Response('Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
  return new Response('Bad Request', {
    status: 400,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('[whatsapp webhook] Payload received:', JSON.stringify(payload, null, 2));

    // Extract message data
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Not a message event (could be a delivery status update)
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const from = message.from; // Sender's phone number (e.g. 917056754400)
    const textBody = message.text?.body?.trim();

    if (!from || !textBody) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.log(`[whatsapp webhook] Inbound from ${from}: "${textBody}"`);

    // Resolve the sender to an employee in our database
    const documentsPath = path.join(process.cwd(), 'src', 'data', 'documents.json');
    const documentsData = await fs.readFile(documentsPath, 'utf8');
    const documents = JSON.parse(documentsData);

    const cleanFrom = from.replace(/\D/g, ''); // standard digits only

    // Find the employee by phone number
    const employee = documents.find((doc: any) => {
      if (doc.type !== 'employee') return false;
      const phone = doc.fields?.phone;
      if (!phone) return false;
      const cleanPhone = phone.replace(/\D/g, '');
      // Match if one contains the other (e.g. 917056754400 matches 7056754400)
      return cleanPhone.includes(cleanFrom) || cleanFrom.includes(cleanPhone);
    });

    if (!employee) {
      console.log(`[whatsapp webhook] Phone number ${from} not associated with any employee.`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.log(`[whatsapp webhook] Matched employee: ${employee.fields.name || employee.title}`);

    // Parse the status update command from textBody
    const lowerText = textBody.toLowerCase();
    let newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Blocked' | null = null;

    if (/\b(completed|done|complete|finished|check)\b/i.test(lowerText)) {
      newStatus = 'Completed';
    } else if (/\b(in progress|progress|started|doing|run)\b/i.test(lowerText)) {
      newStatus = 'In Progress';
    } else if (/\b(pending|todo|hold|wait)\b/i.test(lowerText)) {
      newStatus = 'Pending';
    } else if (/\b(blocked|stuck|stop|cannot)\b/i.test(lowerText)) {
      newStatus = 'Blocked';
    }

    if (!newStatus) {
      console.log(`[whatsapp webhook] No status match in text "${textBody}"`);
      await replyToWhatsApp(from, `Hi ${employee.fields.name || 'there'}! I couldn't understand that command. Please reply with one of these keywords to update your task status:\n\n- *Completed* (or Done)\n- *In Progress*\n- *Blocked*\n- *Pending*`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Load tasks
    const tasksPath = path.join(process.cwd(), 'src', 'data', 'tasks.json');
    const tasksData = await fs.readFile(tasksPath, 'utf8');
    const tasks = JSON.parse(tasksData);

    // Find tasks for this employee (support both old and new field names)
    const employeeTasks = tasks.filter((t: any) => {
      if (Array.isArray(t.assignedEmployeeIds)) return t.assignedEmployeeIds.includes(employee.id);
      return t.assignedEmployeeId === employee.id;
    });

    
    if (employeeTasks.length === 0) {
      await replyToWhatsApp(from, `You have no tasks assigned to you right now.`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Find the task to update:
    // If they specified keywords from the task title, match it, otherwise take the latest active task.
    let taskToUpdate = employeeTasks.find((t: any) => {
      const words = t.title.toLowerCase().split(/\s+/);
      return words.some((word: string) => word.length > 2 && lowerText.includes(word));
    });

    if (!taskToUpdate) {
      // Find the most recent non-completed task, or just the most recent task
      taskToUpdate = employeeTasks.find((t: any) => t.status !== 'Completed') || employeeTasks[employeeTasks.length - 1];
    }

    if (taskToUpdate) {
      const oldStatus = taskToUpdate.status;
      taskToUpdate.status = newStatus;
      
      // Save tasks
      await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');
      console.log(`[whatsapp webhook] Updated task "${taskToUpdate.title}" from ${oldStatus} to ${newStatus}`);

      // Reply back confirmation
      let statusIcon = '⏳';
      if (newStatus === 'Completed') statusIcon = '✅';
      if (newStatus === 'In Progress') statusIcon = '⚡';
      if (newStatus === 'Blocked') statusIcon = '🛑';

      const replyMsg = `Task status updated successfully!\n\n📋 *Task:* ${taskToUpdate.title}\n${statusIcon} *New Status:* ${newStatus}`;
      await replyToWhatsApp(from, replyMsg);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[whatsapp webhook] Error handling POST request:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

async function replyToWhatsApp(to: string, message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

  if (!token || !phoneId || token.includes('your_meta_access_token')) {
    console.warn('[whatsapp webhook] Meta API credentials missing, skipping reply dispatch.');
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });
    const data = await res.json();
    console.log('[whatsapp webhook] Dispatch reply response:', data);
  } catch (err) {
    console.error('[whatsapp webhook] Dispatch reply request failed:', err);
  }
}
