/**
 * Runs the live role suite with one run id for the whole run.
 *
 *   npm run test:roles                  # the API must be on :8080; BOOTSTRAP_ADMIN_PASSWORD set
 *   npm run test:roles -- --headed
 *   npm run test:roles -- -g "confirms the booking"
 *
 * Why a runner rather than calling playwright directly: the suite creates records stamped with a run
 * id, and Playwright restarts the worker process whenever a test fails. A run id generated inside the
 * spec would therefore change halfway through a failing run - the customer registered under one id,
 * the admin looking for a booking under another - and the report would be nonsense exactly when it
 * matters most. Here it is generated once and handed to every worker through the environment.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const runId = process.env.LIVE_RUN_ID ?? `E2E${Date.now().toString(36).toUpperCase()}`

console.log(`\n[live] run id ${runId}`)
console.log(`[live] records created by this run are stamped with it and deleted at the end`)
console.log(`[live] set PRATHIBALANKA_SKIP_CLEANUP=1 to keep them\n`)

// The CLI is started through node rather than through npx: a .cmd shim cannot be spawned without a
// shell on Windows, and a shell would mean quoting the arguments back together.
const cli = join(dirname(require.resolve('@playwright/test/package.json')), 'cli.js')

const result = spawnSync(process.execPath, [cli, 'test', '--project=live', ...process.argv.slice(2)], {
  // 'inherit' on purpose: the harness sandbox does not allow a child's output to be captured through
  // pipes, and the suite's output belongs on the terminal anyway.
  stdio: 'inherit',
  env: { ...process.env, LIVE_RUN_ID: runId },
})

if (result.error) {
  console.error(`\n[live] could not start Playwright: ${result.error.message}\n`)
  process.exit(1)
}

process.exit(result.status ?? 1)
