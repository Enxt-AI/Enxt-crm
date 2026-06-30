// No dependencies needed - uses built-in fetch
async function diagnose() {
  try {
    // 1. Fetch all status requests for today
    const res = await fetch('http://localhost:3000/api/status-requests');
    const data = await res.json();
    
    if (!data.requests || data.requests.length === 0) {
      console.log("No status requests found for today.");
      return;
    }
    
    console.log(`Found ${data.requests.length} status requests for today:\n`);
    
    data.requests.forEach((req, i) => {
      const phone = req.employee_phone || '(empty)';
      const cleanPhone = phone.replace(/\D/g, '');
      const last10 = cleanPhone.slice(-10);
      
      console.log(`${i+1}. ${req.employee_name}`);
      console.log(`   Phone stored in DB: "${phone}"`);
      console.log(`   Clean phone: "${cleanPhone}"`);
      console.log(`   Last 10 digits: "${last10}"`);
      console.log(`   Status: ${req.status}`);
      console.log(`   update_text: "${req.update_text || '(empty)'}"`);
      console.log('');
    });

    // 2. Now fetch the whatsapp messages to see what "from" number the webhook received
    const msgRes = await fetch('http://localhost:3000/api/whatsapp/messages');
    const msgData = await msgRes.json();
    
    if (msgData.messages && msgData.messages.length > 0) {
      // Get last 5 inbound messages
      const inbound = msgData.messages.filter(m => m.type === 'inbound').slice(-5);
      console.log(`\nLast ${inbound.length} inbound WhatsApp messages:\n`);
      inbound.forEach((msg, i) => {
        const cleanFrom = msg.from.replace(/\D/g, '');
        const last10 = cleanFrom.slice(-10);
        console.log(`${i+1}. From: "${msg.from}" (clean: "${cleanFrom}", last10: "${last10}")`);
        console.log(`   Employee: ${msg.employeeName}`);
        console.log(`   Text: "${msg.text}"`);
        console.log('');
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

diagnose();
