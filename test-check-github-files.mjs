async function main() {
  const url = 'https://api.github.com/repos/Enxt-AI/Enxt-crm/contents?ref=main';
  console.log('Fetching repository contents from GitHub API...');
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NodeJS-Agent'
    }
  });

  if (!res.ok) {
    console.error(`Error: GitHub returned status ${res.status}`);
    const errText = await res.text();
    console.error(errText);
    return;
  }

  const files = await res.json();
  console.log('Files tracked at the root of Enxt-AI/Enxt-crm:');
  files.forEach(f => {
    console.log(`  - ${f.name} (${f.type})`);
  });
}

main();
