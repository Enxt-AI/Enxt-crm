import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Fetch active employees list from app_data documents
    const { data: docData, error: docError } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'documents')
      .single();

    if (docError) {
      console.error('[cron-reminders] Failed to load documents:', docError);
      return NextResponse.json({ success: false, error: 'Failed to load documents' }, { status: 500 });
    }

    const documents = docData?.data || [];
    const activeEmployees = documents.filter((d: any) => 
      d.type === 'employee' && 
      String(d.fields?.status || '').toLowerCase() === 'active'
    );

    if (activeEmployees.length === 0) {
      return NextResponse.json({ success: true, message: 'No active employees found' });
    }

    // 2. Fetch all unfinished tasks (Pending, In Progress, Blocked)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'Completed');

    if (tasksError) {
      console.error('[cron-reminders] Failed to load tasks:', tasksError);
      return NextResponse.json({ success: false, error: 'Failed to load tasks' }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending or in-progress tasks found' });
    }

    // 3. Prepare credentials
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!ACCESS_TOKEN || !PHONE_ID) {
      console.error('[cron-reminders] Missing WhatsApp configuration variables');
      return NextResponse.json({ success: false, error: 'WhatsApp config missing' }, { status: 500 });
    }

    const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
    const results: any[] = [];

    // 4. Iterate over tasks and send reminders
    for (const task of tasks) {
      const assignedIds = task.assigned_employee_ids || [];
      if (assignedIds.length === 0) continue;

      for (const empId of assignedIds) {
        const employee = activeEmployees.find((e: any) => e.id === empId);
        if (!employee) continue;

        const employeeName = employee.fields?.name || employee.title || 'Team Member';
        const rawPhone = employee.fields?.phone || '';
        if (!rawPhone) continue;

        const cleanPhone = rawPhone.replace(/\D/g, '');
        const formattedTo = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

        const reminderText = `Friendly reminder: You have a pending task "${task.title}" (Status: ${task.status}) due on ${task.due_date} at ${task.due_time || '18:00'}. Please update your status!`;

        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'template',
          template: {
            name: 'team_broadcast',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: employeeName },
                  { type: 'text', text: reminderText }
                ]
              }
            ]
          }
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          results.push({
            taskId: task.id,
            employeeName,
            phone: formattedTo,
            status: response.status,
            success: response.ok,
            data
          });

          console.log(`[cron-reminders] Sent reminder to ${employeeName} (${formattedTo}): status ${response.status}`);
        } catch (err: any) {
          console.error(`[cron-reminders] Error sending reminder to ${employeeName}:`, err);
          results.push({
            taskId: task.id,
            employeeName,
            phone: formattedTo,
            success: false,
            error: err?.message || err
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersProcessed: results.length,
      details: results
    });
  } catch (err: any) {
    console.error('[cron-reminders] Unhandled error:', err);
    return NextResponse.json({ success: false, error: err?.message || err }, { status: 500 });
  }
}
