import { execSync } from 'child_process';

const parentDir = 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final';

async function main() {
  try {
    // We use --mixed to only reset the Git index, not touching files on the disk.
    // This avoids any folder locks / "Directory not empty" prompts!
    console.log('1. Resetting parent Git index (safe --mixed mode)...');
    execSync('git reset --mixed origin/main', { cwd: parentDir, stdio: 'inherit' });

    console.log('2. Staging latest EnxtBrain commit...');
    execSync('git add EnxtBrain', { cwd: parentDir, stdio: 'inherit' });

    console.log('3. Committing change...');
    execSync('git commit -m "chore: update EnxtBrain submodule pointer"', { cwd: parentDir, stdio: 'inherit' });

    console.log('4. Pushing to GitHub (origin main)...');
    execSync('git push origin main', { cwd: parentDir, stdio: 'inherit' });

    console.log('\n🎉 Successfully updated and pushed parent submodule reference to GitHub!');
  } catch (err) {
    console.error('\n❌ Git operation failed:', err.message);
  }
}

main();
