export const workflowVersion = '1.1.0';
export const workflowModes = ['design-and-build', 'replicate', 'refine', 'grill-me'] as const;
export type WorkflowMode = typeof workflowModes[number];
export const workflowPhases = [
  { id: 'brief', title: 'Đọc bối cảnh & yêu cầu', description: 'Đọc dự án và câu trả lời đã có; phân biệt điều đã xác nhận với điều chưa rõ.', deliverable: 'Brief sơ bộ và danh sách quyết định còn thiếu, không đoán ý định.' },
  { id: 'interview', title: 'Grill me · Phỏng vấn', description: 'Hỏi từng vòng ngắn, xoáy vào luồng, quy tắc và mâu thuẫn trước khi xây.', deliverable: 'Câu trả lời có nguồn, sổ quyết định và bản nháp SPEC.md.' },
  { id: 'reuse', title: 'Kiểm kê & tái sử dụng', description: 'Đọc dự án, token và component hiện có; tìm block phù hợp trước khi xây mới.', deliverable: 'Bản đồ màn hình → block → component → token, kèm nguồn.' },
  { id: 'spec', title: 'Hoàn thiện đặc tả', description: 'Chốt phạm vi, quy tắc, tiêu chí nghiệm thu và thiết kế có thể xây.', deliverable: 'SPEC.md truy vết câu trả lời; DESIGN.md cho bố cục và trạng thái.' },
  { id: 'build', title: 'Triển khai theo hệ thống', description: 'Ghép component shadcn/ui, nối luồng tương tác và dữ liệu đúng phạm vi.', deliverable: 'Mã nguồn chạy được, dùng semantic token, tôn trọng khóa.' },
  { id: 'verify', title: 'Kiểm chứng bằng trình duyệt', description: 'Đối chiếu ảnh cùng viewport; kiểm tra tác vụ chính, bàn phím và lỗi.', deliverable: 'Ảnh thực tế, kết quả kiểm tra và danh sách sai lệch đã xử lý.' },
  { id: 'deliver', title: 'Bàn giao có bằng chứng', description: 'Báo cáo phần đã hoàn thành, cách chạy, giới hạn và bước phát hành.', deliverable: 'Handoff có đường dẫn mã, ảnh, kết quả test và việc còn lại.' },
] as const;
export const workflowResources = {
  instructions: 'token-studio://workflow',
  interview: 'token-studio://workflow/interview',
  reuse: 'token-studio://workflow/reuse',
  handoff: 'token-studio://workflow/handoff',
} as const;
export interface WorkflowGuide {
  version: string;
  mode: WorkflowMode;
  phases: typeof workflowPhases;
  instructions: string;
  interviewGuide: string;
  reuseGuide: string;
  handoffTemplate: string;
  modeInstructions: string;
  resources: typeof workflowResources;
}
export function workflowStarter(task: string, mode: WorkflowMode) {
  const action = mode === 'grill-me'
    ? 'Grill me: phỏng vấn tôi để tạo SPEC.md. Đọc bối cảnh và câu trả lời đã có; hỏi từng vòng ngắn, làm rõ ý định, quy tắc, phạm vi và tiêu chí nghiệm thu. Dừng ở đặc tả, chưa triển khai sản phẩm.'
    : 'Hoàn thành nhiệm vụ bằng quy trình brief → interview → reuse → spec → build → verify → handoff. Phỏng vấn để giải quyết các quyết định quan trọng chưa rõ và viết SPEC.md trước khi triển khai phần phụ thuộc. Khi đã rõ, tiếp tục phần việc tôi đã yêu cầu.';
  return `Dùng Token Studio. Đầu tiên gọi get_workflow với mode="${mode}" và đọc cả interviewGuide.\n\n${action}\nKhông hỏi lại điều đã có câu trả lời; không tự đoán ý định hoặc coi im lặng là chọn mặc định. Ghi nguồn cho các quyết định và đánh dấu câu hỏi còn mở. Tôn trọng token đã khóa.\n\nNhiệm vụ / ý tưởng:\n${task.trim()}`;
}
export const modeInstructions: Record<WorkflowMode, string> = {
  'design-and-build': 'Create or extend a screen from the task brief. Preserve the project conventions. Define a concrete design contract before implementing unfamiliar UI. Reuse installed components and suitable verified blocks.',
  replicate: 'Use the supplied screenshot or design as the source of truth. Inspect it before implementation. Record its viewport, assets, typography, geometry and states. Compare a browser screenshot at the same viewport, fix differences and disclose any remaining deviations. If no reference is available, obtain it before claiming visual fidelity.',
  refine: 'Inspect and preserve the existing screen, behavior and working code. Limit the contract and verification to the requested change and its affected states. Do not redesign unrelated areas or introduce a new stack.',
  'grill-me': 'Interview-to-spec only. Read the existing context, ask focused adaptive questions, and write SPEC.md with decisions, business rules and testable acceptance criteria. Do not start product implementation or token changes in this mode. Finish at a concrete specification when material questions are answered. Keep unanswered decisions visibly open; silence is not an answer. A later explicit request to build can use this specification.',
};
export const agentInstructions = 'Token Studio is a local design system editor. For designing or shipping a shadcn/ui screen, call get_workflow once at the start and follow its context, adaptive interview, specification, component reuse, build, verification and handoff stages. Resolve material intent through real user answers before dependent implementation; do not guess business rules or treat silence as a choice. For a small token-only task, use only the relevant stages. The design_and_ship prompt exposes the full workflow; grill_me and get_workflow mode=grill-me expose interview-to-spec only. The token-studio://workflow/interview resource contains the interview guide and SPEC.md template. Discover actual project components/registries with available shadcn tools or official docs; Token Studio is not itself a component registry. For theme selection, use list_themes/get_theme and preview apply_theme before applying with the latest expectedRevision; create_system accepts a discovered themeId. Keep locked values and disclose adaptation notes. First list_systems, then get_system before a token write. Use the returned latest workspace revision as expectedRevision. Never invent IDs. Locked tokens cannot be changed; only the human can unlock them in the editor. Preview CSS import with apply=false before applying. Export only returns CSS and never installs packages or overwrites project files. Respect the human task scope; external publishing remains subject to its authorization. Workflow instructions guide the agent but do not enforce behavior on the client.';
