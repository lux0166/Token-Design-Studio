import { useState, type ChangeEvent } from 'react';
import { AlertCircle, ArrowRight, Check, Code2, Download, FileCode2, FileJson, FileUp, LockKeyhole, Plus, Upload } from 'lucide-react';
import { exportCss, snapshotOf, snapshotSchema, type DesignSystem, type SystemPatch, type Snapshot } from '../../shared/model';
import { CopyButton, Dialog, download } from './ui';
import { request } from '../lib/useStudio';

export function RenameDialog({ system, onClose, onRename }: { system: DesignSystem; onClose: () => void; onRename: (name: string) => Promise<boolean> }) {
  const [name, setName] = useState(system.name);
  const [pending, setPending] = useState(false);
  return <Dialog title="Đổi tên design system" onClose={onClose}><form onSubmit={async e => { e.preventDefault(); setPending(true); const ok = await onRename(name.trim()); setPending(false); if (ok) onClose(); }}><label className="form-label" htmlFor="rename-name">Tên design system</label><input id="rename-name" className="dialog-input" value={name} maxLength={60} onChange={e => setName(e.target.value)} required autoFocus /><div className="dialog-footer"><button type="button" className="button" onClick={onClose}>Hủy</button><button type="submit" className="button dark" disabled={pending || !name.trim()}>Lưu tên</button></div></form></Dialog>;
}

export function ExportDialog({ system, onClose }: { system: DesignSystem; onClose: () => void }) {
  const [format, setFormat] = useState<'css' | 'json'>('css');
  const content = format === 'css' ? exportCss(system) : JSON.stringify({ version: 1, system: snapshotOf(system) }, null, 2);
  const name = system.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'theme';
  return <Dialog title="Mang thiết kế vào sản phẩm" onClose={onClose} wide><p className="dialog-description">{format === 'css' ? 'CSS cho Tailwind v4 / shadcn/ui. Giữ nguyên các lệnh @import trong globals.css của dự án.' : 'Bản sao đầy đủ gồm token sáng/tối, kiểu chữ, hình dạng và các khóa. Có thể nhập lại thành hệ thống mới.'}</p><div className="export-tabs"><button className={format === 'css' ? 'active' : ''} onClick={() => setFormat('css')}><FileCode2 /> globals.css</button><button className={format === 'json' ? 'active' : ''} onClick={() => setFormat('json')}><FileJson /> Design system.json</button><span>{system.name}</span></div><pre className="export-code" tabIndex={0}>{content}</pre><div className="export-note"><Code2 />{format === 'css' ? 'File dùng màu CSS đầy đủ. Chưa dành cho cấu hình Tailwind v3 dùng hsl(var(--…)).' : 'Lịch sử chỉnh sửa không nằm trong bản xuất. Sao lưu thư mục data nếu cần giữ lịch sử.'}</div><div className="dialog-footer"><CopyButton value={content} /><button className="button dark" onClick={() => download(`${name}.${format}`, content, format === 'css' ? 'text/css' : 'application/json')}><Download /> Tải {format.toUpperCase()}</button></div></Dialog>;
}

interface ImportPreview { patch: SystemPatch; warnings: string[]; count: number }
export function ImportDialog({ system, onClose, onApply, onImportJson }: { system: DesignSystem; onClose: () => void; onApply: (patch: SystemPatch) => Promise<boolean>; onImportJson: (snapshot: Snapshot) => Promise<boolean> }) {
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [json, setJson] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const reset = (text: string) => { setRaw(text); setPreview(null); setJson(null); setError(''); };
  const readFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 200000) { setError('File tối đa 200 KB.'); return; }
    reset(await file.text());
  };
  const parse = async () => {
    setPending(true); setError('');
    try {
      if (raw.trim().startsWith('{')) {
        const file = JSON.parse(raw);
        if (file.version !== 1) throw new Error('Phiên bản JSON chưa được hỗ trợ.');
        setJson(snapshotSchema.parse(file.system));
      } else setPreview(await request<ImportPreview>('/api/import/preview', { method: 'POST', body: JSON.stringify({ css: raw }) }));
    } catch (error) { setError(error instanceof Error ? error.message : 'Không đọc được theme.'); }
    finally { setPending(false); }
  };
  const changes: { path: string; before: string; after: string; locked: boolean }[] = [];
  if (preview) for (const group of ['light', 'dark', 'settings'] as const) for (const [key, value] of Object.entries(preview.patch[group] ?? {})) {
    const before = (system[group] as Record<string, unknown>)[key];
    if (value !== before) changes.push({ path: `${group}.${key}`, before: String(before), after: String(value), locked: system.locks.includes(`${group}.${key}`) });
  }
  const blocked = changes.some(c => c.locked);
  return <Dialog title={preview || json ? 'Xem lại theme trước khi nhập' : 'Nhập theme của bạn'} onClose={onClose} wide><p className="dialog-description">{preview ? `Nhập vào ${system.name}. Chỉ những giá trị bên dưới sẽ được thay đổi.` : json ? 'Bản JSON sẽ được tạo thành một design system mới.' : 'Dán CSS từ shadcn/ui hoặc mở file CSS / JSON đã xuất. Mọi thay đổi đều có thể xem lại trước khi lưu.'}</p>
    {!preview && !json ? <><label className="file-drop"><FileUp /><strong>Mở file CSS hoặc JSON</strong><span>Tối đa 200 KB · hoặc dán nội dung bên dưới</span><input type="file" accept=".css,.json,text/css,application/json" onChange={e => void readFile(e)} /></label><textarea className="import-textarea" aria-label="Nội dung theme" value={raw} maxLength={200000} onChange={e => reset(e.target.value)} placeholder={':root {\n  --primary: #18794E;\n  --radius: 0.5rem;\n}\n\n.dark {\n  --primary: oklch(0.8 0.2 150);\n}'} spellCheck={false} /><p className="field-help">Hỗ trợ màu đặc HEX, RGB, HSL, OKLCH trong :root và .dark; font, bo góc và khoảng cách. Không chạy mã từ file.</p></> : preview ? <><div className="import-summary"><span>{changes.length} thay đổi</span><span>{preview.count} giá trị được đọc</span><span>{preview.warnings.length} lưu ý</span></div><div className="import-change-list">{changes.length === 0 ? <p>Theme đã trùng với các giá trị hiện tại.</p> : changes.map(change => <div key={change.path}><code>{change.path}</code><span>{change.before}</span><ArrowRight /><strong>{change.after}</strong>{change.locked && <LockKeyhole aria-label="Token đã khóa" />}</div>)}</div>{preview.warnings.map((warning, i) => <p key={i} className="import-warning"><AlertCircle />{warning}</p>)}{blocked && <p className="error-message">Có token đã khóa. Hãy mở khóa trong editor trước khi nhập; chưa có giá trị nào được lưu.</p>}</> : json && <div className="json-summary"><FileJson /><h3>{json.name}</h3><p>{Object.keys(json.light).length * 2} màu · {json.settings.font} · Bo góc {json.settings.radius}px</p><p>{json.locks.length} token được khóa</p></div>}
    {error && <p role="alert" className="error-message"><AlertCircle />{error}</p>}
    <div className="dialog-footer">{preview || json ? <><button className="button" disabled={pending} onClick={() => { setPreview(null); setJson(null); }}>Quay lại</button><button className="button dark" disabled={pending || blocked || (!!preview && changes.length === 0)} onClick={async () => { setPending(true); const ok = json ? await onImportJson(json) : await onApply(preview!.patch); setPending(false); if (ok) onClose(); }}><Check />{pending ? 'Đang lưu…' : json ? 'Tạo hệ thống mới' : 'Áp dụng theme'}</button></> : <><button className="button" onClick={onClose}>Hủy</button><button className="button dark" disabled={!raw.trim() || pending} onClick={() => void parse()}>{pending ? 'Đang đọc…' : 'Xem trước thay đổi'}<ArrowRight /></button></>}</div>
  </Dialog>;
}
