import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../skills/token-studio-shadcn/', import.meta.url));
const target = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills', 'token-studio-shadcn');
const files = ['SKILL.md', 'references/interview.md', 'references/reuse.md', 'references/handoff.md', 'agents/openai.yaml'];
// Preflight every file before writing anything. Never overwrite a customized skill.
for (const file of files) {
  const destination = join(target, file);
  if (existsSync(destination) && !readFileSync(destination).equals(readFileSync(join(source, file)))) {
    console.error(`Skill đã tồn tại với nội dung khác: ${destination}\nChưa ghi thay đổi. So sánh bản hiện có với skills/token-studio-shadcn trước khi cập nhật.`);
    process.exit(1);
  }
}
for (const file of files) {
  const destination = join(target, file);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, readFileSync(join(source, file)));
}
console.log(`Đã cài skill: ${target}\nMở một phiên Codex mới và dùng $token-studio-shadcn để bắt đầu.`);
