const supabaseUrl = 'https://ngugtavyedqodakuhmqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndWd0YXZ5ZWRxb2Rha3VobXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI5NDA5NywiZXhwIjoyMDk3ODcwMDk3fQ.JNfznpkiqjnpMmf6pWdFzMmHYUxhxX8NF-7vGNtpGFM';

async function run() {
  try {
    console.log('Fetching live documents from Supabase...');
    const res = await fetch(`${supabaseUrl}/rest/v1/app_data?key=eq.documents`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const data = await res.json();
    const docs = data?.[0]?.data || [];
    
    console.log(`\n--- Supabase Document Registry (Count: ${docs.length}) ---`);
    if (docs.length === 0) {
      console.log('No documents found in Supabase key "documents".');
      return;
    }
    
    // Print first 3 documents
    console.log('Sample Documents:');
    docs.slice(0, 3).forEach(doc => {
      console.log(`- ID: ${doc.id}, Type: ${doc.type}, Title: "${doc.title}"`);
      if (doc.type === 'employee') {
        console.log(`  Name: ${doc.fields?.name}, Phone: ${doc.fields?.phone}, Status: ${doc.fields?.status}`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
