import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

type Schedule = 'morning' | 'midday' | 'evening';

const GREETINGS: Record<Schedule, string> = {
  morning: 'Good Morning',
  midday: 'Good Afternoon',
  evening: 'Good Evening',
};

const SCHEDULE_TIMES: Record<Schedule, string> = {
  morning: '10:00',
  midday: '13:00',
  evening: '18:00',
};

function detectSchedule(): Schedule {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istHour = new Date(now.getTime() + istOffset).getUTCHours();

  if (istHour >= 10 && istHour < 13) return 'morning';
  if (istHour >= 13 && istHour < 18) return 'midday';
  return 'evening';
}

function buildStatusMessage(employeeName: string, schedule: Schedule, project: string): string {
  const greeting = GREETINGS[schedule];
  const projectLine = project ? `\n📂 *Project:* ${project}` : '';

  return (
    `${greeting} ${employeeName} 👋\n\n` +
    `Please provide your current project status.${projectLine}\n\n` +
    `⏰ Kindly reply within the next *30 minutes*.\n\n` +
    `📊 Your update will automatically be shared with your manager.`
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scheduleParam = url.searchParams.get('schedule') as Schedule | null;
    const schedule: Schedule = scheduleParam && ['morning', 'midday', 'evening'].includes(scheduleParam)
      ? scheduleParam
      : detectSchedule();

    console.log(`[status-requests/send] Sending ${schedule} status requests...`);

    // Load employees from Supabase
    const { data: docData } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'documents')
      .single();

    const documents = docData?.data || [];
    const activeEmployees = documents.filter((doc: any) =>
      doc.type === 'employee' &&
      String(doc.fields?.status || '').toLowerCase() === 'active' &&
      doc.fields?.phone
    );

    if (activeEmployees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active employees with phone numbers found.',
        sent: 0,
      });
    }

    // Load tasks to find assigned projects
    const { data: tasksData } = await supabase.from('tasks').select('*');
    const tasks = tasksData || [];

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayIST = istNow.toISOString().split('T')[0];
    const scheduledTime = `${todayIST}T${SCHEDULE_TIMES[schedule]}:00+05:30`;

    const force = url.searchParams.get('force') === 'true';

    // Weekend check: Automated requests run Mon-Fri only. Manual sends (force=true) are allowed on weekends.
    const dayOfWeek = istNow.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (!force && isWeekend) {
      return NextResponse.json({
        success: true,
        message: 'Today is a weekend. Automated status requests run Mon-Fri only. Manual send allowed with force=true.',
        sent: 0,
        skippedWeekend: true,
      });
    }

    // Check if requests for this schedule today already exist
    if (!force) {
      const { data: existing } = await supabase
        .from('status_requests')
        .select('id')
        .eq('schedule_label', schedule)
        .gte('scheduled_time', `${todayIST}T00:00:00+05:30`)
        .lte('scheduled_time', `${todayIST}T23:59:59+05:30`);

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: true,
          message: `Status requests for ${schedule} today have already been sent.`,
          sent: 0,
          alreadySent: existing.length,
        });
      }
    }

    let sentCount = 0;
    let failedCount = 0;
    const results: any[] = [];
    const replyDeadline = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    for (const emp of activeEmployees) {
      const empName = emp.fields?.name || emp.title || 'Team Member';
      const rawPhone = String(emp.fields?.phone || '').trim();
      const cleanDigits = rawPhone.replace(/\D/g, '');

      if (!cleanDigits || cleanDigits.length < 10) {
        console.warn(`[status-requests/send] Skipping ${empName}: invalid phone "${rawPhone}"`);
        failedCount++;
        continue;
      }

      const formattedTo = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const department = emp.fields?.department || emp.fields?.role || '';

      // Find active project/task for this employee
      const empNameLower = (emp.fields?.name || emp.title || '').toLowerCase();
      const empIdLower = (emp.id || '').toLowerCase();

      const empTask = tasks.find((t: any) => {
        if (String(t.status || '').toLowerCase() === 'completed') return false;
        const assigned = t.assigned_employee_ids || [];
        return assigned.some((idOrName: string) => {
          const s = String(idOrName || '').toLowerCase();
          return s === empIdLower || s === empNameLower || (s.length > 3 && empIdLower.includes(s)) || (s.length > 3 && empNameLower.includes(s));
        });
      });

      if (!empTask) {
        console.log(`[status-requests/send] Skipping ${empName} (${formattedTo}): no active task assigned.`);
        continue;
      }

      const project = empTask.title || 'Assigned Project';

      // 1. Prepare Meta WhatsApp direct dispatch
      const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

      const rawMessage = buildStatusMessage(empName, schedule, project);
      const cleanMessageParam = rawMessage.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

      let metaSuccess = false;
      let metaStatus = 0;
      let metaData: any = null;

      if (ACCESS_TOKEN && PHONE_ID) {
        try {
          const metaUrl = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
          const metaRes = await fetch(metaUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: formattedTo,
              type: 'template',
              template: {
                name: 'daily_status_update',
                language: { code: 'en_US' },
                components: [
                  {
                    type: 'body',
                    parameters: [
                      { type: 'text', text: `${GREETINGS[schedule]},` },
                      { type: 'text', text: empName },
                      { type: 'text', text: project }
                    ]
                  }
                ]
              }
            })
          });

          metaStatus = metaRes.status;
          metaSuccess = metaRes.ok;
          metaData = await metaRes.json();
        } catch (err: any) {
          console.error(`[status-requests/send] Meta API error for ${empName}:`, err);
        }
      }

      if (metaSuccess) {
        sentCount++;
        console.log(`[status-requests/send] ✓ Direct Meta dispatch to ${empName} (${formattedTo}): status ${metaStatus}`);

        // Insert tracking row ONLY when WhatsApp message accepted by Meta
        const requestId = `sr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await supabase
          .from('status_requests')
          .insert({
            id: requestId,
            employee_id: emp.id,
            employee_name: empName,
            employee_phone: formattedTo,
            project,
            department,
            schedule_label: schedule,
            scheduled_time: scheduledTime,
            sent_at: now.toISOString(),
            reply_deadline: replyDeadline,
            status: 'sent',
          });

        results.push({ name: empName, phone: formattedTo, status: metaStatus, success: true, metaData });
      } else {
        failedCount++;
        console.error(`[status-requests/send] ✗ Meta dispatch failed for ${empName} (${formattedTo}): status ${metaStatus}`, metaData);
        results.push({ name: empName, phone: formattedTo, status: metaStatus, success: false, metaData });
      }
    }

    return NextResponse.json({
      success: true,
      schedule,
      sent: sentCount,
      failed: failedCount,
      total: activeEmployees.length,
      details: results
    });
  } catch (error: any) {
    console.error('[status-requests/send] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
