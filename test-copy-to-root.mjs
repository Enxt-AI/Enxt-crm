import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const parentDir = 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final';
const childDir = path.join(parentDir, 'EnxtBrain');

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip git folders, node_modules, and build output
    if (
      entry.name === '.git' ||
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === 'out'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  try {
    console.log('1. Copying latest code from EnxtBrain to parent root folder...');
    copyDir(childDir, parentDir);
    console.log('✅ Copy complete.');

    console.log('2. Staging all root files in parent repository...');
    execSync('git add .', { cwd: parentDir, stdio: 'inherit' });

    console.log('3. Committing latest files...');
    // We allow it to fail if there are no new changes to commit
    try {
      execSync('git commit -m "feat: sync latest EnxtBrain changes to parent root"', { cwd: parentDir, stdio: 'inherit' });
    } catch (e) {
      console.log('Nothing new to commit or commit succeeded.');
    }

    console.log('4. Pushing to GitHub (origin main)...');
    execSync('git push origin main', { cwd: parentDir, stdio: 'inherit' });

    console.log('\n🎉 Successfully synced all changes to parent root and pushed to GitHub!');
  } catch (err) {
    console.error('\n❌ Sync failed:', err.message);
  }
}

main();
