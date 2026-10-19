// Explicit opt-in benchmark. Uses synthetic fixtures; never run as part of npm test.
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const release040 = process.argv.includes('--release-040');
const destination = resolve(release040 ? 'output/evaluations/040/cli-diagnostics' : 'output/evaluations/matrix'); mkdirSync(destination, { recursive: true });
const cases = JSON.parse(readFileSync('docs/evaluation/cases.json', 'utf8')).cases;
const schema = { type: 'object', additionalProperties: false, properties: { html: { type: 'string' }, specification: { type: 'string' }, review: { type: 'string' }, limitations: { type: 'array', items: { type: 'string' } } }, required: ['html', 'specification', 'review', 'limitations'] };
const matrix = ['codex', 'antigravity'].flatMap(client => (release040 ? ['1.3.2','1.4.0'] : ['1.2.0','1.3.0']).flatMap(workflow => cases.map(fixture => ({ client, workflow, case: fixture.id }))));
writeFileSync(join(destination, 'planned.json'), JSON.stringify(matrix, null, 2));
if (!process.argv.includes('--run')) { console.log('Prepared 8 sessions. Use node scripts/evaluate-workflow.mjs --run for actual opt-in execution.'); process.exit(0); }
const isolated = mkdtempSync(join(tmpdir(), 'studio-evaluation-auth-'));
const auth = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'auth.json');
if (existsSync(auth)) cpSync(auth, join(isolated, 'auth.json'));
const files = release040 ? ['SKILL.md','references/interview.md','references/reuse.md','references/design-quality.md','references/tasks.md','references/handoff.md'] : ['SKILL.md','references/design-quality.md'];
// Keep historical benchmark inputs stable when the working-tree workflow changes.
const guide = version => [...files, ...(version === '1.3.0' ? ['references/tasks.md'] : [])].map(file => {
  if (release040 && version==='1.4.0') return readFileSync(join('skills/token-studio-shadcn',file),'utf8');
  const ref = release040 ? 'cc26f76' : version === '1.3.0' ? '9f4bef2' : 'c3e8142';
  const result = spawnSync('git', ['show', `${ref}:skills/token-studio-shadcn/${file}`], { encoding: 'utf8', timeout: 10000 });
  if (result.status !== 0) throw new Error(result.stderr || `Cannot load benchmark input ${ref}:${file}`);
  return result.stdout;
}).join('\n\n');
const results = [];
const executable = client => {
  if (process.platform !== 'win32') return client === 'codex' ? 'codex' : 'agy';
  return (spawnSync('where.exe', [client === 'codex' ? 'codex' : 'agy'], { encoding: 'utf8', windowsHide: true }).stdout || '').trim().split(/\r?\n/).find(path => /\.exe$/i.test(path));
};
async function run(entry) {
  const dir = join(destination, `${entry.client}-${entry.workflow}-${entry.case}`); mkdirSync(dir, { recursive: true });
  const fixture = cases.find(c => c.id === entry.case), instructions = guide(entry.workflow);
  const prompt = `This is an isolated synthetic workflow evaluation. Follow the supplied Token Studio guide at the depth appropriate to this confirmed fixture. The harness supplies all context because shell commands are unavailable under the current client policy. Do not call tools, change configuration, send messages, publish, or claim to have read installed files. Produce only JSON matching the supplied schema: a complete standalone HTML/CSS/JS local working prototype, the specification, honest review, and limitations. Browser access is unavailable in this generation session: report unperformed render checks; do not fabricate evidence. The evaluator renders the output separately. No external assets, network requests, frameworks or imports; semantic HTML and interactive local controls only. This evaluates composition and workflow reporting, not a full shadcn production integration.\n\nGUIDE ${entry.workflow}:\n${instructions}\n\nCONFIRMED FIXTURE:\n${fixture.task}\n\nOUTPUT SCHEMA:\n${JSON.stringify(schema)}`;
  writeFileSync(join(dir, 'prompt.txt'), prompt); writeFileSync(join(dir, 'schema.json'), JSON.stringify(schema));
  const command = executable(entry.client); if (!command) return { ...entry, status: 'blocked', reason: 'Client executable unavailable' };
  const args = entry.client === 'codex' ? ['-a', 'never', 'exec', '--ephemeral', '--ignore-user-config', '--skip-git-repo-check', '--sandbox', 'workspace-write', '--json', '--output-schema', join(dir, 'schema.json'), '-o', join(dir, 'response.json'), '-C', dir, '-'] : ['--print', `Read ${join(dir, 'prompt.txt')} using a native file-reading tool, never a shell command. It contains the complete synthetic evaluation instructions and output schema. Return only that JSON. Do not change client settings or use command tools.`, '--add-dir', dir, '--sandbox', '--print-timeout', '180s', '--output-format', 'json', '--json-schema', JSON.stringify(schema)];
  const started = Date.now(); let stdout = '', stderr = '';
  const exit = await new Promise(done => {
    let child;
    try { child = spawn(command, args, { cwd: dir, env: entry.client === 'codex' ? { ...process.env, CODEX_HOME: isolated } : process.env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (error) { done({ code: null, error: error.message }); return; }
    const timer = setTimeout(() => child.kill(), 200000); child.stdout.on('data', data => { stdout += data; }); child.stderr.on('data', data => { stderr += data; });
    child.stdin.on('error', () => {}); child.once('error', error => { clearTimeout(timer); done({ code: null, error: error.message }); }); child.once('close', (code, signal) => { clearTimeout(timer); done({ code, signal }); }); child.stdin.end(entry.client === 'codex' ? prompt : undefined);
  });
  writeFileSync(join(dir, 'stdout.log'), stdout); writeFileSync(join(dir, 'stderr.log'), stderr);
  let result;
  try {
    const wrapper = entry.client === 'antigravity' ? JSON.parse(stdout) : null;
    if (wrapper?.denied_actions?.length) throw new Error('Client denied required tool actions.');
    const response = entry.client === 'codex' ? readFileSync(join(dir, 'response.json'), 'utf8') : typeof wrapper.response === 'string' ? wrapper.response : JSON.stringify(wrapper.response);
    const parsed = JSON.parse(response.replace(/^```json\s*|\s*```$/g, ''));
    if (exit.code !== 0 || typeof parsed.html !== 'string' || !parsed.html.includes('<html') || !Array.isArray(parsed.limitations)) throw new Error('No valid completed prototype response.');
    writeFileSync(join(dir, 'index.html'), parsed.html); writeFileSync(join(dir, 'SPEC.md'), parsed.specification); writeFileSync(join(dir, 'REVIEW.md'), parsed.review); writeFileSync(join(dir, 'response.json'), JSON.stringify(parsed, null, 2));
    result = { ...entry, surface:'cli-constrained-diagnostic', nativeIdeAccepted:false, model:'client default; verify from logs before causal comparison', status: 'generated-awaiting-render-review', elapsedMs: Date.now() - started, exit, promptSha256: createHash('sha256').update(prompt).digest('hex'), limitations: parsed.limitations };
  } catch (error) { result = { ...entry, surface:'cli-constrained-diagnostic', nativeIdeAccepted:false, status: 'blocked', elapsedMs: Date.now() - started, exit, reason: error.message }; }
  console.log(JSON.stringify(result)); results.push(result); writeFileSync(join(destination, 'results.json'), JSON.stringify(results, null, 2));
  return result;
}
try {
  // Each client is serial; different clients own different fixture directories.
  await Promise.all(['codex', 'antigravity'].map(async client => { for (const entry of matrix.filter(row => row.client === client)) await run(entry); }));
} finally { rmSync(join(isolated, 'auth.json'), { force: true }); rmSync(isolated, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
