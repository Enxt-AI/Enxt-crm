import fs from 'fs';

try {
  fs.rmSync('.vercel', { recursive: true, force: true });
  console.log('✅ Local Vercel configuration folder (.vercel) has been successfully deleted!');
  console.log('You are now completely unlinked from "netflix".');
} catch (e) {
  console.error('Failed to delete .vercel folder:', e.message);
}
