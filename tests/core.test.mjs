import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { seal, unseal, nextdns, saveConnection, disconnect, connectionStatus, runTool, handleMcp, normalizeDomain, TOOLS } from '../lib/nextdns-core.mjs';

const apiKey = 'synthetic-test-nextdns-key-0123456789';
const user = 'synthetic-actor-a';
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_outstanding_the_santerians.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() { return sqlite.prepare(sql).get(...args) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...args) }; },
        async run() { const result = sqlite.prepare(sql).run(...args); return { meta: { changes: Number(result.changes) } }; },
      };
    },
    async batch(statements) { const results = []; for (const s of statements) results.push(await s.run()); return results; },
  };
  const env = { DB, NEXTDNS_ENCRYPTION_KEY: Buffer.alloc(32, 17).toString('base64') };
  const profile = { name: 'Synthetic profile', security: { aiThreatDetection: true, tlds: [] }, privacy: { blocklists: [{ id: 'hagezi-pro' }], natives: [], allowAffiliate: true }, denylist: [], allowlist: [], settings: { logs: { enabled: true, drop: { ip: false, domain: false } }, performance: { ecs: true } } };
  const calls = [];
  let rejectDomain = null;
  const fetcher = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://api.nextdns.io');
    assert.equal(options.headers['X-Api-Key'], apiKey);
    assert.equal(options.redirect, 'manual');
    const path = parsed.pathname;
    calls.push({ path, method: options.method, query: Object.fromEntries(parsed.searchParams), body: options.body ? JSON.parse(options.body) : undefined });
    const suffix = path.replace('/profiles/abc123', '');
    if (suffix === '') return Response.json({ data: structuredClone(profile) });
    if (suffix === '/logs') return Response.json({ data: [{ domain: 'metric.example.com', status: 'blocked', clientIp: '192.0.2.1', device: { localIp: '192.0.2.2', name: 'Synthetic device' }, timestamp: '2026-10-12T10:00:00Z', reasons: [{ id: 'blocklist:fixture', name: 'Synthetic list' }] }], meta: { pagination: { cursor: null } } });
    if (suffix.startsWith('/analytics/')) return Response.json({ data: [{ queries: 23 }], meta: { pagination: { cursor: null } } });
    if (suffix.startsWith('/denylist') || suffix.startsWith('/allowlist')) {
      const [, list, encodedId] = suffix.split('/');
      const body = options.body ? JSON.parse(options.body) : null;
      const id = encodedId ? decodeURIComponent(encodedId) : body.id;
      if (rejectDomain === id) return Response.json({ errors: [{ code: 'invalid', detail: 'Synthetic rejection' }] });
      if (options.method === 'POST') profile[list].push(body);
      if (options.method === 'DELETE') profile[list] = profile[list].filter(e => e.id !== id);
      if (options.method === 'PATCH') Object.assign(profile[list].find(e => e.id === id), body);
      return Response.json({ data: null });
    }
    if (options.method === 'PATCH') {
      const parts = suffix.split('/').filter(Boolean);
      let target = profile; for (const part of parts) target = target[part];
      Object.assign(target, JSON.parse(options.body));
      return Response.json({ data: null });
    }
    throw new Error('Unexpected synthetic endpoint');
  };
  return { env, profile, calls, fetcher, sqlite, reject(id) { rejectDomain = id; } };
}
async function connected(writes = false) {
  const f = fixture();
  await saveConnection(f.env, user, { apiKey, profileId: 'abc123', allowWrites: writes }, f.fetcher);
  return f;
}
const writes = f => f.calls.filter(c => c.method !== 'GET');

// Tests focus on credential boundaries, documented API errors, completeness, and write outcomes.
test('API keys are encrypted, nondeterministic and bound to the user', async () => {
  const f = fixture();
  const a = await seal(apiKey, f.env, user);
  const b = await seal(apiKey, f.env, user);
  assert.notEqual(a, b); assert.ok(!a.includes(apiKey));
  assert.equal(await unseal(a, f.env, user), apiKey);
  await assert.rejects(unseal(a, f.env, 'different-user'));
});

test('NextDNS errors in HTTP 200 are failures and key echoes are redacted', async () => {
  await assert.rejects(nextdns(apiKey, '/profiles/abc123', {}, 'GET', undefined,
    async () => Response.json({ errors: [{ code: apiKey, detail: `Rejected ${apiKey}` }] })), error => {
      assert.equal(error.code, 'nextdns_validation_error');
      assert.ok(!error.message.includes(apiKey)); return true;
    });
  await assert.rejects(nextdns(apiKey, '/profiles/abc123', {}, 'GET', undefined, async () => new Response('', { status: 429 })), { code: 'nextdns_rate_limited' });
  await assert.rejects(nextdns(apiKey, 'https://outside.example/profiles/abc123'), { code: 'invalid_request' });
});

test('redirects are surfaced and never followed with the API key', async () => {
  let requests = 0;
  await assert.rejects(nextdns(apiKey, '/profiles/abc123', {}, 'GET', undefined, async (_url, options) => {
    requests++;
    assert.equal(options.redirect, 'manual');
    return new Response(null, { status: 302, headers: { Location: 'https://outside.example/collect' } });
  }), { code: 'nextdns_redirect_blocked' });
  assert.equal(requests, 1);
});

test('MCP discovery is private-data-free; calls require identity and valid origin', async () => {
  const f = fixture();
  const request = (method, extra = {}) => new Request('https://fixture.example/mcp', { method: 'POST', headers: { 'content-type': 'application/json', ...extra }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: { name: 'connection_status', arguments: {} } }) });
  const discover = await (await handleMcp(request('tools/list'), f.env, f.fetcher)).json();
  assert.equal(discover.result.tools.length, 10); assert.ok(!JSON.stringify(discover).includes(apiKey));
  assert.equal((await handleMcp(request('tools/call'), f.env, f.fetcher)).status, 401);
  assert.equal((await handleMcp(request('tools/list', { origin: 'https://attacker.example' }), f.env, f.fetcher)).status, 403);
  const good = await (await handleMcp(request('tools/call', { 'oai-authenticated-user-id': user }), f.env, f.fetcher)).json();
  assert.equal(good.result.structuredContent.configured, false);
  assert.equal(f.calls.length, 0);
  const init = await (await handleMcp(new Request('https://fixture.example/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'initialize', params: { protocolVersion: '2025-06-18' } }) }), f.env)).json();
  assert.equal(init.result.protocolVersion, '2025-06-18');
  assert.equal((await handleMcp(new Request('https://fixture.example/mcp', { method: 'POST', body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) }), f.env)).status, 202);
});

test('public discovery exposes no connected-account data and anonymous calls cannot reach it', async () => {
  const f = await connected(true);
  f.profile.denylist.push({ id: 'private-fixture.example.com', active: true });
  const proposal = await runTool('preview_list_changes', { list: 'allowlist', operation: 'add', entries: ['private-allow-fixture.example.com'] }, f.env, user, f.fetcher);
  const request = (method, params = {}) => new Request('https://fixture.example/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  for (const method of ['initialize', 'tools/list']) {
    const response = await handleMcp(request(method), f.env, f.fetcher);
    assert.equal(response.status, 200);
    const text = await response.text();
    for (const privateValue of [apiKey, user, 'Synthetic profile', 'private-fixture.example.com', proposal.plan_id]) assert.ok(!text.includes(privateValue));
  }
  const before = f.calls.length;
  for (const name of ['connection_status', 'get_profile', 'get_logs', 'recent_changes', 'apply_changes']) {
    const response = await handleMcp(request('tools/call', { name, arguments: name === 'apply_changes' ? { plan_id: proposal.plan_id } : {} }), f.env, f.fetcher);
    assert.equal(response.status, 401);
    assert.ok(!(await response.text()).includes(apiKey));
  }
  assert.equal(f.calls.length, before);
});

test('connections and plans are isolated by actor; disconnect is actor-scoped', async () => {
  const f = await connected(true);
  const row = f.sqlite.prepare('SELECT * FROM nextdns_connections WHERE user_id=?').get(user);
  assert.ok(!row.encrypted_key.includes(apiKey));
  assert.ok(!JSON.stringify(await connectionStatus(f.env, user)).includes(apiKey));
  assert.deepEqual(await connectionStatus(f.env, 'actor-b'), { configured: false, allow_writes: false });
  await assert.rejects(runTool('get_profile', {}, f.env, 'actor-b', f.fetcher), { code: 'connection_required' });
  const proposal = await runTool('preview_list_changes', { list: 'denylist', operation: 'add', entries: ['tracker.example.com'] }, f.env, user, f.fetcher);
  await saveConnection(f.env, 'actor-b', { apiKey, profileId: 'abc123', allowWrites: true }, f.fetcher);
  await assert.rejects(runTool('apply_changes', { plan_id: proposal.plan_id }, f.env, 'actor-b', f.fetcher), { code: 'plan_not_found' });
  assert.deepEqual((await runTool('recent_changes', {}, f.env, 'actor-b', f.fetcher)).data, []);
  await disconnect(f.env, 'actor-b');
  assert.equal((await connectionStatus(f.env, user)).configured, true);
});

test('logs redact client and local IPs while preserving cursor and status', async () => {
  const f = await connected();
  const out = await runTool('get_logs', { raw: true, limit: 100, cursor: 'opaque-cursor' }, f.env, user, f.fetcher);
  assert.ok(!JSON.stringify(out).includes('192.0.2.'));
  assert.equal(out.data[0].status, 'blocked');
  assert.equal(out.deduplicated, false);
  assert.equal(f.calls.at(-1).query.raw, '1');
  assert.equal(f.calls.at(-1).query.cursor, 'opaque-cursor');
  const explicit = await runTool('get_logs', { include_client_ips: true }, f.env, user, f.fetcher);
  assert.equal(explicit.data[0].clientIp, '192.0.2.1');
  await assert.rejects(runTool('get_logs', { limit: 1001 }, f.env, user, f.fetcher));
  await assert.rejects(runTool('get_profile', { profile_id: 'another' }, f.env, user, f.fetcher));
});

test('summary explicitly distinguishes a complete small window from a capped sample', async () => {
  const f = await connected();
  const complete = await runTool('summarize_logs', {}, f.env, user, f.fetcher);
  assert.equal(complete.complete_window, true); assert.equal(complete.observed_log_entries, 1);
  assert.equal(complete.domains[0].reasons[0].id, 'blocklist:fixture');
  const many = async (url, options) => {
    if (!new URL(url).pathname.endsWith('/logs')) return f.fetcher(url, options);
    return Response.json({ data: Array.from({ length: 1000 }, (_, i) => ({ domain: `x${i}.example.com`, status: 'default' })), meta: { pagination: { cursor: 'more' } } });
  };
  const sample = await runTool('summarize_logs', { max_entries: 10, top: 2 }, f.env, user, many);
  assert.equal(sample.observed_log_entries, 10); assert.equal(sample.is_sample, true); assert.equal(sample.complete_window, false);
  assert.equal(sample.domains.length, 2); assert.equal(sample.domains_truncated, true);
});

test('analytics builds documented time-series URLs and rejects inappropriate filters', async () => {
  const f = await connected();
  const out = await runTool('get_analytics', { metric: 'domains', series: true, interval: '1h', root: true }, f.env, user, f.fetcher);
  assert.equal(out.data[0].queries, 23);
  assert.equal(f.calls.at(-1).path, '/profiles/abc123/analytics/domains;series');
  assert.equal(f.calls.at(-1).query.timezone, 'Europe/Amsterdam');
  await assert.rejects(runTool('get_analytics', { metric: 'status', root: true }, f.env, user, f.fetcher));
});

test('list previews normalize wildcard inputs, store prior values and make no upstream writes', async () => {
  const f = await connected();
  const out = await runTool('preview_list_changes', { list: 'denylist', operation: 'add', entries: ['*.Tracker.Example.com', 'tracker.example.com'] }, f.env, user, f.fetcher);
  assert.equal(out.changes.length, 1); assert.equal(out.changes[0].id, 'tracker.example.com');
  assert.equal(out.changes[0].before, null); assert.equal(out.changes[0].after.active, true);
  assert.equal(writes(f).length, 0);
  await assert.rejects(runTool('apply_changes', { plan_id: out.plan_id }, f.env, user, f.fetcher), { code: 'writes_disabled' });
  assert.throws(() => normalizeDomain('https://example.com'));
  assert.throws(() => normalizeDomain('example.com/path'));
});

test('apply verifies changes and replay never repeats upstream writes', async () => {
  const f = await connected(true);
  const out = await runTool('preview_list_changes', { list: 'denylist', operation: 'add', entries: ['tracker.example.com'] }, f.env, user, f.fetcher);
  const applied = await runTool('apply_changes', { plan_id: out.plan_id }, f.env, user, f.fetcher);
  assert.equal(applied.status, 'applied'); assert.equal(applied.applied[0].verified, true);
  assert.equal(f.profile.denylist[0].id, 'tracker.example.com');
  await runTool('apply_changes', { plan_id: out.plan_id }, f.env, user, f.fetcher);
  assert.equal(writes(f).length, 1);
});

test('removing one denylist rule preserves other rules and the allowlist', async () => {
  const f = await connected(true);
  f.profile.denylist = [{ id: 'ads.example.com', active: true }, { id: 'keep.example.com', active: true }];
  f.profile.allowlist = [{ id: 'mail.example.com', active: true }];
  const proposal = await runTool('preview_list_changes', { list: 'denylist', operation: 'remove', entries: ['ads.example.com'] }, f.env, user, f.fetcher);
  assert.equal(writes(f).length, 0);
  assert.deepEqual(proposal.changes[0].before, { id: 'ads.example.com', active: true });
  assert.equal(proposal.changes[0].after, null);
  const result = await runTool('apply_changes', { plan_id: proposal.plan_id }, f.env, user, f.fetcher);
  assert.equal(result.status, 'applied');
  assert.deepEqual(f.profile.denylist, [{ id: 'keep.example.com', active: true }]);
  assert.deepEqual(f.profile.allowlist, [{ id: 'mail.example.com', active: true }]);
  assert.equal(writes(f).length, 1);
  assert.equal(writes(f)[0].method, 'DELETE');
  assert.equal(writes(f)[0].path, '/profiles/abc123/denylist/ads.example.com');
});

test('stale, expired and connection-invalidated proposals never write', async () => {
  const f = await connected(true);
  const proposal = () => runTool('preview_setting_changes', { changes: [{ path: 'privacy.allowAffiliate', value: false }] }, f.env, user, f.fetcher);
  const stale = await proposal(); f.profile.privacy.allowAffiliate = false;
  await assert.rejects(runTool('apply_changes', { plan_id: stale.plan_id }, f.env, user, f.fetcher), { code: 'stale_plan' });
  f.profile.privacy.allowAffiliate = true;
  const expired = await proposal();
  f.sqlite.prepare('UPDATE nextdns_change_plans SET expires_at=0 WHERE id=?').run(expired.plan_id);
  await assert.rejects(runTool('apply_changes', { plan_id: expired.plan_id }, f.env, user, f.fetcher), { code: 'plan_expired' });
  const changed = await proposal();
  await saveConnection(f.env, user, { apiKey: '', profileId: 'abc123', allowWrites: true }, f.fetcher);
  await assert.rejects(runTool('apply_changes', { plan_id: changed.plan_id }, f.env, user, f.fetcher), { code: 'connection_changed' });
  assert.equal(writes(f).length, 0);
});

test('a failure mid-plan retains verified writes and never automatically retries', async () => {
  const f = await connected(true);
  f.reject('two.example.com');
  const out = await runTool('preview_list_changes', { list: 'denylist', operation: 'add', entries: ['one.example.com', 'two.example.com', 'three.example.com'] }, f.env, user, f.fetcher);
  const applied = await runTool('apply_changes', { plan_id: out.plan_id }, f.env, user, f.fetcher);
  assert.notEqual(applied.status, 'applied'); assert.equal(applied.applied.length, 1);
  assert.equal(f.profile.denylist.length, 1); assert.equal(applied.auto_retry, false);
  const callsBefore = f.calls.length;
  await runTool('apply_changes', { plan_id: out.plan_id }, f.env, user, f.fetcher);
  assert.equal(f.calls.length, callsBefore);
  const history = await runTool('recent_changes', {}, f.env, user, f.fetcher);
  assert.equal(history.data[0].result.applied[0].before, null);
});

test('nested settings patch only the requested documented field', async () => {
  const f = await connected(true);
  const plan = await runTool('preview_setting_changes', { changes: [{ path: 'settings.logs.drop.ip', value: true }] }, f.env, user, f.fetcher);
  const out = await runTool('apply_changes', { plan_id: plan.plan_id }, f.env, user, f.fetcher);
  assert.equal(out.status, 'applied'); assert.equal(f.profile.settings.logs.drop.ip, true);
  assert.equal(f.profile.settings.logs.drop.domain, false);
  assert.deepEqual(writes(f)[0].body, { ip: true });
  assert.equal(writes(f)[0].path, '/profiles/abc123/settings/logs/drop');
  assert.equal(TOOLS.find(t => t.name === 'apply_changes').annotations.destructiveHint, true);
});
