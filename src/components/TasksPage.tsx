import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, FileText, ListChecks, Plus, RefreshCw, Upload } from 'lucide-react';
import { taskInputSchema, validateTask, type TaskInput, type TaskRecord } from '../../shared/tasks';
import { workflowModes } from '../../shared/workflow';
import { request } from '../lib/useStudio';
import { Dialog, download } from './ui';
import './tasks.css';

type Summary = Pick<TaskRecord, 'id' | 'revision' | 'status' | 'syncedAt'> & Pick<TaskInput, 'title' | 'project' | 'mode' | 'scope'>;
const modeLabels: Record<string, string> = { 'design-and-build': 'Thiết kế mới', replicate: 'Theo tham chiếu', refine: 'Tinh chỉnh', 'grill-me': 'Grill me · Đặc tả' };
const sourceLabels: Record<string, string> = { human: 'Người dùng', project: 'Dự án hiện tại', reference: 'Tham chiếu', delegated: 'Đã giao quyền', unresolved: 'Chưa xác định' };
const statusLabels: Record<string, string> = { pending: 'Chưa kiểm tra', passed: 'Đã đạt', failed: 'Thất bại', blocked: 'Bị chặn', open: 'Còn mở', conflicting: 'Mâu thuẫn', resolved: 'Đã rõ', fixed: 'Đã sửa', deferred: 'Để sau', 'out-of-scope': 'Ngoài phạm vi' };

export function TasksPage() {
  const [tasks, setTasks] = useState<Summary[]>([]), [selected, setSelected] = useState('');
  const [record, setRecord] = useState<TaskRecord | null>(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'create' | 'sync' | null>(null), [raw, setRaw] = useState(''), [dialogError, setDialogError] = useState('');
  const [syncRevision, setSyncRevision] = useState<number | null>(null);
  const close = useCallback(() => { setDialog(null); setDialogError(''); }, []);
  const refresh = useCallback(async () => {
    try { setTasks(await request<Summary[]>('/api/tasks')); setError(''); } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 3000); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => {
    if (!selected) { setRecord(null); return; }
    let active = true;
    const load = () => request<TaskRecord>(`/api/tasks/${selected}`).then(next => { if (active) setRecord(next); }).catch(e => { if (active) setError((e as Error).message); });
    void load(); const timer = setInterval(() => { if (!dialog && !busy) void load(); }, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [selected, dialog, busy]);
  const validation = record ? validateTask(record.task) : null;
  const needsDirection = !!record && record.task.mode !== 'grill-me' && record.task.scope !== 'token-only';
  const openSync = () => { setSyncRevision(record?.revision ?? null); setRaw(JSON.stringify(record ? { taskId: record.id, task: record.task } : { task: taskInputSchema.parse({ title: 'Tên tác vụ', goal: 'Mục tiêu đã xác nhận', project: 'Dự án của tôi' }) }, null, 2)); setDialogError(''); setDialog('sync'); };
  const create = async (form: HTMLFormElement) => {
    const values = new FormData(form); setBusy(true); setDialogError('');
    try {
      const task = taskInputSchema.parse({ title: values.get('title'), goal: values.get('goal'), project: values.get('project'), mode: values.get('mode'), scope: values.get('scope') });
      const next = await request<TaskRecord>('/api/tasks', { method: 'POST', body: JSON.stringify({ task }) });
      setRecord(next); setSelected(next.id); close(); await refresh(); setMessage('Đã tạo hồ sơ. Bổ sung quyết định và bằng chứng trước khi hoàn tất.');
    } catch (e) { setDialogError((e as Error).message); } finally { setBusy(false); }
  };
  const sync = async () => {
    setBusy(true); setDialogError('');
    try {
      const input = JSON.parse(raw), task = taskInputSchema.parse(input.task ?? input);
      if (record && input.taskId && input.taskId !== record.id) throw new Error('ID không khớp hồ sơ đang mở. Quay về danh sách để nhập tác vụ khác.');
      const next = await request<TaskRecord>(record ? `/api/tasks/${record.id}` : '/api/tasks', { method: record ? 'PATCH' : 'POST', body: JSON.stringify(record ? { task, expectedRevision: syncRevision } : { task, ...(input.taskId ? { taskId: input.taskId } : {}) }) });
      setRecord(next); setSelected(next.id); close(); await refresh(); setMessage('Đã đồng bộ hồ sơ. File trong dự án không bị thay đổi.');
    } catch (e) { setDialogError((e as Error).message); } finally { setBusy(false); }
  };
  const complete = async () => {
    if (!record) return; setBusy(true); setError('');
    try { const next = await request<TaskRecord>(`/api/tasks/${record.id}/complete`, { method: 'POST', body: JSON.stringify({ expectedRevision: record.revision }) }); setRecord(next); setMessage('Đã hoàn tất theo bằng chứng được ghi nhận trong hồ sơ.'); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <div className="workspace-page tasks-page">
    <div className="page-heading"><div><span className="task-eyebrow">TỪ Ý ĐỊNH ĐẾN BẰNG CHỨNG</span><h1>Tác vụ thiết kế</h1><p>Biết điều gì đã rõ, đã kiểm tra và còn cần sửa.</p></div><div className="task-actions"><button className="button" onClick={() => void refresh()} aria-label="Tải lại danh sách tác vụ"><RefreshCw /></button><button className="button" onClick={openSync}><Upload />{record ? 'Đồng bộ hồ sơ' : 'Nhập hồ sơ'}</button><button className="button dark" onClick={() => { setDialogError(''); setDialog('create'); }}><Plus /> Tạo tác vụ</button></div></div>
    {error && <p role="alert" className="error-message"><AlertCircle />{error}</p>}
    {message && <p className="task-message" role="status">{message}</p>}
    {!selected ? <>
      <div className="task-intro"><ListChecks /><div><h2>Mỗi thiết kế có một hồ sơ.</h2><p>Đặc tả và ảnh ở trong dự án của bạn. Studio theo dõi quyết định, kiểm tra và việc sửa lỗi — chỉ đánh dấu hoàn tất khi hồ sơ đủ điều kiện.</p><small>Bằng chứng do agent hoặc người dùng cung cấp. Studio không xác thực nội dung ảnh hay chứng nhận chất lượng thẩm mỹ.</small></div></div>
      <div className="list-title"><h2>Hồ sơ đã đồng bộ</h2><span>{tasks.length} tác vụ</span></div>
      {!tasks.length ? <div className="task-empty"><FileText /><h2>Bắt đầu từ một nhiệm vụ cụ thể.</h2><p>Tạo hồ sơ ở đây hoặc nhờ agent dùng create_task để đồng bộ từ dự án.</p><button className="button dark" onClick={() => setDialog('create')}><Plus /> Tạo tác vụ đầu tiên</button></div> : <div className="task-list">{[...tasks].sort((a, b) => b.syncedAt.localeCompare(a.syncedAt)).map(task => <button key={task.id} className="task-list-row" onClick={() => { setRecord(null); setSelected(task.id); setMessage(''); }}><FileText /><span><strong>{task.title}</strong><small>{task.project} · {task.scope === 'token-only' ? 'Sửa token' : modeLabels[task.mode]}</small></span><span className={`task-status ${task.status}`}>{task.status === 'completed' ? 'Hoàn tất' : 'Đang làm'}</span><time>{new Date(task.syncedAt).toLocaleDateString('vi-VN')}</time></button>)}</div>}
    </> : record ? <>
      <button className="text-button task-back" onClick={() => { setSelected(''); setMessage(''); setError(''); }}><ArrowLeft /> Tất cả tác vụ</button>
      <section className="plain-panel task-summary"><div><span className={`task-status ${record.status}`}>{record.status === 'completed' ? 'Hoàn tất' : 'Đang làm'}</span><h2>{record.task.title}</h2><p>{record.task.goal}</p><small>{record.task.project} · {record.task.scope === 'token-only' ? 'Sửa token' : modeLabels[record.task.mode]} · Đồng bộ {new Date(record.syncedAt).toLocaleString('vi-VN')}</small></div><div className="task-actions"><button className="button" onClick={() => download('task.json', JSON.stringify({ taskId: record.id, task: record.task }, null, 2), 'application/json')}><Download /> Tải hồ sơ</button><button className="button dark" disabled={busy || !validation?.valid || record.status === 'completed'} onClick={() => void complete()}><CheckCircle2 />{record.status === 'completed' ? 'Đã hoàn tất' : 'Đánh dấu hoàn tất'}</button></div></section>
      <section className={`task-readiness ${validation?.valid ? 'ready' : ''}`} aria-labelledby="task-readiness-title"><div><ListChecks /><h2 id="task-readiness-title">{validation?.valid ? 'Hồ sơ đủ điều kiện hoàn tất' : `${validation?.issues.length} điều kiện cần bổ sung`}</h2></div><p>Kiểm tra dựa trên thông tin được ghi nhận. Liên kết file không chứng minh ảnh đã được xem hoặc kiểm thử đã chạy.</p>{!!validation?.issues.length && <ul>{validation.issues.map((issue, i) => <li key={`${issue.location}-${i}`}>{issue.message}</li>)}</ul>}</section>
      <div className="task-detail-grid"><section className="plain-panel"><h2>{needsDirection ? 'Quyết định & định hướng' : 'Quyết định & phạm vi'}</h2>{needsDirection && <div className="task-direction"><small>{sourceLabels[record.task.direction.source]}</small><p>{record.task.direction.summary || 'Chưa ghi định hướng thiết kế.'}</p>{record.task.direction.evidence && <p className="task-evidence">{record.task.direction.evidence}</p>}</div>}{record.task.decisions.length ? record.task.decisions.map(d => <article className="task-detail-item" key={d.id}><strong>{d.question}</strong><span className={`task-pill ${d.status}`}>{statusLabels[d.status]}</span><p>{d.answer || 'Chưa có câu trả lời.'}</p><small>{sourceLabels[d.source]}{d.material ? ' · Quan trọng' : ''}</small>{d.evidence && <p className="task-evidence">{d.evidence}</p>}</article>) : <p className="task-muted">Chưa ghi quyết định. Chỉ hỏi khi còn ý định quan trọng chưa rõ.</p>}</section>
      <section className="plain-panel"><h2>Tiêu chí & kiểm tra</h2>{record.task.acceptanceCriteria.length ? <ul className="task-criteria">{record.task.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul> : <p className="task-muted">Chưa có tiêu chí nghiệm thu.</p>}{record.task.checks.map(c => <article className="task-detail-item" key={c.id}><strong>{c.label}</strong><span className={`task-pill ${c.status}`}>{statusLabels[c.status]}</span><small>{c.kind}{c.required ? ' · Bắt buộc' : ' · Ngoài kiểm tra bắt buộc'}</small><p className="task-evidence">{c.evidence || 'Chưa có bằng chứng.'}</p></article>)}</section>
      <section className="plain-panel"><h2>Tài liệu & bằng chứng</h2><p className="task-muted">Đường dẫn tính từ gốc dự án. Studio không đọc hoặc tải file này.</p>{record.task.artifacts.length ? record.task.artifacts.map(a => <article className="task-detail-item" key={a.id}><strong>{a.label}</strong><small>{a.kind}{a.viewport ? ` · ${a.viewport.width} × ${a.viewport.height}` : ''}</small>{/^https?:\/\//i.test(a.path) ? <a href={a.path} target="_blank" rel="noreferrer">{a.path}</a> : <code>{a.path}</code>}</article>) : <p className="task-muted">Chưa liên kết tài liệu.</p>}</section>
      <section className="plain-panel"><h2>Phản biện & sửa lỗi</h2>{record.task.findings.length ? record.task.findings.map(f => <article className="task-detail-item" key={f.id}><strong>{f.observation}</strong><small>{f.severity} · {statusLabels[f.status]} · {f.location}</small><p>{f.impact}</p><p className="task-evidence">Bằng chứng: {f.evidence}</p><p>Sửa: {f.repair || 'Chưa ghi nhận'}</p><p>Kiểm tra lại: {f.recheck || 'Chưa ghi nhận'}</p></article>) : <p className="task-muted">Chưa ghi phát hiện. Không đồng nghĩa giao diện đã được đánh giá.</p>}{record.task.limitations.map((l, i) => <p className={l.blocking ? 'task-limitation' : 'task-muted'} key={i}>{l.blocking ? 'Đang chặn' : 'Giới hạn'}: {l.message}</p>)}</section></div>
    </> : <p role="status">Đang tải hồ sơ…</p>}
    {dialog === 'create' && <Dialog title="Tạo tác vụ thiết kế" onClose={close}><form className="task-form" onSubmit={e => { e.preventDefault(); void create(e.currentTarget); }}><label htmlFor="task-title">Tên tác vụ</label><input className="dialog-input" id="task-title" name="title" maxLength={120} required autoFocus /><label htmlFor="task-project">Dự án</label><input className="dialog-input" id="task-project" name="project" maxLength={300} required /><label htmlFor="task-goal">Mục tiêu</label><textarea id="task-goal" name="goal" maxLength={6000} required /><label htmlFor="task-mode">Loại công việc</label><select id="task-mode" name="mode">{workflowModes.map(m => <option key={m} value={m}>{modeLabels[m]}</option>)}</select><label htmlFor="task-scope">Phạm vi</label><select id="task-scope" name="scope"><option value="screen">Màn hình / đặc tả</option><option value="token-only">Sửa token nhỏ</option></select>{dialogError && <p role="alert" className="error-message">{dialogError}</p>}<div className="dialog-footer"><button className="button" type="button" onClick={close}>Hủy</button><button className="button dark" disabled={busy}>Tạo hồ sơ</button></div></form></Dialog>}
    {dialog === 'sync' && <Dialog title={record ? 'Đồng bộ hồ sơ từ dự án' : 'Nhập hồ sơ tác vụ'} onClose={close} wide><p className="dialog-description">Dán nội dung task.json từ dự án. {record ? 'Thao tác này thay nội dung hồ sơ và mở lại tác vụ đã hoàn tất.' : 'Hồ sơ chưa đủ bằng chứng vẫn có thể lưu.'} File gốc không bị thay đổi.</p><label className="form-label" htmlFor="task-json">Nội dung hồ sơ JSON</label><textarea id="task-json" className="task-json" value={raw} maxLength={400000} onChange={e => setRaw(e.target.value)} spellCheck={false} />{dialogError && <p role="alert" className="error-message">{dialogError}</p>}<div className="dialog-footer"><button className="button" onClick={close}>Hủy</button><button className="button dark" disabled={busy || !raw.trim()} onClick={() => void sync()}>Lưu hồ sơ</button></div></Dialog>}
  </div>;
}
