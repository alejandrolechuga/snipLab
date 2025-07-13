import { execSync } from 'child_process';
const base = process.env.GITHUB_BASE_REF || 'master';
try {
  // Ensure CI has the latest main branch data
  execSync(`git fetch origin ${base}`, { stdio: 'ignore' });

  // Check if any changeset file was added in the PR diff
  const output = execSync(
    `git diff --name-only origin/${base}...HEAD .changeset`,
    { encoding: 'utf8' }
  ).trim();

  if (!output || !output.includes('.md')) {
    console.error(
      '❌ Error: No changeset file found in the PR.\n👉 Run "npm run changeset" to create one.'
    );
    process.exit(1);
  }

  console.log('✅ Changeset file detected.');
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌ Error checking for changeset file:', message);
  process.exit(1);
}
