async function main() {
  const rootRes = await fetch('https://enxt-crm.vercel.app/');
  const html = await rootRes.text();
  
  // Find all script tags
  const regex = /src="\/_next\/static\/chunks\/([^"]+)"/g;
  let match;
  const chunkUrls = [];
  while ((match = regex.exec(html)) !== null) {
    chunkUrls.push(`https://enxt-crm.vercel.app/_next/static/chunks/${match[1]}`);
  }

  console.log(`Found ${chunkUrls.length} script chunks. Searching them for template names...`);
  
  let foundNew = false;
  let foundOld = false;

  for (const url of chunkUrls) {
    const res = await fetch(url);
    const text = await res.text();
    if (text.includes('team_broadcast')) {
      foundNew = true;
      console.log(`✅ Found "team_broadcast" in chunk: ${url}`);
    }
    if (text.includes('company_announcement')) {
      foundOld = true;
      console.log(`⚠️ Found "company_announcement" in chunk: ${url}`);
    }
  }

  if (foundNew && !foundOld) {
    console.log('🎉 Vercel is fully deployed with the latest code (team_broadcast)!');
  } else if (foundOld) {
    console.log('❌ Vercel is still running the old code (company_announcement)!');
  } else {
    console.log('❓ Could not find either template name in front-end chunks. Checking page HTML...');
    if (html.includes('team_broadcast')) {
      console.log('✅ Found team_broadcast in HTML.');
    } else if (html.includes('company_announcement')) {
      console.log('❌ Found company_announcement in HTML.');
    } else {
      console.log('Neither found.');
    }
  }
}

main();
