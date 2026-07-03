import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

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

async function saveMessageToDB(from: string, employeeName: string, text: string, type: 'inbound' | 'outbound') {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'whatsapp_messages')
      .single();

    // Ignore PGRST116 (not found)
    const messages = (data?.data) || [];
    messages.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      from,
      employeeName,
      text,
      timestamp: new Date().toISOString(),
      type
    });

    await supabase
      .from('app_data')
      .upsert({ key: 'whatsapp_messages', data: messages });
  } catch (err) {
    console.error("[whatsapp webhook] Failed to save message to Supabase", err);
  }
}

async function processWebhookPayload(payload: any) {
  try {
    // Extract message data
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return;
    }

    const from = message.from;
    const textBody = message.text?.body?.trim();

    if (!from || !textBody) {
      return;
    }

    console.log(`[whatsapp webhook bg-worker] Inbound from ${from}: "${textBody}"`);

    // Fetch documents from Supabase
    const { data: docData } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'documents')
      .single();

    const documents = docData?.data || [];
    const cleanFrom = from.replace(/\D/g, '');

    // Find employee
    const employee = documents.find((doc: any) => {
      if (doc.type !== 'employee') return false;
      const phone = doc.fields?.phone;
      if (!phone) return false;
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.includes(cleanFrom) || cleanFrom.includes(cleanPhone);
    });

    const employeeName = employee?.fields?.name || employee?.title || "Unknown User";

    // Save INBOUND message
    await saveMessageToDB(from, employeeName, textBody, 'inbound');

    // ── CHECK FOR PENDING STATUS REQUEST ──────────────────────────
    let handledAsStatusRequest = false;
    try {
      const phoneLast10 = cleanFrom.slice(-10);
      console.log(`[whatsapp webhook bg-worker] Looking for pending status request with phone matching: %${phoneLast10}%`);
      
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('status_requests')
        .select('*')
        .eq('status', 'sent')
        .ilike('employee_phone', `%${phoneLast10}%`)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (pendingError) {
        console.error(`[whatsapp webhook bg-worker] ❌ Error querying status_requests:`, pendingError);
      }
      
      console.log(`[whatsapp webhook bg-worker] Found ${pendingRequests?.length || 0} pending requests`);

      if (pendingRequests && pendingRequests.length > 0) {
        const req = pendingRequests[0];
        const now = new Date().toISOString();
        
        console.log(`[whatsapp webhook bg-worker] Updating request ${req.id} for ${req.employee_name} with text: "${textBody}"`);

        // Update the status request with the reply
        const { error: updateError } = await supabase
          .from('status_requests')
          .update({
            status: 'replied',
            reply_time: now,
            update_text: textBody,
          })
          .eq('id', req.id);

        if (updateError) {
          console.error(`[whatsapp webhook bg-worker] ❌ Error updating status_request:`, updateError);
        } else {
          console.log(`[whatsapp webhook bg-worker] ✓ Successfully updated status_request ${req.id} to replied`);
        }

        console.log(`[whatsapp webhook bg-worker] ✓ Status update captured from ${employeeName} for request ${req.id}`);

        // Send acknowledgment
        await replyToWhatsApp(
          from,
          employeeName,
          `✅ Thank you ${employeeName}! Your status update has been recorded.\n\n📋 *Project:* ${req.project || 'General'}\n📝 *Your Update:* ${textBody}\n\nYour manager can now see this update on the dashboard.`
        );

        // ── AUTO-GENERATE PROJECT REPORT (EXACT RESPONSE) ─────────
        try {
          const docId = `doc-report-${Date.now()}`;
          const reportBody = `# Project Status Update\n\n**Employee:** ${employeeName}\n**Project:** ${req.project || 'General'}\n**Department:** ${req.department || '--'}\n\n---\n\n${textBody}`;
          
          const newDoc = {
            id: docId,
            type: 'doc',
            title: `Status Report: ${req.project || 'General'} - ${employeeName}`,
            body: reportBody,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            fields: {
              author: employeeName,
              project: req.project || 'General'
            }
          };

          // Load fresh documents to avoid race conditions
          const { data: currentDocData } = await supabase.from('app_data').select('data').eq('key', 'documents').single();
          const allDocs = currentDocData?.data || [];
          allDocs.push(newDoc);
          
          await supabase.from('app_data').upsert({ key: 'documents', data: allDocs });
          await supabase.from('status_requests').update({ report_id: docId }).eq('id', req.id);
          
          console.log(`[whatsapp webhook bg-worker] ✓ Direct report generated and saved as ${docId}`);
        } catch (err) {
          console.error('[whatsapp webhook bg-worker] Failed to generate direct report:', err);
        }

        handledAsStatusRequest = true;
      }
    } catch (statusErr) {
      console.warn('[whatsapp webhook bg-worker] Error checking status requests:', statusErr);
      // Continue with normal processing if status check fails
    }

    if (!employee) {
      console.log(`[whatsapp webhook bg-worker] Phone number ${from} not associated with any employee. Responding as generic AI.`);
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
          const prompt = `You are Enxt Brain, an AI assistant for Enxt. You are talking to a user whose phone number is not recognized in the employee database.
The user sent you this message: "${textBody}"
Reply to them in a helpful, professional, and concise manner. Let them know you are the Enxt Brain AI assistant.`;

          const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
          });

          const responsePayload = await apiResponse.json();
          const answer = responsePayload.candidates?.[0]?.content?.parts?.[0]?.text;

          if (answer) {
            await replyToWhatsApp(from, employeeName, answer);
            return;
          }
        } catch (error) { console.error('[whatsapp webhook bg-worker] Error calling Gemini:', error); }
      }

      await replyToWhatsApp(from, employeeName, `Hi! I am Enxt Brain. Your phone number is not currently associated with any employee record in our system.`);
      return;
    }

    console.log(`[whatsapp webhook bg-worker] Matched employee: ${employeeName}`);

    // Load tasks from Supabase
    let employeeTasks: any[] = [];
    try {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .contains('assigned_employee_ids', [employee.id]);

      if (tasksData) {
        employeeTasks = tasksData;
      }
    } catch (e) {
      console.warn("[whatsapp webhook bg-worker] Could not load tasks from Supabase", e);
    }

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
      if (handledAsStatusRequest) {
        // If it was already handled as a status request, don't fallback to the AI bot.
        return;
      }
      
      console.log(`[whatsapp webhook bg-worker] No status match in text "${textBody}". Forwarding to AI chatbot.`);
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
          const tasksContext = employeeTasks.length > 0
            ? employeeTasks.map((t: any) => `- ${t.title} (Status: ${t.status})`).join('\n')
            : 'No active tasks.';

          const prompt = `You are Enxt Brain, an AI assistant for Enxt. You are talking to an employee named ${employeeName}. 
Their current tasks are:
${tasksContext}

The employee sent you this message: "${textBody}"

Determine if the employee is requesting a deadline extension or a time change for a task.
If they are NOT requesting a deadline extension or time change, reply to their message in a helpful, conversational manner.

If they ARE requesting a deadline extension or time change, you must return a raw JSON object ONLY. Do not wrap it in markdown code blocks, do not add backticks, and do not add any other text. The JSON structure must be:
{
  "isTimeChangeRequest": true,
  "taskTitle": "<exact title of the task from the list above, or the closest match>",
  "requestedDate": "<resolved target date in YYYY-MM-DD format based on relative terms relative to today's date ${new Date().toISOString().split('T')[0]}>",
  "requestedTime": "<resolved target time in HH:MM format, or '18:00' if not specified>",
  "reason": "<reason given by the employee, or 'No reason provided'>"
}
`;

          const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
          });

          const responsePayload = await apiResponse.json();
          const answer = responsePayload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

          if (answer.startsWith('{')) {
            try {
              const parsed = JSON.parse(answer);
              if (parsed.isTimeChangeRequest) {
                // Find matched task
                const matchedTask = employeeTasks.find((t: any) => 
                  t.title.toLowerCase().includes(parsed.taskTitle.toLowerCase()) ||
                  parsed.taskTitle.toLowerCase().includes(t.title.toLowerCase())
                ) || employeeTasks[0]; // fallback to first task if mismatch

                if (matchedTask) {
                  // Save request
                  const { data: currentData } = await supabase
                    .from('app_data')
                    .select('data')
                    .eq('key', 'time_change_requests')
                    .single();

                  const changeRequests = currentData?.data || [];
                  const newRequest = {
                    id: `tcr-${Date.now()}`,
                    taskId: matchedTask.id,
                    taskTitle: matchedTask.title,
                    employeeId: employee.id,
                    employeeName: employeeName,
                    requestedDueDate: parsed.requestedDate,
                    requestedDueTime: parsed.requestedTime,
                    reason: parsed.reason,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                  };
                  changeRequests.push(newRequest);

                  await supabase
                    .from('app_data')
                    .upsert({ key: 'time_change_requests', data: changeRequests });

                  // Send confirmation to employee
                  await replyToWhatsApp(
                    from,
                    employeeName,
                    `📥 *Extension Request Submitted!*\n\nI have requested a deadline change for your task:\n📋 *Task:* ${matchedTask.title}\n📅 *Requested Deadline:* ${parsed.requestedDate} at ${parsed.requestedTime}\n💬 *Reason:* ${parsed.reason}\n\nYour manager has been notified and will review your request.`
                  );
                  return;
                }
              }
            } catch (jsonErr) {
              console.warn('[whatsapp webhook] Failed to parse JSON request from Gemini:', jsonErr);
            }
          }

          if (answer) {
            let replyText = answer;
            if (answer.startsWith('{')) {
              replyText = `Hi ${employeeName}! I couldn't process your request. Please ask your manager directly to change your task deadline or try again with a simpler request.`;
            }
            await replyToWhatsApp(from, employeeName, replyText);
            return;
          }
        } catch (error) { console.error('[whatsapp webhook bg-worker] Error calling Gemini:', error); }
      }

      await replyToWhatsApp(from, employeeName, `Hi ${employeeName}! I couldn't understand that command. Please reply with one of these keywords to update your task status:\n\n- *Completed* (or Done)\n- *In Progress*\n- *Blocked*\n- *Pending*`);
      return;
    }

    if (employeeTasks.length === 0) {
      await replyToWhatsApp(from, employeeName, `You have no tasks assigned to you right now.`);
      return;
    }

    let taskToUpdate = employeeTasks.find((t: any) => {
      const words = t.title.toLowerCase().split(/\s+/);
      return words.some((word: string) => word.length > 2 && lowerText.includes(word));
    });

    if (!taskToUpdate) {
      taskToUpdate = employeeTasks.find((t: any) => t.status !== 'Completed') || employeeTasks[employeeTasks.length - 1];
    }

    if (taskToUpdate) {
      const oldStatus = taskToUpdate.status;

      // Save tasks to Supabase
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskToUpdate.id);

      if (updateError) {
        console.error("[whatsapp webhook bg-worker] Failed to update task in Supabase", updateError);
      } else {
        console.log(`[whatsapp webhook bg-worker] Updated task "${taskToUpdate.title}" from ${oldStatus} to ${newStatus}`);
      }

      let statusIcon = '⏳';
      if (newStatus === 'Completed') statusIcon = '✅';
      if (newStatus === 'In Progress') statusIcon = '⚡';
      if (newStatus === 'Blocked') statusIcon = '🛑';

      const replyMsg = `Task status updated successfully!\n\n📋 *Task:* ${taskToUpdate.title}\n${statusIcon} *New Status:* ${newStatus}`;
      await replyToWhatsApp(from, employeeName, replyMsg);
    }
  } catch (error) {
    console.error('[whatsapp webhook bg-worker] Error processing background worker logic:', error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('[whatsapp webhook] Payload received:', JSON.stringify(payload, null, 2));

    // Defer the heavy execution logic
    processWebhookPayload(payload).catch(err => {
      console.error('[whatsapp webhook bg-worker] Unhandled error:', err);
    });

    // Respond with 200 OK instantly to Meta's server
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[whatsapp webhook] Error handling POST request:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

async function replyToWhatsApp(to: string, employeeName: string, message: string) {
  // Save OUTBOUND message first
  await saveMessageToDB(to, employeeName, message, 'outbound');

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
