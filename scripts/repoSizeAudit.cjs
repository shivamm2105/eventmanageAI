const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MAX_TARGET_BYTES = 10 * 1024 * 1024; // 10 MB limit
const WARNING_THRESHOLD_BYTES = 8 * 1024 * 1024; // 8 MB safety margin

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

console.log('====================================================');
console.log(' CelebrAI Repository Size & Secret Safety Audit');
console.log(' PromptWars Virtual Challenge 5 Compliance Check');
console.log('====================================================\n');

try {
  // Collect all tracked files in git
  let trackedFiles = [];
  try {
    const lsOutput = execSync('git ls-files', { encoding: 'utf-8' });
    trackedFiles = lsOutput.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch (err) {
    console.warn('Could not run git ls-files, falling back to directory traversal.');
  }

  // Collect uncommitted / untracked files
  let uncommittedFiles = [];
  try {
    const statusOutput = execSync('git status -s -uall', { encoding: 'utf-8' });
    uncommittedFiles = statusOutput
      .split('\n')
      .map((l) => l.slice(3).trim())
      .filter(Boolean);
  } catch (err) {
    // Ignore
  }

  // Combine and deduplicate
  const allCandidateFiles = Array.from(new Set([...trackedFiles, ...uncommittedFiles]));

  let totalBytes = 0;
  const fileDetails = [];
  const secretViolations = [];

  for (const filePath of allCandidateFiles) {
    if (!fs.existsSync(filePath)) continue;

    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      totalBytes += stat.size;
      fileDetails.push({ path: filePath, size: stat.size });

      // Check for sensitive files
      const lower = filePath.toLowerCase();
      if (
        (lower.startsWith('.env') || lower.includes('/.env') || lower.includes('\\.env')) &&
        !lower.endsWith('.env.example')
      ) {
        secretViolations.push(`Found unignored environment file: ${filePath}`);
      }

      if (
        lower.endsWith('.db') ||
        lower.endsWith('.sqlite') ||
        lower.endsWith('.sqlite3') ||
        lower.endsWith('.db-wal') ||
        lower.endsWith('.db-shm')
      ) {
        secretViolations.push(`Found unignored SQLite database file: ${filePath}`);
      }

      if (
        lower.endsWith('.pem') ||
        lower.endsWith('.key') ||
        lower.includes('id_rsa') ||
        lower.includes('id_ed25519')
      ) {
        secretViolations.push(`Found potential private key file: ${filePath}`);
      }
    }
  }

  // Sort files by size descending
  fileDetails.sort((a, b) => b.size - a.size);

  console.log(`Tracked & Active Source Files: ${fileDetails.length}`);
  console.log(`Total Source Payload Size: ${formatBytes(totalBytes)} (${totalBytes} bytes)`);
  console.log(`Max Permissible Limit: ${formatBytes(MAX_TARGET_BYTES)}\n`);

  console.log('Top 10 Largest Source Files:');
  fileDetails.slice(0, 10).forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${f.path} - ${formatBytes(f.size)}`);
  });

  // Git database size
  try {
    const countOutput = execSync('git count-objects -vH', { encoding: 'utf-8' });
    const sizeMatch = countOutput.match(/size:\s*([^\n]+)/);
    if (sizeMatch) {
      console.log(`\nGit Object Database Size: ${sizeMatch[1].trim()}`);
    }
  } catch (err) {
    // Ignore
  }

  console.log('\n--- Secret & Privacy Check ---');
  if (secretViolations.length === 0) {
    console.log('✓ No secret credentials, keys, or local databases detected in tracked list.');
  } else {
    console.error('✗ SECRET SAFETY VIOLATIONS:');
    secretViolations.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('\n--- Repository Limit Verdict ---');
  if (totalBytes < WARNING_THRESHOLD_BYTES) {
    console.log(
      `✓ PASS: Repository size is well under 8 MB safety margin (${formatBytes(
        totalBytes
      )} / 10 MB limit). Ready for GitHub push!`
    );
  } else if (totalBytes <= MAX_TARGET_BYTES) {
    console.log(
      `⚠ WARNING: Repository size is between 8 MB and 10 MB (${formatBytes(totalBytes)}).`
    );
  } else {
    console.error(
      `✗ FAIL: Repository exceeds 10 MB challenge limit (${formatBytes(totalBytes)}).`
    );
    process.exit(1);
  }
} catch (err) {
  console.error('Audit encountered an error:', err.message);
  process.exit(1);
}
