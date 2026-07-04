const supabaseUrl = 'https://ngugtavyedqodakuhmqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndWd0YXZ5ZWRxb2Rha3VobXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI5NDA5NywiZXhwIjoyMDk3ODcwMDk3fQ.JNfznpkiqjnpMmf6pWdFzMmHYUxhxX8NF-7vGNtpGFM';

async function run() {
  try {
    console.log('Querying all rows in app_data where key = "documents"...');
    const res = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.documents`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const rows = await res.json();
    
    console.log(`\nFound ${rows.length} total rows in database with key "documents"!`);
    
    if (rows.length > 1) {
      console.log('⚠️ DUPLICATE ROWS DETECTED! This is why the changes are disappearing!');
      console.log('Row IDs/Timestamps:');
      rows.forEach((row, i) => {
        console.log(`Row #${i + 1}: Created/Modified at ${row.updated_at || 'Unknown'}, Data size: ${JSON.stringify(row.data).length} chars`);
      });
    } else if (rows.length === 1) {
      console.log('✅ Exactly 1 row found. No duplicates.');
    } else {
      console.log('❌ No rows found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
