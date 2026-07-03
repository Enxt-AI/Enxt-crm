const supabaseUrl = 'https://ngugtavyedqodakuhmqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndWd0YXZ5ZWRxb2Rha3VobXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI5NDA5NywiZXhwIjoyMDk3ODcwMDk3fQ.JNfznpkiqjnpMmf6pWdFzMmHYUxhxX8NF-7vGNtpGFM';

async function run() {
  try {
    console.log('Fetching tasks...');
    const tasksRes = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!tasksRes.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksRes.statusText}`);
    }
    
    const tasks = await tasksRes.json();
    if (!tasks || tasks.length === 0) {
      console.log('No tasks found in the database. Please create a task first in the dashboard.');
      return;
    }

    // Find first incomplete task
    const task = tasks.find(t => t.status !== 'Completed') || tasks[0];
    const employeeId = task.assigned_employee_ids?.[0] || 'emp-1';
    
    console.log(`Using Task: "${task.title}" (ID: ${task.id})`);
    console.log(`Using Employee ID: ${employeeId}`);

    // Fetch employee name from documents
    console.log('Fetching employees...');
    const docRes = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.documents`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!docRes.ok) {
      throw new Error(`Failed to fetch employees: ${docRes.statusText}`);
    }
    
    const docData = await docRes.json();
    const documents = docData?.[0]?.data || [];
    const emp = documents.find(d => d.id === employeeId);
    const employeeName = emp?.fields?.name || emp?.title || 'Unknown Employee';
    
    console.log(`Found Employee Name: ${employeeName}`);

    // Load existing requests
    console.log('Fetching existing requests...');
    const reqRes = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.time_change_requests`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!reqRes.ok) {
      throw new Error(`Failed to fetch requests: ${reqRes.statusText}`);
    }

    const reqData = await reqRes.json();
    const requests = reqData?.[0]?.data || [];
    
    // Clear any previous mock requests to avoid clutter
    const cleanedRequests = requests.filter(r => !r.id.startsWith('tcr-mock-'));

    // Add mock request with matching name and ID
    const mockRequest = {
      id: `tcr-mock-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      employeeId: employeeId,
      employeeName: employeeName,
      requestedDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      requestedDueTime: '18:00',
      reason: 'Need extra time to polish the WhatsApp API integration',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    cleanedRequests.push(mockRequest);

    console.log('Upserting requests...');
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/app_data`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key: 'time_change_requests', data: cleanedRequests })
    });

    if (!upsertRes.ok) {
      throw new Error(`Failed to upsert request: ${upsertRes.statusText}`);
    }

    console.log(`\n✅ Mock time change request for "${employeeName}" successfully inserted!`);
    console.log('\nInstructions:');
    console.log('1. Refresh your dashboard at http://localhost:3000.');
    console.log('2. Click on the "Tasks" tab.');
    console.log(`3. You will see a banner: "${employeeName} requested extension for task youtube".`);
    console.log(`4. Click "Approve"—the stopwatch will start ticking next to ${employeeName}'s name!`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
