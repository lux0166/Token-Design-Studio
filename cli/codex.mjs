import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { codexHome } from './paths.mjs';
import { planSkill, beginSkillInstall } from './skill.mjs';
function codex(args) {
  let command = 'codex';
  if (process.platform === 'win32') {
    const paths = spawnSync('where.exe', ['codex'], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
    const candidates = (paths.stdout || '').trim().split(/\r?\n/).filter(Boolean);
    command = candidates.find(path => /\.exe$/i.test(path)) || candidates.find(path => /\.cmd$/i.test(path)) || 'codex';
    if (/\.cmd$/i.test(command)) {
      // Fixed names and a validated loopback URL only, never free-form shell input.
      return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${command}" ${args.map(arg => `"${arg}"`).join(' ')}"`], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
    }
  }
  return spawnSync(command, args, { encoding: 'utf8', windowsHide: true, timeout: 30000 });
}
export function setupCodex(port, replace = false, run = codex) {
  mkdirSync(codexHome(), { recursive: true });
  const transaction = beginSkillInstall(planSkill());
  let step = 'đọc cấu hình', configBackup;
  try {
  const url = `http://127.0.0.1:${port}/mcp`;
  const current = run(['mcp', 'get', 'token-studio', '--json']);
  if (current.error) throw new Error('Không tìm thấy Codex CLI. Cài Codex CLI trước, hoặc dùng install-skill rồi thêm HTTP MCP trong Settings.');
  let same = false;
  if (current.status === 0) {
    const info = JSON.parse(current.stdout);
    same = info.enabled !== false && info.transport?.type === 'streamable_http' && info.transport.url === url;
    if (!same && !replace) throw new Error('MCP token-studio đã có cấu hình khác. Chưa ghi thay đổi. Dùng --replace-mcp để thay riêng kết nối này.');
  } else if (!/No MCP server|not found|does not exist/i.test(current.stderr || '')) throw new Error(`Không đọc được cấu hình Codex: ${(current.stderr || '').trim()}`);
  if (!same) {
    const config = join(codexHome(), 'config.toml');
    step = 'đăng ký MCP'; configBackup = transaction.configBefore(config);
    const added = run(['mcp', 'add', 'token-studio', '--url', url]);
    transaction.configWritten();
    if (added.status !== 0) throw new Error(`Chưa thêm được MCP. Bản sao lưu: ${configBackup || 'không có cấu hình cũ'}. ${(added.stderr || '').trim()}`);
  }
  step = 'cài skill'; transaction.commit();
  return { ...transaction.finish(), configBackup, url, unchangedMcp: same };
  } catch (error) {
    transaction.abort(error);
    throw new Error(`Setup lỗi ở bước ${step}; đã hoàn nguyên giao dịch. Backup cấu hình: ${configBackup || 'không có cấu hình cũ'}. ${error.message}`);
  }
}
