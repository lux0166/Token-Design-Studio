// Reproduce 0.2.1 from its milestone plus the compatible installer/path fixes.
import { mkdirSync, rmSync, cpSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
if (!process.env.npm_execpath) throw new Error('Chạy npm run pack:legacy.');
const stage = resolve('output/legacy-021-source'), archive = resolve('output/legacy-021-source.tar');
mkdirSync('output', { recursive: true }); rmSync(stage, { recursive: true, force: true }); mkdirSync(stage);
execFileSync('git', ['archive', '--format=tar', `--output=${archive}`, 'c3e8142']);
execFileSync('tar', ['-xf', archive, '-C', stage]);
for (const name of ['main.mjs', 'codex.mjs', 'install-core.mjs']) cpSync(join('cli', name), join(stage, 'cli', name));
const npm = args => execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd: stage, stdio: 'inherit' });
npm(['ci', '--no-audit', '--no-fund']); npm(['test']); npm(['run', 'pack:local']);
mkdirSync('output/npm', { recursive: true }); cpSync(join(stage, 'output/npm/token-design-studio-0.2.1.tgz'), resolve('output/npm/token-design-studio-0.2.1.tgz'));
console.log('Prepared 0.2.1 milestone with compatible installer/path fixes; source snapshot remains in output/legacy-021-source.');
