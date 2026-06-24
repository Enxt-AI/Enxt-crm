import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const tasksPath = path.join(process.cwd(), 'src', 'data', 'tasks.json');
const documentsPath = path.join(process.cwd(), 'src', 'data', 'documents.json');

/**
 * Twilio sends webhook as application/x-www-form-urlencoded POST.
 * Key fields:
 *   From  = "whatsapp:+917056754400"
 *   To    = "whatsapp:+14155238886"
 *   Body  = "done"
 */
export async function POST(request: Request) {
  try {
    // Parse Twilio form-encoded body
    const text = await request.text();
    const params = new URLSearchParams(text);

    const from = params.get('From') || '';   // e.g. whatsapp:+917056754400
    const body = params.get('Body') || '';   // message text

    console.log(`[twilio webhook] Incoming from: ${from}, body: "${body}"`);

    if (!from || !body.trim()) {
      return twimlResponse(''); // empty TwiML = no reply
    }

    // Normalise sender phone — strip "whatsapp:" prefix and non-digits
    const cleanFrom = from.replace('whatsapp:', '').replace(/\D/g, '');

    // Load documents to find the matching employee
    const docsRaw = await fs.readFile(documentsPath, 'utf8').catch(() => '[]');
    const documents = JSON.parse(docsRaw);

    const employee = documents.find((doc: any) => {
      if (doc.type !== 'employee') return false;
      const phone = doc.fields?.phone;
      if (!phone) return false;
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.includes(cleanFrom) || cleanFrom.includes(cleanPhone);
    });

    if (!employee) {
      console.log(`[twilio webhook] No employee found for number: ${cleanFrom}`);
      return twimlResponse(''); // silently ignore unknown numbers
    }

    const name = employee.fields?.name || employee.title || 'there';
    console.log(`[twilio webhook] Matched employee: ${name}`);

    // Parse status keyword from message
    const lowerBody = body.toLowerCase().trim();
    let newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Blocked' | null = null;

    if (/\b(completed|done|complete|finished|check|finish)\b/.test(lowerBody)) {
      newStatus = 'Completed';
    } else if (/\b(in progress|progress|started|doing|started|working|run)\b/.test(lowerBody)) {
      newStatus = 'In Progress';
    } else if (/\b(pending|todo|hold|wait|paused)\b/.test(lowerBody)) {
      newStatus = 'Pending';
    } else if (/\b(blocked|stuck|stop|cannot|issue|problem)\b/.test(lowerBody)) {
      newStatus = 'Blocked';
    }

    if (!newStatus) {
      // Send help message back via TwiML
      const helpMsg =
        `Hi ${name}! I couldn't understand that. Reply with one of these keywords to update your task:\n\n` +
        `✅ *done* — Mark as Completed\n` +
        `⚡ *in progress* — Mark as In Progress\n` +
        `🛑 *blocked* — Mark as Blocked\n` +
        `⏳ *pending* — Mark as Pending`;
      return twimlResponse(helpMsg);
    }

    // Load tasks and find this employee's tasks
    const tasksRaw = await fs.readFile(tasksPath, 'utf8').catch(() => '[]');
    const tasks = JSON.parse(tasksRaw);

    const employeeTasks = tasks.filter((t: any) => {
      if (Array.isArray(t.assignedEmployeeIds)) return t.assignedEmployeeIds.includes(employee.id);
      return t.assignedEmployeeId === employee.id; // backward compat
    });

    if (employeeTasks.length === 0) {
      return twimlResponse(`Hi ${name}! You have no tasks assigned to you right now.`);
    }

    // Try to match task by title keywords, otherwise take most recent non-completed
    let taskToUpdate = employeeTasks.find((t: any) => {
      const words = (t.title || '').toLowerCase().split(/\s+/);
      return words.some((w: string) => w.length > 2 && lowerBody.includes(w));
    });

    if (!taskToUpdate) {
      taskToUpdate =
        employeeTasks.find((t: any) => t.status !== 'Completed') ||
        employeeTasks[employeeTasks.length - 1];
    }

    if (!taskToUpdate) {
      return twimlResponse(`Hi ${name}! No active tasks found to update.`);
    }

    // Update status in the full tasks array
    const idx = tasks.findIndex((t: any) => t.id === taskToUpdate.id);
    const oldStatus = tasks[idx].status;
    tasks[idx].status = newStatus;
    await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');

    console.log(`[twilio webhook] Task "${taskToUpdate.title}" updated: ${oldStatus} → ${newStatus}`);

    // Build confirmation reply
    const icon =
      newStatus === 'Completed' ? '✅' :
      newStatus === 'In Progress' ? '⚡' :
      newStatus === 'Blocked' ? '🛑' : '⏳';

    const replyMsg =
      `${icon} *Task Updated!*\n\n` +
      `📋 *Task:* ${taskToUpdate.title}\n` +
      `*Old Status:* ${oldStatus}\n` +
      `*New Status:* ${newStatus}\n\n` +
      (newStatus === 'Completed' ? `Great work, ${name}! 🎉` : `Got it, ${name}! Keep it up 💪`);

    return twimlResponse(replyMsg);

  } catch (err: any) {
    console.error('[twilio webhook] Error:', err);
    // Always return 200 to Twilio to prevent retries
    return twimlResponse('');
  }
}

/**
 * Returns a Twilio Messaging Response (TwiML) that sends a WhatsApp reply.
 * If message is empty, Twilio sends nothing back.
 */
function twimlResponse(message: string): Response {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
