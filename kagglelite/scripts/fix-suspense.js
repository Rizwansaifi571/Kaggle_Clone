const fs = require('fs');
const files = [
  'src/app/login/page.tsx',
  'src/app/2fa/page.tsx',
  'src/app/reset-password/page.tsx',
  'src/app/verify-email/page.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Suspense')) {
    if (content.includes('import { useState')) {
      content = content.replace('import { useState', 'import { useState, Suspense');
    } else {
      content = content.replace(`import { `, `import { Suspense, `);
    }
    content = content.replace('export default function ', 'function ');
    const funcNameMatch = content.match(/function ([A-Za-z0-9_]+)\(/);
    if (funcNameMatch) {
       const funcName = funcNameMatch[1];
       content += '\n\nexport default function ' + funcName + 'Page() {\n  return <Suspense fallback={<div className=\"flex justify-center p-8\"><Loader2 className=\"animate-spin text-kaggle-blue w-8 h-8\" /></div>}><' + funcName + ' /></Suspense>;\n}\n';
    }
    fs.writeFileSync(file, content);
  }
}
