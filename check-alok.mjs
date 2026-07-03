import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#\s][^=]*)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function check() {
  try {
    // 1. Fetch employees
    const empRes = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.documents`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const empData = await empRes.json();
    const documents = empData?.[0]?.data || [];
    const activeEmployees = documents.filter(d => 
      d.type === 'employee' && 
      String(d.fields?.status || '').toLowerCase() === 'active' &&
      d.fields?.phone
    );

    // 2. Fetch tasks
    const tasksRes = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const tasks = await tasksRes.json();

    console.log("=== Active Employees & Automated Send Checks ===");
    for (const emp of activeEmployees) {
      console.log(`\n👤 Employee: ${emp.fields?.name} (ID: ${emp.id})`);
      console.log(`   Phone: ${emp.fields?.phone}`);
      
      // Find assigned tasks
      const empTasks = tasks.filter(t => (t.assigned_employee_ids || []).includes(emp.id));
      console.log(`   Assigned Tasks:`);
      if (empTasks.length === 0) {
        console.log(`     (None)`);
      } else {
        empTasks.forEach(t => {
          console.log(`     - "${t.title}" (Status: ${t.status}, ID: ${t.id})`);
        });
      }

      // Simulation of status-requests/send check
      const activeTask = tasks.find(t => 
        t.status !== 'Completed' && 
        (t.assigned_employee_ids || []).includes(emp.id)
      );
      if (activeTask) {
        console.log(`   ✅ WILL SEND: Active Task found: "${activeTask.title}"`);
      } else {
        console.log(`   ❌ SKIPPED: No active (incomplete) task found for this employee.`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

check();
