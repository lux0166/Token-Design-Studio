import { parseArgs } from 'node:util';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { planInstallation, beginInstallation } from './install-core.mjs';

export function skillMain(args, root) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { client: { type: 'string', default: 'codex' }, home: { type: 'string' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' } } });
  const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (values.version) { console.log(metadata.version); return; }
  if (values.help) { console.log('token-design-studio-skill install [--client codex|antigravity] [--home PATH]\n--home chọn thư mục cấu hình client, không phải thư mục skill. Không sửa MCP. Node 22.12+.'); return; }
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('Yêu cầu Node.js 22.12 trở lên.');
  if (positionals.length !== 1 || positionals[0] !== 'install') throw new Error('Dùng install --client codex hoặc install --client antigravity.');
  const client = values.client;
  if (!['codex', 'antigravity'].includes(client)) throw new Error('Client phải là codex hoặc antigravity.');
  const home = resolve(values.home || (client === 'codex' ? process.env.CODEX_HOME || join(homedir(), '.codex') : join(homedir(), '.gemini/config')));
  const transaction = beginInstallation(planInstallation({ home, client, source: join(root, 'skills/token-studio-shadcn'), version: metadata.version }));
  try { transaction.commit(); console.log(JSON.stringify({ ...transaction.finish(), client, message: 'Mở phiên client mới để tải skill. Chưa thêm cấu hình MCP.' }, null, 2)); }
  catch (error) { transaction.abort(error); throw error; }
}
// This source module is bundled as a library; the package wrapper supplies its root.
