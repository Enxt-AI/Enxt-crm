import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

async function sendWhatsApp(
  to: string,
  body: string,
  template?: { name: string; parameters: string[] }
): Promise<boolean> {
  try {
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // Format destination number for Meta
    let cleanTo = to.trim();
    if (cleanTo.startsWith('whatsapp:')) {
      cleanTo = cleanTo.substring('whatsapp:'.length);
    }
    const digits = cleanTo.replace(/\D/g, '');
    let formattedTo = digits;

    // If it's a 10-digit number, prepend '91' (default to India country code)
    if (digits.length === 10) {
      formattedTo = `91${digits}`;
    }

    if (whatsappToken && phoneId && !whatsappToken.includes('your_meta_access_token')) {
      const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

      // 1a. Try template first (works outside 24-hour window)
      if (template?.name && template?.parameters) {
        console.log(`[check-timeouts] Trying template "${template.name}" to:`, formattedTo);
        const tRes = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${whatsappToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedTo,
            type: 'template',
            template: {
              name: template.name,
              language: { code: 'en' },
              components: [{
                type: 'body',
                parameters: template.parameters.map(p => ({ type: 'text', text: p })),
              }],
            },
          }),
        });
        const tData = await tRes.json();
        console.log(`[check-timeouts] Template response:`, tData);
        if (tRes.ok) return true;
        console.warn(`[check-timeouts] Template failed, falling back to free-form text`);
      }

      // 1b. Free-form text fallback (works within 24-hour window)
      console.log('[check-timeouts] Dispatching free-form text to:', formattedTo);
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${whatsappToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'text',
          text: { preview_url: false, body },
        }),
      });
      const data = await res.json();
      console.log('[check-timeouts] Meta response:', data);
      return res.ok;
    }

    // 2. Simulation fallback if Meta API is unconfigured
    console.log('-----------------------------------------');
    console.log('SIMULATED WHATSAPP MESSAGE (No API Keys)');
    console.log(`To: ${formattedTo}`);
    console.log(`Body:\n${body}`);
    console.log('-----------------------------------------');
    return true;
  } catch (error) {
    console.error('[check-timeouts] sendWhatsApp error:', error);
    return false;
  }
}

function parseToISTDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    let combined = dateStr;
    if (!combined.includes('T')) {
      const time = timeStr || '18:00';
      combined = `${combined}T${time}`;
    }
    
    // If it doesn't have Z or a timezone offset (like +05:30 or -08:00), append +05:30
    if (!combined.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(combined)) {
      if ((combined.match(/:/g) || []).length === 1) {
        combined = `${combined}:00`;
      }
      combined = `${combined}+05:30`;
    }
    
    return new Date(combined);
  } catch (e) {
    console.error('[check-timeouts] Error parsing IST date:', dateStr, timeStr, e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const now = new Date();
    const nowTime = now.getTime();

    // 1. Batch update all expired requests to 'not_replied'
    const { data: expiredRequests, error: expiredError } = await supabase
      .from('status_requests')
      .select('id, employee_name')
      .eq('status', 'sent')
      .lt('reply_deadline', now.toISOString());

    if (expiredError) throw expiredError;

    let expiredCount = 0;
    if (expiredRequests && expiredRequests.length > 0) {
      const expiredIds = expiredRequests.map((r: any) => r.id);
      const { error: updateError } = await supabase
        .from('status_requests')
        .update({ status: 'not_replied' })
        .in('id', expiredIds);
        
      if (updateError) throw updateError;
      expiredCount = expiredIds.length;
      
      console.log(`[status-requests/check-timeouts] Marked ${expiredCount} requests as not_replied:`,
        expiredRequests.map((r: any) => r.employee_name).join(', ')
      );
    }

    // 2. Check for tasks due in less than 1 hour
    const oneHourMs = 60 * 60 * 1000;
    
    // Load sent state from key-value store
    const { data: reminderState } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'task_reminders_sent')
      .single();
      
    const sentReminders = reminderState?.data || {};

    const { data: deadlineState } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'task_deadlines_reached')
      .single();
      
    const sentDeadlines = deadlineState?.data || {};

    // Fetch all incomplete tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'Completed');
      
    if (tasksError) throw tasksError;

    // Load active employees
    const { data: docsData } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'documents')
      .single();
      
    const docs = docsData?.data || [];
    const employees = docs.filter((d: any) => d.type === 'employee');
    const employeeMap = new Map();
    employees.forEach((e: any) => employeeMap.set(e.id, e));

    let tasksReminderSent = 0;
    let deadlinesReachedSent = 0;
    let remindersLogged: string[] = [];

    for (const task of (tasksData || [])) {
      const dueDateTime = parseToISTDate(task.due_date, task.due_time);
      if (!dueDateTime) continue;

      const diffMs = dueDateTime.getTime() - nowTime;

      // 1. Check if task has reached/passed its deadline
      if (diffMs <= 0) {
        if (sentDeadlines[task.id]) continue;

        const formattedDate = dueDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = task.due_time ? ` at ${task.due_time}` : '';
        const deadlineStr = `${formattedDate}${timeStr} (IST)`;

        let sentToAny = false;
        const assignees = task.assigned_employee_ids || [];

        for (const empId of assignees) {
          const emp = employeeMap.get(empId);
          if (!emp) continue;
          const phone = emp.fields?.phone;
          if (!phone) continue;
          const name = emp.fields?.name || emp.title || 'there';

          const freeFormMsg =
            `🚨 *DEADLINE REACHED* 🚨\n\n` +
            `Hi ${name}! Your deadline for this task has been reached:\n\n` +
            `📋 *Title:* ${task.title}\n` +
            `📆 *Deadline:* ${deadlineStr}\n` +
            `🔖 *Current Status:* ${task.status}\n\n` +
            `Please update your task status in the dashboard or request a deadline extension if you need more time.`;

          const ok = await sendWhatsApp(phone, freeFormMsg, {
            name: 'task_deadline_passed',
            parameters: [name, task.title, deadlineStr, task.status],
          });
          if (ok) {
            sentToAny = true;
            remindersLogged.push(`Deadline Reached: ${task.title} -> ${name}`);
          }
        }

        if (sentToAny) {
          sentDeadlines[task.id] = new Date().toISOString();
          deadlinesReachedSent++;
        }
        continue;
      }

      // 2. Check if task is due in <= 1 hour
      if (diffMs > 0 && diffMs <= oneHourMs) {
        if (sentReminders[task.id]) continue;

        const formattedDate = dueDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = task.due_time ? ` at ${task.due_time}` : '';
        const deadlineStr = `${formattedDate}${timeStr} (IST)`;

        let sentToAny = false;
        const assignees = task.assigned_employee_ids || [];

        for (const empId of assignees) {
          const emp = employeeMap.get(empId);
          if (!emp) continue;
          const phone = emp.fields?.phone;
          if (!phone) continue;
          const name = emp.fields?.name || emp.title || 'there';

          const freeFormMsg =
            `⏰ *DEADLINE IN 1 HOUR* ⏰\n\n` +
            `Hi ${name}! This is a friendly reminder that your task is due in 1 hour:\n\n` +
            `📋 *Title:* ${task.title}\n` +
            `📝 *Description:* ${task.description || 'No description provided.'}\n` +
            `📆 *Deadline:* ${deadlineStr}\n` +
            `🔖 *Status:* ${task.status}\n\n` +
            `⚡ Please wrap up your task or update its status in the dashboard.`;

          const ok = await sendWhatsApp(phone, freeFormMsg, {
            name: 'task_due_reminder',
            parameters: [name, task.title, deadlineStr, task.status],
          });
          if (ok) {
            sentToAny = true;
            remindersLogged.push(`${task.title} -> ${name}`);
          }
        }

        if (sentToAny) {
          sentReminders[task.id] = new Date().toISOString();
          tasksReminderSent++;
        }
      }
    }

    // Save reminder state back to app_data
    if (tasksReminderSent > 0) {
      await supabase
        .from('app_data')
        .upsert({ key: 'task_reminders_sent', data: sentReminders });
    }

    // Save deadline state back to app_data
    if (deadlinesReachedSent > 0) {
      await supabase
        .from('app_data')
        .upsert({ key: 'task_deadlines_reached', data: sentDeadlines });
    }

    // 3. Trigger daily check-ins (morning/midday/evening)
    // Resilient approach: check ALL schedules on every call.
    // If we're past the trigger time and it hasn't been sent today, send it.
    // This works even if the cron fires late or infrequently.
    const istNow = new Date(nowTime + 5.5 * 60 * 60 * 1000);
    const istHour = istNow.getUTCHours();
    const todayIST = istNow.toISOString().split('T')[0];

    // Only send check-ins on weekdays (Mon=1 to Fri=5)
    const dayOfWeek = istNow.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    const schedules: { label: 'morning' | 'midday' | 'evening'; hour: number }[] = [
      { label: 'morning', hour: 10 },
      { label: 'midday', hour: 13 },
      { label: 'evening', hour: 18 },
    ];

    const schedulesTriggered: { schedule: string; result: string }[] = [];

    if (isWeekday) {
      for (const sched of schedules) {
        // Only trigger if we're past the schedule time
        if (istHour < sched.hour) continue;

        try {
          // Check if already sent today
          const { data: existing, error: existError } = await supabase
            .from('status_requests')
            .select('id')
            .eq('schedule_label', sched.label)
            .gte('scheduled_time', `${todayIST}T00:00:00+05:30`)
            .lte('scheduled_time', `${todayIST}T23:59:59+05:30`)
            .limit(1);

          if (existError) throw existError;

          if (existing && existing.length > 0) {
            console.log(`[check-timeouts] ${sched.label} already sent today. Skipping.`);
            schedulesTriggered.push({ schedule: sched.label, result: 'already_sent' });
            continue;
          }

          // Trigger send
          const requestUrl = new URL(request.url);
          const origin = requestUrl.origin;
          console.log(`[check-timeouts] Triggering ${sched.label} check-in send at ${origin}`);

          const sendRes = await fetch(`${origin}/api/status-requests/send?schedule=${sched.label}`);
          const sendData = await sendRes.json();
          schedulesTriggered.push({
            schedule: sched.label,
            result: `sent: ${sendData.sent || 0}, failed: ${sendData.failed || 0}`,
          });
        } catch (err: any) {
          console.error(`[check-timeouts] Failed to trigger ${sched.label}:`, err);
          schedulesTriggered.push({ schedule: sched.label, result: `error: ${err.message}` });
        }
      }
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      tasksReminderSent,
      remindersLogged,
      isWeekday,
      currentISTHour: istHour,
      schedulesTriggered,
    });

  } catch (error: any) {
    console.error('[status-requests/check-timeouts] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
