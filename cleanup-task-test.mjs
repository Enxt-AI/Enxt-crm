import fs from 'fs';

const files = ['test-task-assignment-local.mjs', 'test-task-assignment.mjs', 'cleanup-task-test.mjs'];

files.forEach(file => {
  try {
    fs.rmSync(file, { force: true });
    console.log(`✓ Removed temporary task script: ${file}`);
  } catch (e) {
    console.warn(`Could not remove ${file}:`, e.message);
  }
});
