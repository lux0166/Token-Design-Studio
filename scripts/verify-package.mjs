import { prepareGrillFixture } from './lib/task-fixture.mjs';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { metadata } from '../cli/paths.mjs';

if (!process.env.npm_execpath) throw new Error('Chạy npm run test:package.');
const npm = (args, cwd = process.cwd()) => {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, encoding: 'utf8', timeout: 120000, windowsHide: true });
  assert.equal(result.status, 0, result.stderr || result.error?.message); return result.stdout;
};
const tarball = resolve(process.argv[2] || `output/npm/${metadata.name}-${metadata.version}.tgz`);
assert.ok(existsSync(tarball), 'Chạy npm run pack:local trước.');
const temp = mkdtempSync(join(tmpdir(), 'token-design-studio-package-'));
const installDir = join(temp, 'clean install'), dataDir = join(temp, 'persistent data'), home = join(temp, 'codex home');
mkdirSync(installDir); mkdirSync(home);
const children = new Set();
const results = [];
const pass = label => { results.push(label); console.log(`PASS ${label}`); };
let client;
async function stop(child) {
  if (child.exitCode === null && child.signalCode === null) { const done = once(child, 'exit'); child.kill(); await done; }
  children.delete(child);
}
let extraServer;
try {
  npm(['install', '--prefix', installDir, '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', tarball]);
  const root = join(installDir, 'node_modules/token-design-studio'), cli = join(root, 'bin/token-design-studio.mjs');
  const installed = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.ok(['0.2.1', '0.3.0', '0.3.1', '0.3.2', '0.4.0'].includes(installed.version), 'Supported release artifact');
  const expectedTools = installed.version === '0.2.1' ? 11 : 17;
  const expectedWorkflow = { '0.2.1': '1.2.0', '0.3.0': '1.3.0', '0.3.1': '1.3.1', '0.3.2': '1.3.2', '0.4.0': '1.4.0' }[installed.version];
  for (const file of ['dist/index.html', 'runtime/server.js', 'runtime/stdio.js', 'skills/token-studio-shadcn/references/design-quality.md', 'third_party/tweakcn/LICENSE', 'third_party/inter/LICENSE']) assert.ok(existsSync(join(root, file)), file);
  for (const file of ['data', 'apps', 'tests', 'docs', 'server', 'src', 'scripts', '.env']) assert.equal(existsSync(join(root, file)), false, file);
  for (const dep of ['tsx', 'vite', 'esbuild', 'react', 'react-dom', 'lucide-react']) assert.equal(existsSync(join(installDir, 'node_modules', dep)), false, dep);
  assert.equal(installed.bin['token-design-studio'], 'bin/token-design-studio.mjs');
  assert.ok(npm(['exec', '--prefix', installDir, '--no', '--', 'token-design-studio', '--version']).includes(installed.version));
  pass('clean tarball install + executable + built assets, no development dependencies');
  assert.ok(npm(['exec', '--yes', '--ignore-scripts', '--cache', join(temp, 'npm cache'), '--package', tarball, '--', 'token-design-studio', '--version'], temp).includes(installed.version));
  pass('npm exec from tarball in an empty directory with a clean npm cache');
  const env = { ...process.env, CODEX_HOME: home }; delete env.STUDIO_DATA_FILE; delete env.STUDIO_DATA_DIR; delete env.PORT;
  const run = args => spawnSync(process.execPath, [cli, ...args], { cwd: temp, env, encoding: 'utf8', timeout: 30000, windowsHide: true });
  const start = (port, directory) => {
    const child = spawn(process.execPath, [cli, '--no-open', '--port', String(port), '--data-dir', directory], { cwd: temp, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    child.output = ''; child.stdout.on('data', d => child.output += d); child.stderr.on('data', d => child.output += d); children.add(child); return child;
  };
  const port = 14378, base = `http://127.0.0.1:${port}`;
  const waitReady = async child => {
    for (let i = 0; i < 180; i++) {
      assert.equal(child.exitCode, null, child.output);
      try { const response = await fetch(`${base}/api/status`, { signal: AbortSignal.timeout(500) }); if (response.ok) { const value = await response.json(); if (value.application === metadata.name) return value; } } catch {}
      await delay(150);
    } throw new Error(child.output || 'Server startup timeout');
  };
  let server = start(port, dataDir);
  const status = await waitReady(server); assert.equal(status.version, installed.version); assert.equal(status.workflowVersion, expectedWorkflow);
  assert.equal(realpathSync(status.stdio.command), realpathSync(process.execPath)); assert.deepEqual(status.stdio.args.map(path => realpathSync(path)), [realpathSync(join(root, 'runtime/stdio.js'))]);
  assert.equal(realpathSync(status.dataFile), realpathSync(resolve(dataDir, 'studio.json')));
  const html = await (await fetch(base)).text(); assert.match(html, /<div id="root">/);
  const asset = html.match(/src="([^"]+\.js)"/)[1]; assert.equal((await fetch(new URL(asset, base))).status, 200);
  assert.equal(run(['--no-open', '--port', String(port), '--data-dir', dataDir]).status, 0);
  const alias = join(temp, 'same data via alias'); symlinkSync(dataDir, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const reusedAlias = run(['--no-open', '--port', String(port), '--data-dir', alias]); assert.equal(reusedAlias.status, 0, reusedAlias.stderr);
  assert.equal(spawnSync(process.execPath, [cli, '--no-open', '--port', String(port), '--data-dir', dataDir], { cwd: temp, env: { ...env, STUDIO_DATA_FILE: join(temp, 'wrong-env.json') }, encoding: 'utf8', timeout: 10000 }).status, 0);
  assert.equal(existsSync(join(temp, 'wrong-env.json')), false);
  assert.equal(run(['--no-open', '--port', String(port), '--data-dir', join(temp, 'other')]).status, 1);
  assert.equal(existsSync(join(temp, 'other/studio.json')), false);
  pass('packaged editor + static assets + compatible reuse + different-store conflict');
  client = new Client({ name: 'package-smoke', version: '1.0.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [cli, 'mcp', '--port', String(port)], cwd: temp, env }));
  assert.equal((await client.listTools()).tools.length, expectedTools);
  const advertised = new Client({ name: 'advertised-desktop-config', version: '1.0.0' });
  try {
    await advertised.connect(new StdioClientTransport({ command: status.stdio.command, args: status.stdio.args, cwd: temp, env: { ...env, STUDIO_MCP_URL: `${base}/mcp` } }));
    assert.equal((await advertised.listTools()).tools.length, expectedTools);
  } finally { await advertised.close(); }
  const call = async (name, args) => {
    const response = await client.callTool({ name, arguments: args }); assert.ok(!response.isError, JSON.stringify(response)); return JSON.parse(response.content[0].text);
  };
  const guide = await call('get_workflow', { mode: 'replicate' }); assert.ok(guide.designQualityGuide.includes('Before code'));
  const created = await call('create_system', { name: 'Packaged persistent system', themeId: 'tweakcn:cyberpunk' });
  const before = await call('get_system', { systemId: created.id });
  await call('update_tokens', { systemId: created.id, expectedRevision: before.revision, patch: { settings: { radius: 17 } } });
  const saved = await (await fetch(`${base}/api/state`)).json(); assert.equal(saved.systems.find(s => s.id === created.id).settings.radius, 17);
  let task;
  if (expectedTools === 17) {
  const taskInput = installed.version === '0.4.0' ? prepareGrillFixture(join(temp, 'task-project'), join(root,'skills/token-studio-shadcn/scripts/validate-task.cjs')).task : { schemaVersion:1, title:'Package grill fixture', goal:'Specify schedule rules', project:'Package verification', mode:'grill-me', acceptanceCriteria:['Rules specified'], artifacts:[{id:'spec',kind:'spec',label:'Specification',path:'.token-studio/tasks/package/SPEC.md'}] };
  task = await call('create_task', {task:taskInput});
  assert.equal((await call('validate_task', { taskId: task.id })).valid, true);
  const completedTask = await call('complete_task', { taskId: task.id, expectedRevision: task.revision }); assert.equal(completedTask.status, 'completed');
  assert.equal((await (await fetch(`${base}/api/state`)).json()).revision, saved.revision);
  }
  await client.close(); client = null;
  pass(`real packaged stdio → HTTP MCP: ${expectedTools} tools, workflow and persisted token writes`);
  const bytes = readFileSync(join(dataDir, 'studio.json'));
  const second = run(['--no-open', '--port', '14379', '--data-dir', dataDir]);
  assert.equal(second.status, 1); assert.deepEqual(readFileSync(join(dataDir, 'studio.json')), bytes);
  pass('cross-port writer lock refuses a second server without data changes');
  await stop(server);
  server = start(port, dataDir); await waitReady(server);
  if (task) assert.equal((await (await fetch(`${base}/api/tasks/${task.id}`)).json()).status, 'completed');
  assert.deepEqual((await (await fetch(`${base}/api/state`)).json()).systems, saved.systems);
  pass('restart/crash-stale-lock recovery preserves systems and history');
  const migrationDir = join(temp, 'migrated');
  assert.equal(run(['migrate', join(dataDir, 'studio.json'), '--data-dir', migrationDir]).status, 0);
  assert.deepEqual(readFileSync(join(migrationDir, 'studio.json')), bytes);
  assert.equal(run(['migrate', join(dataDir, 'studio.json'), '--data-dir', migrationDir]).status, 1);
  const bad = join(temp, 'bad.json'); writeFileSync(bad, '{}');
  assert.equal(run(['migrate', bad, '--data-dir', join(temp, 'invalid')]).status, 1);
  assert.equal(existsSync(join(temp, 'invalid/studio.json')), false);
  const invalidHistory = structuredClone(saved); invalidHistory.systems[0].cursor = 999; writeFileSync(bad, JSON.stringify(invalidHistory));
  assert.equal(run(['migrate', bad, '--data-dir', join(temp, 'invalid-history')]).status, 1);
  assert.equal(existsSync(join(temp, 'invalid-history/studio.json')), false);
  pass('migration validates, copies, preserves source and refuses overwrite');
  writeFileSync(join(home, 'config.toml'), 'model = "gpt-6.1-sol"\n\n[mcp_servers.keep_me]\ncommand = "node"\nargs = ["--version"]\n');
  if (process.env.STUDIO_SKIP_CODEX_SETUP === '1') console.log('SKIP actual Codex setup: not installed on this CI runner; transaction tests still run.');
  else {
  const setup = run(['setup', 'codex', '--port', String(port)]); assert.equal(setup.status, 0, setup.stderr);
  const config = readFileSync(join(home, 'config.toml'), 'utf8'); assert.match(config, /keep_me/); assert.match(config, /14378\/mcp/);
  assert.ok(existsSync(join(home, 'skills/token-studio-shadcn/references/design-quality.md')));
  assert.equal(run(['setup', 'codex', '--port', String(port)]).status, 0);
  assert.equal(run(['setup', 'codex', '--port', '14379']).status, 1);
  assert.equal(readFileSync(join(home, 'config.toml'), 'utf8'), config);
  assert.equal(run(['setup', 'codex', '--port', '14379', '--replace-mcp']).status, 0);
  assert.ok(readdirSync(home).some(file => file.endsWith('.bak')));
  pass('actual Codex CLI setup in isolated home: backup, preservation, repeat, conflict and explicit replace');
  }
  extraServer = createServer((_req, res) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"application":"other"}'); });
  extraServer.listen(14380, '127.0.0.1'); await once(extraServer, 'listening');
  assert.equal(run(['--no-open', '--port', '14380', '--data-dir', join(temp, 'collision')]).status, 1);
  assert.equal(existsSync(join(temp, 'collision/studio.json')), false);
  pass('unrelated occupied port does not create a new store');
  await stop(server);
  console.log(JSON.stringify({ tarball, version: installed.version, checks: results.length, results }, null, 2));
} finally {
  if (client) await client.close();
  if (extraServer) await new Promise(done => extraServer.close(done));
  for (const child of children) await stop(child);
  rmSync(temp, { recursive: true, force: true });
}
