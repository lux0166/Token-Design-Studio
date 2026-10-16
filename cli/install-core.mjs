import { createHash, randomUUID } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, mkdirSync, writeFileSync, renameSync, rmSync, cpSync, accessSync, constants } from 'node:fs';
import { join, dirname, basename, relative, resolve, isAbsolute } from 'node:path';
import lockfile from 'proper-lockfile';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytesAt = path => existsSync(path) ? readFileSync(path) : null;
const inside = (root, path) => { const rel = relative(root, path); return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel); };
function tree(root) {
  if (!existsSync(root)) return null;
  const result = [];
  const walk = path => {
    const stat = lstatSync(path), name = relative(root, path);
    if (stat.isSymbolicLink()) result.push([name, 'link', readlinkSync(path)]);
    else if (stat.isDirectory()) { result.push([name, 'dir']); for (const name of readdirSync(path).sort()) walk(join(path, name)); }
    else if (stat.isFile()) result.push([name, 'file', hash(readFileSync(path))]);
    else throw new Error(`Đường dẫn không phải file/thư mục thông thường: ${path}`);
  };
  walk(root); return JSON.stringify(result);
}
function checkPath(root, file) {
  const parts = file.split('/'); let path = root;
  for (let i = 0; i <= parts.length; i++) {
    if (existsSync(path)) {
      const stat = lstatSync(path);
      if (stat.isSymbolicLink() || (i < parts.length ? !stat.isDirectory() : !stat.isFile())) throw new Error(`Xung đột file/thư mục: ${path}`);
    }
    if (i < parts.length) path = join(path, parts[i]);
  }
}
export function planInstallation({ home, source, version, client = 'codex' }) {
  home = resolve(home); source = resolve(source);
  if (!['codex', 'antigravity'].includes(client)) throw new Error('Client phải là codex hoặc antigravity.');
  const target = join(home, 'skills', 'token-studio-shadcn');
  const manifestPath = join(target, '.token-design-studio.json');
  checkPath(target, '.token-design-studio.json');
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { hashes: {} };
  const names = [];
  const walk = (dir, prefix = '') => { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (client === 'antigravity' && name === 'agents') continue;
    if (entry.isDirectory()) walk(join(dir, entry.name), `${name}/`);
    else if (entry.isFile()) names.push(name);
    else throw new Error(`Nguồn skill không hỗ trợ symlink: ${name}`);
  } };
  walk(source);
  const files = names.sort().map(file => {
    checkPath(target, file);
    const bytes = readFileSync(join(source, file)), destination = join(target, file), existing = bytesAt(destination);
    if (existing && !existing.equals(bytes) && previous.hashes?.[file] !== hash(existing)) throw new Error(`Skill đã được chỉnh riêng: ${destination}. Chưa ghi thay đổi; hãy đối chiếu và hợp nhất trước.`);
    return { file, bytes, destination };
  });
  return { home, target, manifestPath, files, version, client, snapshot: tree(target) };
}
export function beginInstallation(plan) {
  const { home, target } = plan;
  mkdirSync(dirname(target), { recursive: true }); accessSync(dirname(target), constants.W_OK);
  const key = join(dirname(target), '.token-studio-shadcn.install');
  let unlock;
  // spawnSync can hold the event loop for two 30-second Codex calls.
  try { unlock = lockfile.lockSync(key, { realpath: false, stale: 120000 }); }
  catch { throw new Error(`Bộ cài khác đang sử dụng ${target}. Chờ tiến trình đó kết thúc rồi thử lại.`); }
  const journal = join(dirname(target), '.token-studio-shadcn.transaction.json');
  const remove = path => { if (path) rmSync(path, { recursive: true, force: true }); };
  let record, closed = false;
  function save() { const tmp = `${journal}.tmp`; writeFileSync(tmp, JSON.stringify(record), { mode: 0o600 }); renameSync(tmp, journal); }
  function restoreConfig(r) {
    if (!r.config) return;
    const current = bytesAt(r.config.path);
    if (!r.config.written) {
      const before = r.config.before === null ? null : Buffer.from(r.config.before, 'base64');
      if ((current === null ? null : hash(current)) !== (before === null ? null : hash(before))) throw new Error(`Lệnh cấu hình bị ngắt trước khi ghi nhận kết quả; đối chiếu thủ công ${r.config.backup || journal}.`);
      return;
    }
    if ((current === null ? null : hash(current)) !== r.config.afterHash) throw new Error(`Cấu hình đã được sửa bởi tiến trình khác. Giữ nguyên cấu hình; khôi phục thủ công từ ${r.config.backup || journal}.`);
    if (r.config.before === null) rmSync(r.config.path, { force: true });
    else { const tmp = `${r.config.path}.token-studio-restore`; writeFileSync(tmp, Buffer.from(r.config.before, 'base64'), { mode: 0o600 }); renameSync(tmp, r.config.path); }
  }
  function recover(r) {
    if (r.target !== target || dirname(r.stage) !== dirname(target) || !basename(r.stage).startsWith('.token-studio-shadcn.stage-') || !inside(join(home, 'backups/token-studio-shadcn'), r.backup) || (r.config && r.config.path !== join(home, 'config.toml'))) throw new Error(`Nhật ký không hợp lệ; cần kiểm tra thủ công: ${journal}`);
    if (r.phase === 'finished') { remove(r.stage); rmSync(journal, { force: true }); return; }
    if (existsSync(r.backup)) {
      if (existsSync(target)) {
        if (!r.installedSnapshot || tree(target) !== r.installedSnapshot) throw new Error(`Skill thay đổi sau giao dịch bị ngắt. Giữ nguyên; bản sao lưu: ${r.backup}; nhật ký: ${journal}`);
        remove(target);
      }
      renameSync(r.backup, target);
    } else if (r.phase !== 'prepared' && r.initial === null && r.installedSnapshot && existsSync(target)) {
      if (tree(target) !== r.installedSnapshot) throw new Error(`Skill đã chỉnh sau giao dịch; cần đối chiếu ${journal}`);
      remove(target);
    }
    restoreConfig(r); remove(r.stage); rmSync(journal, { force: true });
  }
  try {
    if (existsSync(journal)) recover(JSON.parse(readFileSync(journal, 'utf8')));
    if (tree(target) !== plan.snapshot) throw new Error(`Skill thay đổi sau bước kiểm tra: ${target}. Chưa ghi thay đổi; chạy lại để đối chiếu.`);
    const id = `${Date.now()}-${randomUUID()}`;
    record = { target, stage: join(dirname(target), `.token-studio-shadcn.stage-${id}`), backup: join(home, 'backups/token-studio-shadcn', id), initial: plan.snapshot, phase: 'prepared' };
    mkdirSync(record.stage);
    if (existsSync(target)) cpSync(target, record.stage, { recursive: true, verbatimSymlinks: true });
    for (const file of plan.files) { const path = join(record.stage, file.file); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, file.bytes); }
    writeFileSync(join(record.stage, '.token-design-studio.json'), JSON.stringify({ version: plan.version, client: plan.client, hashes: Object.fromEntries(plan.files.map(file => [file.file, hash(file.bytes)])) }, null, 2), { mode: 0o600 });
    record.installedSnapshot = tree(record.stage); save();
  } catch (error) { if (record) remove(record.stage); unlock(); throw error; }
  const release = () => { if (!closed) { closed = true; unlock(); } };
  return {
    configBefore(path) {
      const before = bytesAt(path);
      const backup = before === null ? undefined : `${path}.token-design-studio-${randomUUID()}.bak`;
      if (backup) writeFileSync(backup, before, { mode: 0o600 });
      record.config = { path, before: before?.toString('base64') ?? null, backup, written: false }; save(); return backup;
    },
    configWritten() { const current = bytesAt(record.config.path); record.config.afterHash = current === null ? null : hash(current); record.config.written = true; save(); },
    commit() {
      if (tree(target) !== plan.snapshot) throw new Error(`Skill thay đổi sau bước kiểm tra: ${target}. Chưa thay skill.`);
      if (record.installedSnapshot === plan.snapshot) { record.phase = 'committed'; save(); return; }
      record.phase = 'swapping'; save();
      if (existsSync(target)) { mkdirSync(dirname(record.backup), { recursive: true }); renameSync(target, record.backup); }
      renameSync(record.stage, target); record.phase = 'committed'; save();
    },
    finish() {
      record.phase = 'finished'; save(); remove(record.stage); rmSync(journal, { force: true }); release();
      return { target, backup: existsSync(record.backup) ? record.backup : undefined };
    },
    abort(error) {
      try { recover(record); }
      catch (recoveryError) { throw new Error(`${error.message}. Phục hồi cần can thiệp: ${recoveryError.message}`); }
      finally { release(); }
    },
  };
}
