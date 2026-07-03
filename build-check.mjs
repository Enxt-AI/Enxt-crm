import { execSync } from 'child_process';

try {
  console.log('Running "npm run build" locally to check for compile errors...');
  const output = execSync('npm run build', { encoding: 'utf-8', stdio: 'inherit' });
  console.log('\n✅ Local build succeeded! Your code has no compilation or type errors.');
  console.log('This means any Vercel deployment issues are likely due to Vercel build settings or incorrect git repository mapping.');
} catch (err) {
  console.log('\n❌ Local build failed! Here is the compilation error:');
  // Error output is already printed via stdio: 'inherit'
}
