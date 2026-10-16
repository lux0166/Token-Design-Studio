import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { defaultDataDirectory } from '../cli/paths.mjs';
test('CLI data defaults are outside the package and portable across OS conventions', () => {
  assert.equal(defaultDataDirectory({ LOCALAPPDATA: 'C:/Users/Test/AppData/Local' }, 'win32', '/home/test'), join('C:/Users/Test/AppData/Local', 'TokenDesignStudio'));
  assert.equal(defaultDataDirectory({}, 'darwin', '/Users/test'), join('/Users/test', 'Library', 'Application Support', 'TokenDesignStudio'));
  assert.equal(defaultDataDirectory({ XDG_DATA_HOME: '/data' }, 'linux', '/home/test'), join('/data', 'token-design-studio'));
});
test('CLI validates commands and port before setup or server side effects', () => {
  const run = args => spawnSync(process.execPath, ['bin/token-design-studio.mjs', ...args], { encoding: 'utf8' });
  assert.equal(run(['--help']).status, 0); assert.equal(run(['unknown']).status, 1);
  assert.equal(run(['setup', 'codex', '--port', 'NaN']).status, 1); assert.equal(run(['start', '--port', '0']).status, 1);
});
test('managed skill updates back up an unchanged old version, then preserve later user edits', t => {
  const home = mkdtempSync(join(tmpdir(), 'studio-cli-skill-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const run = () => spawnSync(process.execPath, ['bin/token-design-studio.mjs', 'install-skill'], { cwd: resolve('.'), env: { ...process.env, CODEX_HOME: home }, encoding: 'utf8' });
  assert.equal(run().status, 0);
  const root = join(home, 'skills/token-studio-shadcn'), path = join(root, 'references/design-quality.md'), manifestPath = join(root, '.token-design-studio.json');
  const old = 'Known previous managed version.\n'; writeFileSync(path, old);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.hashes['references/design-quality.md'] = createHash('sha256').update(old).digest('hex'); writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.equal(run().status, 0);
  const backups = readdirSync(join(home, 'backups/token-studio-shadcn')); assert.equal(backups.length, 1);
  assert.equal(readFileSync(join(home, 'backups/token-studio-shadcn', backups[0], 'references/design-quality.md'), 'utf8'), old);
  const instructions = readFileSync(join(root, 'SKILL.md')); writeFileSync(path, 'My custom policy');
  assert.equal(run().status, 1); assert.equal(readFileSync(path, 'utf8'), 'My custom policy'); assert.deepEqual(readFileSync(join(root, 'SKILL.md')), instructions);
});
