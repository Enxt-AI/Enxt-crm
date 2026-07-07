import { execSync } from 'child_process';

const parentDir = 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final';

try {
  console.log('--- List of files tracked in parent repository ---');
  const files = execSync('git ls-files', { cwd: parentDir, encoding: 'utf-8' });
  const fileLines = files.split('\n').filter(Boolean);
  
  // Show first 15 files and a summary
  console.log(fileLines.slice(0, 15).join('\n'));
  console.log(`\nTotal tracked files: ${fileLines.length}`);
  
  const hasEnxtBrainFiles = fileLines.some(f => f.startsWith('EnxtBrain/'));
  console.log(`Are files inside EnxtBrain/ tracked? ${hasEnxtBrainFiles ? 'Yes' : 'No'}`);
  
} catch (err) {
  console.error('Error running git ls-files:', err.message);
}
