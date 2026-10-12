import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const modulePath = require.resolve('miniflare', { paths: [require.resolve('wrangler/package.json')] });
const { Miniflare } = await import(pathToFileURL(modulePath).href);
const core = readFileSync(new URL('../lib/nextdns-core.mjs', import.meta.url), 'utf8');
const fakeKey = 'synthetic-runtime-key-0123456789';

async function invoke(upstream) {
  const mf = new Miniflare({
    modules: true, compatibilityDate: '2026-05-15', compatibilityFlags: ['nodejs_compat'], cf: false,
    script: core + `
      export default { async fetch() {
        try { return Response.json(await nextdns('${fakeKey}', '/profiles/abc123')); }
        catch (error) { return Response.json({code:error.code,message:error.message}, {status:error.status ?? 500}); }
      }};`,
    outboundService: upstream,
  });
  try {
    const response = await mf.dispatchFetch('https://fixture.example/');
    return { status: response.status, value: await response.json() };
  } finally { await mf.dispose(); }
}

test('native Workers fetch reaches NextDNS using the supported redirect mode', async () => {
  let requests = 0;
  const result = await invoke(async request => {
    requests++;
    assert.equal(request.url, 'https://api.nextdns.io/profiles/abc123');
    assert.equal(request.headers.get('X-Api-Key'), fakeKey);
    return Response.json({data:{name:'Synthetic runtime profile'}});
  });
  assert.equal(result.status, 200);
  assert.equal(result.value.data.name, 'Synthetic runtime profile');
  assert.equal(requests, 1);
});

test('native Workers fetch stops on a redirect instead of leaking credentials', async () => {
  let requests = 0;
  const result = await invoke(async () => {
    requests++;
    return new Response(null, {status:302,headers:{Location:'https://outside.example/collect'}});
  });
  assert.equal(result.status, 502);
  assert.equal(result.value.code, 'nextdns_redirect_blocked');
  assert.equal(requests, 1);
});
