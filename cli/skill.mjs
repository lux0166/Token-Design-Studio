import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { packageRoot, metadata, codexHome } from './paths.mjs';
export const skillFiles = ['SKILL.md', 'references/interview.md', 'references/reuse.md', 'references/design-quality.md', 'references/handoff.md', 'agents/openai.yaml'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export function planSkill(home = codexHome()) {
  const target = join(home, 'skills', 'token-studio-shadcn');
  const manifestPath = join(target, '.token-design-studio.json');
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { hashes: {} };
  const files = skillFiles.map(file => {
    const bytes = readFileSync(join(packageRoot, 'skills/token-studio-shadcn', file));
    const destination = join(target, file);
    const existing = existsSync(destination) ? readFileSync(destination) : undefined;
    const changed = !!existing && !existing.equals(bytes);
    if (changed && previous.hashes?.[file] !== hash(existing)) throw new Error(`Skill đã được chỉnh riêng: ${destination}. Chưa ghi thay đổi; hãy đối chiếu và hợp nhất trước.`);
    return { file, bytes, destination, changed };
  });
  return { home, target, manifestPath, files };
}
export function installSkill(plan = planSkill()) {
  let backup;
  if (plan.files.some(file => file.changed)) {
    backup = join(plan.home, 'backups', 'token-studio-shadcn', `${Date.now()}-${process.pid}`);
    mkdirSync(dirname(backup), { recursive: true });
    cpSync(plan.target, backup, { recursive: true, errorOnExist: true, force: false });
  }
  for (const file of plan.files) { mkdirSync(dirname(file.destination), { recursive: true }); writeFileSync(file.destination, file.bytes); }
  writeFileSync(plan.manifestPath, JSON.stringify({ version: metadata.version, hashes: Object.fromEntries(plan.files.map(file => [file.file, hash(file.bytes)])) }, null, 2), { mode: 0o600 });
  return { target: plan.target, backup };
}
