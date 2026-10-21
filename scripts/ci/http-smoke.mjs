import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const [project, receiptPath] = process.argv.slice(2);
const probe = createServer();
await new Promise((resolve, reject) => {
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', resolve);
});
const port = probe.address().port;
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [
  '--import', path.join(project, 'scripts/sites-env.mjs'),
  path.join(project, 'node_modules/wrangler/bin/wrangler.js'),
  'dev', '--config', 'dist/server/wrangler.json', '--local',
  '--persist-to', '.wrangler/ci-state', '--ip', '127.0.0.1',
  '--port', String(port), '--inspector-port', '0',
], {
  cwd: project, detached: true, stdio: ['ignore', 'inherit', 'inherit'],
  env: { ...process.env, CLOUDFLARE_CF_FETCH_ENABLED: 'false', WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false' },
});
let exited = false;
const closed = new Promise(resolve => {
  child.once('error', error => { exited = true; resolve(error); });
  child.once('close', () => { exited = true; resolve(); });
});
const receipt = { schema_version: 1, loopback_only: true, synthetic_requests: true, checks: [], cleanup: false };
async function request(route, options = {}) {
  return fetch(origin + route, { ...options, signal: AbortSignal.timeout(2_000), redirect: 'error' });
}
async function rpc(method, params = {}) {
  return request('/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
}
function signalGroup(signal) {
  if (!child.pid) return;
  try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; }
}
async function cleanup() {
  signalGroup('SIGTERM');
  await Promise.race([closed, delay(5_000)]);
  signalGroup('SIGKILL');
  await Promise.race([closed, delay(2_000)]);
  let reachable = false;
  try { await request('/'); reachable = true; } catch {}
  receipt.cleanup = exited && !reachable;
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  assert.equal(receipt.cleanup, true, 'Owned application process and loopback listener must stop');
}
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => { void cleanup().finally(() => process.exit(128 + (signal === 'SIGTERM' ? 15 : 2))); });
}
try {
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline && !exited) {
    try {
      const response = await request('/mcp');
      ready = response.status === 405 && response.headers.get('allow') === 'POST';
      await response.body?.cancel();
      if (ready) break;
    } catch {}
    await delay(500);
  }
  assert.equal(ready, true, 'Built application must become ready within 60 seconds');
  receipt.checks.push('built_mcp_route_ready');
  const landing = await request('/');
  assert.equal(landing.status, 200);
  const page = await landing.text();
  assert.ok(page.length <= 1_048_576 && page.includes('NextDNS'));
  receipt.checks.push('built_landing_page');
  const connection = await request('/api/connection');
  assert.equal(connection.status, 401);
  await connection.body?.cancel();
  receipt.checks.push('anonymous_connection_denied');
  const discovery = await rpc('tools/list');
  assert.equal(discovery.status, 200);
  const tools = (await discovery.json()).result.tools;
  assert.equal(tools.length, 10);
  assert.ok(tools.some(tool => tool.name === 'get_profile'));
  receipt.checks.push('anonymous_mcp_discovery');
  const call = await rpc('tools/call', { name: 'get_profile', arguments: {} });
  assert.equal(call.status, 401);
  await call.body?.cancel();
  receipt.checks.push('anonymous_mcp_account_access_denied');
} finally {
  await cleanup();
}
