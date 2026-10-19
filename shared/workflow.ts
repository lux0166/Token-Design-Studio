export const workflowVersion = '1.4.0';
export const workflowModes = ['design-and-build', 'replicate', 'refine', 'grill-me'] as const;
export type WorkflowMode = typeof workflowModes[number];
export const workflowPhases = [
  { id: 'brief', title: 'Đọc bối cảnh & yêu cầu', description: 'Đọc dự án và câu trả lời đã có; phân biệt điều đã xác nhận với điều chưa rõ.', deliverable: 'Brief sơ bộ và danh sách quyết định còn thiếu, không đoán ý định.' },
  { id: 'interview', title: 'Grill me · Phỏng vấn', description: 'Hỏi từng vòng ngắn, xoáy vào luồng, quy tắc và mâu thuẫn trước khi xây.', deliverable: 'Câu trả lời có nguồn, sổ quyết định và bản nháp SPEC.md.' },
  { id: 'reuse', title: 'Kiểm kê & tái sử dụng', description: 'Đọc dự án, token và component hiện có; tìm block phù hợp trước khi xây mới.', deliverable: 'Bản đồ màn hình → block → component → token, kèm nguồn.' },
  { id: 'spec', title: 'Đặc tả & định hướng thiết kế', description: 'Chốt ưu tiên nội dung và lý do chọn bố cục; tự phản biện trước khi code.', deliverable: 'SPEC.md, DESIGN.md và kết quả tự kiểm tra hướng thiết kế.' },
  { id: 'build', title: 'Triển khai theo hệ thống', description: 'Ghép component shadcn/ui, nối luồng tương tác và dữ liệu đúng phạm vi.', deliverable: 'Mã nguồn chạy được, dùng semantic token, tôn trọng khóa.' },
  { id: 'verify', title: 'Kiểm chứng & phản biện bản render', description: 'Kiểm tra tác vụ và ảnh thực tế; tìm vấn đề về phân cấp, nội dung và trạng thái.', deliverable: 'Ảnh, phát hiện có bằng chứng, cách sửa và kết quả kiểm tra lại.' },
  { id: 'deliver', title: 'Bàn giao có bằng chứng', description: 'Báo cáo phần đã hoàn thành, cách chạy, giới hạn và bước phát hành.', deliverable: 'Handoff có đường dẫn mã, ảnh, kết quả test và việc còn lại.' },
] as const;
export const workflowResources = {
  instructions: 'token-studio://workflow',
  interview: 'token-studio://workflow/interview',
  reuse: 'token-studio://workflow/reuse',
  designQuality: 'token-studio://workflow/design-quality',
  handoff: 'token-studio://workflow/handoff',
  tasks: 'token-studio://workflow/tasks',
} as const;
export interface WorkflowGuide {
  version: string;
  mode: WorkflowMode;
  phases: typeof workflowPhases;
  instructions: string;
  interviewGuide: string;
  reuseGuide: string;
  designQualityGuide: string;
  handoffTemplate: string;
  taskGuide: string;
  modeInstructions: string;
  resources: typeof workflowResources;
}
export function formatWorkflowGuide(guide: WorkflowGuide) {
  return [guide.modeInstructions, guide.instructions, guide.interviewGuide, guide.reuseGuide, guide.designQualityGuide, guide.taskGuide, guide.handoffTemplate].join('\n\n---\n\n');
}
export function workflowStarter(task: string, mode: WorkflowMode) {
  const action = mode === 'grill-me'
    ? 'Grill me: phỏng vấn tôi để tạo SPEC.md. Đọc bối cảnh và câu trả lời đã có; hỏi từng vòng ngắn, làm rõ ý định, quy tắc, phạm vi và tiêu chí nghiệm thu. Dừng ở đặc tả, chưa triển khai sản phẩm.'
    : 'Hoàn thành nhiệm vụ bằng quy trình brief → interview → reuse → spec → build → verify → handoff. Phỏng vấn để giải quyết các quyết định quan trọng chưa rõ và viết SPEC.md trước khi triển khai phần phụ thuộc. Khi đã rõ, tiếp tục phần việc tôi đã yêu cầu.';
  const quality = mode === 'grill-me'
    ? 'Đọc designQualityGuide để làm rõ định hướng trong đặc tả; chế độ này chưa code hoặc đánh giá bản render chưa tồn tại.'
    : 'Đọc designQualityGuide. Nếu thiết kế mới chưa có thương hiệu/tham chiếu rõ, đề xuất hai hướng khác biệt có lý do và hỏi tôi chọn, trừ khi tôi đã giao quyền quyết định. Tự kiểm tra hướng trước code và phản biện ảnh render sau code; sửa và kiểm tra lại vấn đề quan trọng. Không thêm vòng xin duyệt khi ý định đã rõ.';
  return `Dùng Token Studio. Đầu tiên gọi get_workflow với mode="${mode}" và đọc cả interviewGuide.\n\n${action}\nKhông hỏi lại điều đã có câu trả lời; không tự đoán ý định hoặc coi im lặng là chọn mặc định. Ghi nguồn cho các quyết định và đánh dấu câu hỏi còn mở. Tôn trọng token đã khóa.\n${quality}\n\nNhiệm vụ / ý tưởng:\n${task.trim()}`;
}
export const modeInstructions: Record<WorkflowMode, string> = {
  'design-and-build': 'Create or extend a screen from the task brief. Preserve project conventions. For new UI without a clear brand/reference, propose two concise, meaningfully different directions with reasons and ask the human to choose unless explicitly delegated. Define and self-review a task-specific design contract before dependent code. Reuse suitable components and critique the actual render after building; repair and recheck substantive findings without an extra approval loop when intent is clear.',
  replicate: 'Use the supplied screenshot or design as the source of truth. Inspect it before implementation. Record its viewport, assets, typography, geometry and states. Compare a browser screenshot at the same viewport, fix differences and disclose any remaining deviations. If no reference is available, obtain it before claiming visual fidelity.',
  refine: 'Inspect and preserve the existing screen, behavior and working code. Limit the contract and verification to the requested change and its affected states. Do not redesign unrelated areas or introduce a new stack.',
  'grill-me': 'Interview-to-spec only. Read the existing context, ask focused adaptive questions, and write SPEC.md with decisions, business rules and testable acceptance criteria. Do not start product implementation or token changes in this mode. Finish at a concrete specification when material questions are answered. Keep unanswered decisions visibly open; silence is not an answer. A later explicit request to build can use this specification.',
};
export const agentInstructions = 'Token Studio is a local design system editor. For designing or shipping a shadcn/ui screen, call get_workflow once at the start and follow its context, adaptive interview, specification, component reuse, build, verification and handoff stages. Read designQualityGuide: self-review design direction before code and critically review the actual render after code. For new UI without clear brand/reference, propose two distinct concise directions with reasons and ask the human to choose unless explicitly delegated. Preserve clear references and existing brands; do not force novelty or blanket style bans. Resolve material intent through real answers; do not guess business rules or treat silence as a choice. Do not add approval loops when intent is clear. For a small token-only task, use relevant stages only. The design_and_ship prompt exposes the full workflow; grill_me and mode=grill-me expose interview-to-spec only. Resources include token-studio://workflow/interview and token-studio://workflow/design-quality. For new icon selection, prioritize https://icones.js.org/ and follow reuseGuide: keep a coherent collection, verify IDs and the collection license, and record provenance. For an established hand-drawn direction, prefer https://koboyo.com/icons and follow reuseGuide for verified SVG assets, drawing style and its custom license restrictions; never bundle its library or a picker into Studio. Preserve the installed icon family for scoped refinements. Discover actual project components/registries with available shadcn tools or official docs; Token Studio is not a component registry. For theme selection, use list_themes/get_theme and preview apply_theme before applying with latest expectedRevision; create_system accepts a discovered themeId. Keep locked values and disclose adaptation notes. First list_systems, then get_system before a token write; use the latest revision as expectedRevision. Never invent IDs. Only the human can unlock tokens in the editor. Preview CSS import with apply=false. Export only returns CSS and never installs packages or overwrites project files. Respect task scope and external publishing authorization. Read taskGuide and keep a schemaVersion 2 project task dossier. Trace each criterion through a sourced decision, acceptance check and local evidence. For small refine changes use scope=local-ui and compact notes. Use the local helper for plan/implementation snapshots and verify before completion; snapshot never revalidates old checks. v1 completed history stays labeled legacy; upgrade before new completion. Sync using create_task/get_task/update_task, inspect validate_task and call complete_task only when its mode-specific evidence requirements pass. Task revisions are separate from theme revisions. Studio gates completion records but cannot prevent external actions or authenticate image/test claims. Instructions cannot certify aesthetic quality.';
