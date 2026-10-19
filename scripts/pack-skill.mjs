import { build } from 'esbuild';
import { mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const metadata = JSON.parse(readFileSync('package.json', 'utf8'));
const root = resolve('output/skill-package');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true }); mkdirSync(join(root, 'bin'), { recursive: true });
cpSync('skills', join(root, 'skills'), { recursive: true }); cpSync('LICENSE', join(root, 'LICENSE'));
const dependencyRequire = createRequire(resolve('node_modules/proper-lockfile/package.json'));
for (const dependency of ['proper-lockfile', 'graceful-fs', 'retry', 'signal-exit', 'zod']) {
  const dependencyRoot = dirname(dependencyRequire.resolve(`${dependency}/package.json`));
  const name = readdirSync(dependencyRoot).find(name => /^licen[cs]e(?:\..*)?$/i.test(name));
  if (!name) throw new Error(`Thiếu giấy phép: ${dependency}`);
  const destination = join(root, 'third_party', dependency); mkdirSync(destination, { recursive: true });
  cpSync(join(dependencyRoot, name), join(destination, 'LICENSE'));
}
await build({ entryPoints: ['cli/skill-only.mjs'], outfile: join(root, 'runtime.mjs'), bundle: true, platform: 'node', format: 'esm', target: 'node22', minify: true, legalComments: 'none', banner: { js: "import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);" } });
writeFileSync(join(root, 'bin/token-design-studio-skill.mjs'), "#!/usr/bin/env node\nimport {skillMain} from '../runtime.mjs';\nimport {fileURLToPath} from 'node:url';\ntry { skillMain(process.argv.slice(2), fileURLToPath(new URL('../',import.meta.url))); } catch(error) { console.error('Token Studio skill: '+error.message); process.exitCode=1; }\n");
writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'token-design-studio-skill', version: metadata.version, type: 'module', description: 'Lightweight Token Studio design skill installer for Codex and Antigravity IDE/app', license: 'MIT', engines: metadata.engines, repository: metadata.repository, bin: { 'token-design-studio-skill': 'bin/token-design-studio-skill.mjs' }, files: ['bin/', 'runtime.mjs', 'skills/', 'third_party/', 'LICENSE', 'README.md'] }, null, 2));
writeFileSync(join(root, 'README.md'), `# Token Studio skill ${metadata.version}\n\nNode 22.12+. No editor/server runtime dependencies. No postinstall or automatic MCP setup.\n\nAfter publication:\n\n\`\`\`sh\nnpx token-design-studio-skill@latest install --client codex\nnpx token-design-studio-skill@latest install --client antigravity\n\`\`\`\n\nCodex uses CODEX_HOME or ~/.codex. Antigravity IDE/app uses ~/.gemini/config (not the CLI path). --home PATH selects a client config root. Use doctor --client codex|antigravity to inspect the install. Use install --adopt-known only to adopt a known legacy installation without a manifest. Unknown custom files are refused. Existing customized skills are protected; managed updates retain backups and recovery journals. Reopen the client. Both receive the same skill; Codex alone receives agents/openai.yaml.\n\nProject dossiers: .token-studio/tasks/<UUID>/task.json, references and real evidence stay in the project. Offline record validation: node <installed-skill>/scripts/validate-task.cjs path/to/task.json. Workflow 1.4.0 uses v2 decision-to-criterion-to-check links, scoped SHA-256 snapshots and local verification reports. Run upgrade on v1 files with backups, snapshot with --phase plan|implementation, and verify --project-root ROOT --write. Existing completed v1 history remains legacy. Small refine work uses local-ui notes. File/hash checks do not authenticate reports, images or aesthetic quality. MCP synchronization is optional and requires a running Token Design Studio.\n\nBefore publication, install the local tarball with npm exec --yes --package=./token-design-studio-skill-${metadata.version}.tgz -- token-design-studio-skill install --client codex.\n`);
if (!process.env.npm_execpath) throw new Error('Chạy npm run pack:skill.');
execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--ignore-scripts', '--pack-destination', resolve('output/npm')], { cwd: root, stdio: 'inherit' });
