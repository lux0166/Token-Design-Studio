import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
const dir = resolve('output/evaluations/040/behavior'); mkdirSync(dir, { recursive: true });
const schema = { type: 'object', additionalProperties: false, properties: { cases: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'string' }, nextResponse: { type: 'string' }, implementNow: { type: 'boolean' }, completeNow: { type: 'boolean' }, reason: { type: 'string' } }, required: ['id', 'nextResponse', 'implementNow', 'completeNow', 'reason'] } } }, required: ['cases'] };
writeFileSync(join(dir, 'schema.json'), JSON.stringify(schema));
const prompt = `This is a synthetic behavior walkthrough, not an execution request. Do not call tools, write files or change any configuration. Read the supplied guide, then respond in Vietnamese with the next appropriate response for each independent scenario. Keep each response concise and truthful. Return the required JSON.\n\n${readFileSync('skills/token-studio-shadcn/SKILL.md', 'utf8')}\n${readFileSync('skills/token-studio-shadcn/references/tasks.md', 'utf8')}\n\nScenarios:\n1. id=direction: The user wants a new consulting booking landing page; audience, offering, sections, booking action and local prototype scope are confirmed. They have no brand or reference and have not delegated visual direction. What comes next?\n2. id=grill: The user explicitly says grill me to specify a one-to-one English center; scheduling/cancellation business rules are still unknown. What comes next?\n3. id=token: User explicitly requests radius 8px to 10px in the existing theme; current theme and unlocked radius are confirmed and no business or visual choices remain unknown. What comes next?\n4. id=browser: A new screen has been coded and builds, but browser access and actual screenshots are unavailable. Render verification is a required acceptance condition. What comes next?`;
writeFileSync(join(dir, 'prompt.txt'), prompt);
const home = mkdtempSync(join(tmpdir(), 'studio-behavior-auth-'));
try {
  const auth = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'auth.json'); if (existsSync(auth)) copyFileSync(auth, join(home, 'auth.json'));
  const command = process.platform === 'win32' ? (spawnSync('where.exe', ['codex'], { encoding: 'utf8' }).stdout || '').trim().split(/\r?\n/).find(p => /\.exe$/i.test(p)) : 'codex';
  const started = Date.now(); let stdout = '', stderr = '';
  const code = await new Promise((done, reject) => {
    const child = spawn(command, ['-a', 'never', 'exec', '--ephemeral', '--ignore-user-config', '--skip-git-repo-check', '--sandbox', 'workspace-write', '--json', '--output-schema', join(dir, 'schema.json'), '-o', join(dir, 'response.json'), '-C', dir, '-'], { env: { ...process.env, CODEX_HOME: home }, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const timer = setTimeout(() => child.kill(), 120000); child.stdout.on('data', d => { stdout += d; }); child.stderr.on('data', d => { stderr += d; }); child.stdin.on('error', () => {}); child.on('error', reject); child.on('close', code => { clearTimeout(timer); done(code); }); child.stdin.end(prompt);
  });
  writeFileSync(join(dir, 'stdout.log'), stdout); writeFileSync(join(dir, 'stderr.log'), stderr);
  console.log(JSON.stringify({ code, elapsedMs: Date.now() - started, response: existsSync(join(dir, 'response.json')) ? JSON.parse(readFileSync(join(dir, 'response.json'), 'utf8')) : null }, null, 2));
} finally { rmSync(join(home, 'auth.json'), { force: true }); rmSync(home, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
