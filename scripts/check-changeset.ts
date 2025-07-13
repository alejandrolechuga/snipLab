import { execSync } from 'child_process';

try {
  const output = execSync('git status --porcelain .changeset', {
    encoding: 'utf8',
  }).trim();
  if (!output) {
    console.error(
      'Error: No changeset found. Please run "npx changeset" to create one.'
    );
    process.exit(1);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Error running git status:', message);
  process.exit(1);
}
