import fs from 'fs';

const files = ['count-rows.mjs', 'check-db-docs.mjs', 'cleanup-final.mjs'];

files.forEach(file => {
  try {
    fs.rmSync(file, { force: true });
    console.log(`✓ Removed temporary diagnostic file: ${file}`);
  } catch (e) {
    console.warn(`Could not remove ${file}:`, e.message);
  }
});
