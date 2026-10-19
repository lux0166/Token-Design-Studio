import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { existsSync, readFileSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { createConnection } from 'node:net';
import lockfile from 'proper-lockfile';
import { packageRoot, metadata, defaultDataDirectory, codexHome } from './paths.mjs';
import { installSkill, planSkill } from './skill.mjs';
import { setupCodex } from './codex.mjs';

const help = `Token Design Studio ${metadata.version}
  token-design-studio [start] [--port 4318] [--data-dir PATH] [--no-open]
  token-design-studio setup codex [--port 4318] [--replace-mcp]
  token-design-studio install-skill [--adopt-known]
  token-design-studio mcp [--port 4318]
  token-design-studio doctor [--port 4318] [--data-dir PATH]
  token-design-studio migrate FILE [--data-dir PATH]

Start chạy editor đã build và HTTP MCP local. Giữ terminal mở; Ctrl+C để dừng.
Setup thêm HTTP MCP bằng Codex CLI; chạy Studio trước phiên agent.
Mcp chuyển tiếp stdio tới Studio đang chạy, không mở kho dữ liệu thứ hai.
Migrate sao chép dữ liệu đã kiểm tra, chỉ khi kho đích chưa tồn tại.
`;
export async function probe(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/status`, { signal: AbortSignal.timeout(1200), redirect: 'error' });
    if (!response.ok) return null;
    const status = await response.json();
    return status.application === 'token-design-studio' && status.protocolVersion === 1 && typeof status.dataFile === 'string' && typeof status.version === 'string' ? status : null;
  } catch { return null; }
}
function openBrowser(url) {
  const [command, args] = process.platform === 'win32' ? ['explorer.exe', [url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  const child = spawn(command, args, { stdio: 'ignore', detached: true, windowsHide: true });
  child.on('error', () => console.error(`Mở trình duyệt tại ${url}`)); child.unref();
}
const normalized = path => {
  const canonical = existsSync(path) ? realpathSync(path) : resolve(path);
  return process.platform === 'win32' ? canonical.toLowerCase() : canonical;
};
const portInUse = port => new Promise(done => {
  const socket = createConnection({ host: '127.0.0.1', port });
  const finish = value => { socket.destroy(); done(value); };
  socket.once('connect', () => finish(true)); socket.once('error', () => finish(false)); socket.setTimeout(800, () => finish(true));
});
export async function main(args = process.argv.slice(2)) {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('Yêu cầu Node.js 22.12 trở lên.');
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' }, port: { type: 'string' }, 'data-dir': { type: 'string' }, 'no-open': { type: 'boolean' }, 'replace-mcp': { type: 'boolean' }, 'adopt-known': {type:'boolean'} } });
  if (values.help) { console.log(help); return; }
  if (values.version) { console.log(metadata.version); return; }
  const command = positionals[0] || 'start';
  if (command === 'install-skill' && positionals.length === 1) { console.log(JSON.stringify(installSkill(planSkill(undefined,{adoptKnown:!!values['adopt-known']})), null, 2)); return; }
  const port = Number(values.port || process.env.PORT || 4318);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port phải là số nguyên từ 1 đến 65535.');
  const dataDir = resolve(values['data-dir'] || defaultDataDirectory());
  const dataFile = resolve(values['data-dir'] ? join(dataDir, 'studio.json') : process.env.STUDIO_DATA_FILE || join(dataDir, 'studio.json'));
  const url = `http://127.0.0.1:${port}`;
  if (command === 'setup' && positionals.length === 2 && positionals[1] === 'codex') { console.log(JSON.stringify(setupCodex(port, values['replace-mcp']), null, 2)); console.log('Mở phiên Codex mới. Chạy Token Design Studio trước khi dùng MCP.'); return; }
  if (command === 'doctor' && positionals.length === 1) { console.log(JSON.stringify({ version: metadata.version, node: process.version, dataFile, codexHome: codexHome(), server: await probe(port) }, null, 2)); return; }
  if (command === 'migrate' && positionals.length === 2) {
    const { validateData } = await import('../runtime/data.js');
    const bytes = readFileSync(resolve(positionals[1])); validateData(JSON.parse(bytes.toString('utf8')));
    mkdirSync(dirname(dataFile), { recursive: true });
    const release = await lockfile.lock(dataFile, { realpath: false });
    try { writeFileSync(dataFile, bytes, { flag: 'wx', mode: 0o600 }); } finally { await release(); }
    console.log(`Đã sao chép dữ liệu sang ${dataFile}. File nguồn được giữ nguyên.`); return;
  }
  if (command === 'mcp' && positionals.length === 1) {
    if (!await probe(port)) throw new Error('Khởi động token-design-studio trước khi dùng adapter mcp.');
    process.env.STUDIO_MCP_URL = `${url}/mcp`; await import('../runtime/stdio.js'); return;
  }
  if (command !== 'start' || positionals.length > 1) throw new Error(`Lệnh không hợp lệ.\n${help}`);
  if (!existsSync(join(packageRoot, 'dist/index.html')) || !existsSync(join(packageRoot, 'runtime/server.js'))) throw new Error('Thiếu bản build. Trong repo phát triển, chạy npm run build trước.');
  const existing = await probe(port);
  if (existing) {
    if (normalized(existing.dataFile) !== normalized(dataFile)) throw new Error(`Studio ở port ${port} đang dùng kho dữ liệu khác: ${existing.dataFile}. Dùng đúng --data-dir hoặc chọn port khác.`);
    if (existing.version !== metadata.version) throw new Error(`Studio đang chạy phiên bản ${existing.version}; hãy dừng phiên đó trước khi chạy ${metadata.version}.`);
    console.log(`Dùng lại Token Design Studio: ${url}`); if (!values['no-open']) openBrowser(url); return;
  }
  if (await portInUse(port)) throw new Error(`Port ${port} đang được ứng dụng khác sử dụng. Chọn --port khác.`);
  process.env.PORT = String(port); process.env.STUDIO_DATA_FILE = dataFile; process.env.STUDIO_OPEN_BROWSER = '0';
  await import('../runtime/server.js');
  if (!values['no-open']) openBrowser(url);
}
