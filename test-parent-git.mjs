import { execSync } from 'child_process';

try {
  console.log('--- Parent Git Status ---');
  const parentStatus = execSync('git status', { cwd: 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final', encoding: 'utf-8' });
  console.log(parentStatus);

  console.log('--- Parent Git Remote ---');
  const parentRemote = execSync('git remote -v', { cwd: 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final', encoding: 'utf-8' });
  console.log(parentRemote);

  console.log('--- Parent Git Last 3 Commits ---');
  const parentLog = execSync('git log -n 3', { cwd: 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final', encoding: 'utf-8' });
  console.log(parentLog);
} catch (err) {
  console.error('Error running git in parent directory:', err.message);
}
