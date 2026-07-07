import fs from 'fs';
import path from 'path';

const parentDir = 'c:\\Users\\jainy\\OneDrive\\Desktop\\slm_final';
const childDir = path.join(parentDir, 'EnxtBrain');

const filesToCheck = [
  'src/app/api/whatsapp/route.ts',
  'src/app/api/whatsapp/send/route.ts',
  'src/components/enxt-brain-app.tsx'
];

filesToCheck.forEach(relPath => {
  const parentFile = path.join(parentDir, relPath);
  const childFile = path.join(childDir, relPath);
  
  console.log(`Checking: ${relPath}`);
  console.log(`  Parent file exists: ${fs.existsSync(parentFile)}`);
  console.log(`  Child file exists: ${fs.existsSync(childFile)}`);
  
  if (fs.existsSync(parentFile) && fs.existsSync(childFile)) {
    const parentContent = fs.readFileSync(parentFile, 'utf-8');
    const childContent = fs.readFileSync(childFile, 'utf-8');
    console.log(`  Are they identical? ${parentContent === childContent ? 'Yes' : 'No'}`);
  }
});
