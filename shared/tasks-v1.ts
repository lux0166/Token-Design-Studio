import { z } from 'zod';
import { workflowModes } from './workflow';
const text = z.string().trim().min(1).max(6000);
const note = z.string().trim().max(12000).default('');
const identifier = z.string().trim().min(1).max(100);
export const artifactKinds = ['spec', 'design', 'review', 'handoff', 'reference', 'render', 'test', 'change'] as const;
const artifactPath = text.refine(value => {
    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);
            return !url.username && !url.password;
        }
        catch {
            return false;
        }
    }
    return !/^[\\/]|^[a-z][a-z0-9+.-]*:|[\u0000-\u001f]/i.test(value) && !value.replaceAll('\\', '/').split('/').includes('..') && !value.includes('://');
}, 'Dùng đường dẫn tương đối trong dự án hoặc URL HTTP(S), không dùng đường dẫn máy cá nhân.');
export const legacyTaskInputSchema = z.object({
    schemaVersion: z.literal(1).default(1),
    title: z.string().trim().min(1).max(120), goal: text, project: z.string().trim().min(1).max(300),
    mode: z.enum(workflowModes).default('design-and-build'), scope: z.enum(['screen', 'token-only']).default('screen'),
    decisions: z.array(z.object({
        id: identifier, question: text, answer: note, material: z.boolean().default(true),
        status: z.enum(['open', 'conflicting', 'resolved']).default('open'),
        source: z.enum(['human', 'project', 'reference', 'delegated', 'unresolved']).default('unresolved'), evidence: note,
    }).strict()).max(100).default([]),
    direction: z.object({ source: z.enum(['human', 'project', 'reference', 'delegated', 'unresolved']).default('unresolved'), summary: note, evidence: note }).strict().default({ source: 'unresolved', summary: '', evidence: '' }),
    acceptanceCriteria: z.array(text).max(100).default([]),
    artifacts: z.array(z.object({ id: identifier, kind: z.enum(artifactKinds), path: artifactPath, label: text,
        viewport: z.object({ width: z.number().int().min(1).max(20000), height: z.number().int().min(1).max(20000) }).strict().optional(),
    }).strict()).max(100).default([]),
    checks: z.array(z.object({ id: identifier, label: text, kind: z.enum(['before-code', 'primary-flow', 'after-render', 'contrast', 'affected', 'acceptance']), status: z.enum(['pending', 'passed', 'failed', 'blocked']).default('pending'), required: z.boolean().default(true), evidence: note }).strict()).max(100).default([]),
    findings: z.array(z.object({ id: identifier, location: text, observation: text, evidence: text, impact: text, severity: z.enum(['blocker', 'major', 'minor']), status: z.enum(['open', 'fixed', 'deferred', 'out-of-scope']).default('open'), repair: note, recheck: note }).strict()).max(100).default([]),
    limitations: z.array(z.object({ message: text, blocking: z.boolean().default(true) }).strict()).max(50).default([]),
}).strict().superRefine((task, ctx) => {
    if (task.scope === 'token-only' && task.mode === 'grill-me')
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Grill-me dùng phạm vi screen; không thay token.' });
    for (const group of ['decisions', 'artifacts', 'checks', 'findings'] as const) {
        if (new Set(task[group].map(row => row.id)).size !== task[group].length)
            ctx.addIssue({ code: 'custom', path: [group], message: 'ID phải duy nhất trong nhóm.' });
    }
});
export type LegacyTaskInput = z.infer<typeof legacyTaskInputSchema>;
export const legacyTaskRecordSchema = z.object({ id: z.string().uuid(), revision: z.number().int().min(0), status: z.enum(['in-progress', 'completed']), createdAt: z.string().datetime(), syncedAt: z.string().datetime(), completedAt: z.string().datetime().nullable(), task: legacyTaskInputSchema }).strict();
export type LegacyTaskRecord = z.infer<typeof legacyTaskRecordSchema>;
export interface TaskIssue {
    code: string;
    message: string;
    location: string;
}
export function validateLegacyTask(task: LegacyTaskInput) {
    const issues: TaskIssue[] = [];
    const add = (code: string, message: string, location: string) => issues.push({ code, message, location });
    if (!task.acceptanceCriteria.length)
        add('acceptance', 'Cần tiêu chí nghiệm thu cụ thể.', 'acceptanceCriteria');
    for (const decision of task.decisions)
        if (decision.material && (decision.status !== 'resolved' || decision.source === 'unresolved' || !decision.answer || !decision.evidence))
            add('decision', `Quyết định quan trọng chưa rõ hoặc thiếu nguồn: ${decision.question}`, `decisions.${decision.id}`);
    for (const check of task.checks)
        if (check.required && (check.status !== 'passed' || !check.evidence))
            add('check', `Kiểm tra bắt buộc chưa đạt hoặc thiếu bằng chứng: ${check.label}`, `checks.${check.id}`);
    for (const finding of task.findings)
        if (finding.severity !== 'minor' && (finding.status !== 'fixed' || !finding.repair || !finding.recheck))
            add('finding', `Cần sửa và kiểm tra lại ${finding.severity}: ${finding.observation}`, `findings.${finding.id}`);
    for (const [i, limitation] of task.limitations.entries())
        if (limitation.blocking)
            add('limitation', limitation.message, `limitations.${i}`);
    const artifact = (kind: typeof artifactKinds[number]) => {
        if (!task.artifacts.some(a => a.kind === kind))
            add('artifact', `Cần liên kết ${kind}.`, `artifacts.${kind}`);
    };
    const check = (kind: LegacyTaskInput['checks'][number]['kind']) => {
        if (!task.checks.some(c => c.kind === kind && c.status === 'passed' && c.evidence))
            add('check', `Cần kết quả kiểm tra ${kind} có bằng chứng.`, `checks.${kind}`);
    };
    if (task.mode === 'grill-me') {
        artifact('spec');
        return { valid: issues.length === 0, issues };
    }
    artifact('handoff');
    if (task.scope === 'token-only') {
        artifact('change');
        check('affected');
        return { valid: issues.length === 0, issues };
    }
    artifact('design');
    artifact('review');
    check('before-code');
    check('primary-flow');
    check('after-render');
    if (task.direction.source === 'unresolved' || !task.direction.summary || !task.direction.evidence)
        add('direction', 'Hướng thiết kế cần có nội dung và nguồn xác nhận/tham chiếu/quyền đã giao.', 'direction');
    const renders = task.artifacts.filter(a => a.kind === 'render' && a.viewport);
    if (!renders.length)
        add('render', 'Cần ảnh render kèm kích thước viewport.', 'artifacts.render');
    if (task.mode === 'design-and-build') {
        artifact('spec');
        if (!renders.some(a => a.viewport!.width <= 640))
            add('mobile', 'Cần bằng chứng render trên màn hình nhỏ (≤640px).', 'artifacts.render');
        if (!renders.some(a => a.viewport!.width >= 1024))
            add('desktop', 'Cần bằng chứng render desktop (≥1024px).', 'artifacts.render');
    }
    if (task.mode === 'replicate') {
        artifact('reference');
        if (!task.artifacts.some(a => a.kind === 'reference' && a.viewport && renders.some(r => r.viewport!.width === a.viewport!.width && r.viewport!.height === a.viewport!.height)))
            add('reference-viewport', 'Cần ảnh render và tham chiếu tại cùng viewport.', 'artifacts.reference');
    }
    return { valid: issues.length === 0, issues };
}
