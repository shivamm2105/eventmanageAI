const fs = require('fs');

function report(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} not found.`);
    return;
  }
  const r = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`\n=== Lighthouse Report: ${filePath} ===`);
  if (r.runtimeError) {
    console.log(`Runtime Error:`, r.runtimeError);
  }
  if (!r.categories) {
    console.log('No categories found.');
    return;
  }
  for (const [key, cat] of Object.entries(r.categories)) {
    const score = cat.score !== null ? Math.round(cat.score * 100) : 'N/A';
    console.log(`- ${cat.title} (${key}): ${score}`);
  }

  console.log('\n--- Failed/Warning Audits ---');
  for (const [id, audit] of Object.entries(r.audits || {})) {
    if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'informative') {
      console.log(`[${id}] ${audit.title} (Score: ${audit.score})`);
      if (audit.explanation) console.log(`   Explanation: ${audit.explanation}`);
      if (audit.displayValue) console.log(`   Value: ${audit.displayValue}`);
    }
  }
}

report(process.argv[2] || './lighthouse-desktop.json');
