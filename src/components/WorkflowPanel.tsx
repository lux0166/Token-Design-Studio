import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Download, ListChecks, MessagesSquare } from 'lucide-react';
import { workflowVersion, workflowPhases, workflowStarter, type WorkflowGuide, type WorkflowMode } from '../../shared/workflow';
import { CopyButton, download } from './ui';
import { request } from '../lib/useStudio';

const modes: { id: WorkflowMode; label: string }[] = [
  { id: 'grill-me', label: 'Grill me · Phỏng vấn → Đặc tả' },
  { id: 'design-and-build', label: 'Thiết kế & triển khai mới' },
  { id: 'replicate', label: 'Dựng theo thiết kế có sẵn' },
  { id: 'refine', label: 'Tinh chỉnh giao diện hiện tại' },
];
export function WorkflowPanel() {
  const [mode, setMode] = useState<WorkflowMode>('grill-me');
  const [task, setTask] = useState('Tôi muốn thiết kế trang đăng ký cho sản phẩm của mình. Hãy làm rõ người dùng, luồng đăng ký, dữ liệu và tiêu chí thành công trước khi tạo đặc tả.');
  const [guide, setGuide] = useState<WorkflowGuide | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setGuide(null); setError('');
    void request<WorkflowGuide>(`/api/workflow?mode=${mode}`).then(result => { if (active) setGuide(result); }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Không tải được quy trình.'); });
    return () => { active = false; };
  }, [mode]);
  const interviewOnly = mode === 'grill-me';
  const starter = workflowStarter(task, mode);
  const fullGuide = guide ? [guide.modeInstructions, guide.instructions, guide.interviewGuide, guide.reuseGuide, guide.handoffTemplate].join('\n\n---\n\n') : '';
  return <section className="plain-panel workflow-panel" aria-labelledby="workflow-heading">
    <div className="workflow-heading"><div><h2 id="workflow-heading"><ListChecks /> Quy trình Design & Ship</h2><p>Đọc bối cảnh, hỏi rõ ý định, tạo đặc tả rồi triển khai theo hệ thống.</p></div><span className="workflow-version">v{workflowVersion}</span></div>
    <div className="interview-intro"><span><MessagesSquare /></span><div><h3>Grill me — hỏi rõ rồi mới xây.</h3><p>Agent hỏi từng vòng ngắn, đào sâu vào câu trả lời và làm rõ mâu thuẫn. Những điều bạn đã xác nhận được giữ lại; câu hỏi quan trọng còn mở sẽ được giải quyết trước khi viết code phụ thuộc.</p><div className="interview-outcomes"><span>Quyết định có nguồn</span><span>Quy tắc & ngoại lệ</span><span>SPEC.md + tiêu chí nghiệm thu</span></div></div></div>
    <ol className="workflow-phases">{workflowPhases.map((phase, i) => <li key={phase.id}><span className="workflow-step-number">0{i + 1}</span><div><h3>{phase.title}</h3><p>{phase.description}</p><small><ArrowRight />{phase.deliverable}</small></div></li>)}</ol>
    <div className="workflow-task">
      <label htmlFor="workflow-mode">Loại công việc</label>
      <select id="workflow-mode" value={mode} onChange={e => setMode(e.target.value as WorkflowMode)}>{modes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <p className="workflow-mode-help">{interviewOnly ? 'Chế độ này kết thúc ở SPEC.md. Agent phỏng vấn trong cuộc trò chuyện của client AI bạn đang dùng.' : 'Phỏng vấn các điểm còn thiếu trước khi triển khai. Khi đã đủ đặc tả, agent tiếp tục công việc bạn đã yêu cầu.'}</p>
      <label htmlFor="workflow-task">Nhiệm vụ hoặc ý tưởng cần làm rõ</label>
      <textarea id="workflow-task" value={task} maxLength={6000} rows={3} onChange={e => setTask(e.target.value)} />
      <div className="workflow-controls"><CopyButton disabled={!task.trim()} value={starter} label={interviewOnly ? 'Sao chép yêu cầu phỏng vấn' : 'Sao chép yêu cầu cho agent'} /><button className="button" disabled={!guide} onClick={() => download(interviewOnly ? 'token-studio-grill-me.md' : 'token-studio-design-and-ship.md', interviewOnly ? `${guide!.modeInstructions}\n\n${guide!.interviewGuide}` : fullGuide, 'text/markdown')}><Download />{interviewOnly ? 'Tải hướng dẫn phỏng vấn' : 'Tải hướng dẫn'}</button></div>
    </div>
    {error && <p role="alert" className="error-message">{error}</p>}
    <details className="workflow-details"><summary><BookOpen /> Đọc toàn bộ hướng dẫn agent</summary>{guide ? <pre>{fullGuide}</pre> : <p>{error || 'Đang tải hướng dẫn…'}</p>}</details>
    <p className="workflow-note">MCP cung cấp <code>get_workflow</code>, prompt <code>grill_me</code> và <code>design_and_ship</code>. Sao chép yêu cầu sang Codex, Claude hoặc client MCP để bắt đầu. Token Studio cung cấp hướng dẫn và mẫu đặc tả; editor chưa tự vận hành cuộc phỏng vấn AI hay cưỡng chế mọi client tuân thủ.</p>
  </section>;
}
