import { parseArgs } from 'node:util';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { planInstallation, beginInstallation, inspectSkill } from './install-core.mjs';

export function skillMain(args, root) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { client: { type: 'string', default: 'codex' }, home: { type: 'string' }, 'adopt-known': {type:'boolean'}, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' } } });
  const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (values.version) { console.log(metadata.version); return; }
  if (values.help) { console.log('token-design-studio-skill install|doctor [--client codex|antigravity] [--home PATH] [--adopt-known]\nDoctor chỉ đọc. Adopt-known tiếp nhận bản cũ đã biết chưa có manifest; vẫn giữ file chỉnh riêng. Không sửa MCP. Node 22.12+.'); return; }
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('Yêu cầu Node.js 22.12 trở lên.');
  if (positionals.length !== 1 || !['install','doctor'].includes(positionals[0])) throw new Error('Dùng install hoặc doctor --client codex|antigravity.');
  const client = values.client;
  if (!['codex', 'antigravity'].includes(client)) throw new Error('Client phải là codex hoặc antigravity.');
  const home = resolve(values.home || (client === 'codex' ? process.env.CODEX_HOME || join(homedir(), '.codex') : join(homedir(), '.gemini/config')));
  const options={home,client,source:join(root,'skills/token-studio-shadcn'),version:metadata.version};
  if(positionals[0]==='doctor'){const report=inspectSkill(options);console.log(JSON.stringify(report,null,2));process.exitCode=report.healthy?0:1;return;}
  const transaction = beginInstallation(planInstallation({ ...options,adoptKnown:!!values['adopt-known'] }));
  try { transaction.commit(); console.log(JSON.stringify({ ...transaction.finish(), client, message: 'Mở phiên client mới để tải skill. Chưa thêm cấu hình MCP.' }, null, 2)); }
  catch (error) { transaction.abort(error); throw error; }
}
// This source module is bundled as a library; the package wrapper supplies its root.
