import { z } from 'zod';
import { legacyTaskInputSchema, validateLegacyTask, type LegacyTaskInput } from './tasks-v1';
import { canonical, sha256 } from './fingerprint';
export { artifactKinds } from './tasks-v1';
export const taskPolicyVersion = 2;
const id = z.string().trim().min(1).max(100), note = z.string().trim().max(12000).default('');
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const localPath = z.string().min(1).max(6000).refine(p => !/^[\\/]|^[a-z][a-z0-9+.-]*:|[\u0000-\u001f]/i.test(p) && !p.replaceAll('\\', '/').split('/').some(s => s === '..' || s === '') && !p.includes('://'), 'Cần đường dẫn file tương đối trong dự án.');
const fileHash = z.object({ path: localPath, sha256: hash }).strict();
const snapshot = z.object({ phase: z.enum(['plan', 'implementation']), digest: hash, files: z.array(fileHash).max(1000) }).strict();
const issueSchema = z.object({ code: z.string(), message: z.string(), location: z.string() }).strict();
export const taskInputSchema = z.object({
    ...legacyTaskInputSchema.shape, schemaVersion: z.literal(2).default(2),
    scope: z.enum(['screen', 'token-only', 'local-ui']).default('screen'),
    acceptanceCriteria: z.array(z.object({ id, text: z.string().trim().min(1).max(6000), decisionIds: z.array(id).max(100).default([]) }).strict()).max(100).default([]),
    artifacts: z.array(legacyTaskInputSchema.shape.artifacts.unwrap().element.extend({ sha256: hash.optional() })).max(100).default([]),
    checks: z.array(legacyTaskInputSchema.shape.checks.unwrap().element.extend({ criterionIds: z.array(id).max(100).default([]), artifactIds: z.array(id).max(100).default([]), fingerprint: hash.optional() })).max(100).default([]),
    notes: z.object({ scope: note, change: note, handoff: note }).strict().default({ scope: '', change: '', handoff: '' }),
    requirements: z.object({ contrast: z.boolean().default(false), render: z.boolean().default(false) }).strict().default({ contrast: false, render: false }),
    inputs: z.object({ plan: z.array(localPath).max(1000).default([]), implementation: z.array(localPath).max(1000).default([]) }).strict().default({ plan: [], implementation: [] }),
    snapshots: z.object({ plan: snapshot.optional(), implementation: snapshot.optional() }).strict().default({}),
    verification: z.object({ kind: z.enum(['local', 'structure-only']), taskDigest: hash, checkedAt: z.string().datetime(), valid: z.boolean(), issues: z.array(issueSchema).max(2000), files: z.array(fileHash).max(1500) }).strict().optional(),
}).strict().superRefine((task, ctx) => {
    if ((task.mode === 'grill-me' && task.scope !== 'screen') || (task.scope === 'local-ui' && task.mode !== 'refine'))
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'local-ui chỉ dùng với refine; grill-me dùng screen.' });
    for (const group of ['decisions', 'artifacts', 'checks', 'findings', 'acceptanceCriteria'] as const)
        if (new Set(task[group].map(r => r.id)).size !== task[group].length)
            ctx.addIssue({ code: 'custom', path: [group], message: 'ID phải duy nhất trong nhóm.' });
    for (const phase of ['plan', 'implementation'] as const) {
        if (new Set(task.inputs[phase]).size !== task.inputs[phase].length)
            ctx.addIssue({ code: 'custom', path: ['inputs', phase], message: 'Đường dẫn đầu vào bị trùng.' });
        const s = task.snapshots[phase];
        if (s && (s.phase !== phase || new Set(s.files.map(f => f.path)).size !== s.files.length))
            ctx.addIssue({ code: 'custom', path: ['snapshots', phase], message: 'Snapshot sai phase hoặc trùng file.' });
    }
});
export type TaskInput = z.infer<typeof taskInputSchema>;
export const acceptedTaskSchema = z.union([taskInputSchema, legacyTaskInputSchema]);
export type TaskContent = TaskInput | LegacyTaskInput;
export const taskRecordSchema = z.object({ id: z.string().uuid(), revision: z.number().int().min(0), status: z.enum(['in-progress', 'completed']), createdAt: z.string().datetime(), syncedAt: z.string().datetime(), completedAt: z.string().datetime().nullable(), completionPolicyVersion: z.number().int().optional(), task: acceptedTaskSchema }).strict();
export type TaskRecord = z.infer<typeof taskRecordSchema>;
export interface TaskIssue {
    code: string;
    message: string;
    location: string;
}
export function taskDigest(task: TaskInput) { const { verification: _, ...content } = task; return sha256(canonical(content)); }
export function planPaths(task: TaskInput) { return [...new Set([...task.inputs.plan, ...task.artifacts.filter(a => ['spec', 'design'].includes(a.kind) && !/^https?:/i.test(a.path)).map(a => a.path)])].sort(); }
export function snapshotDigest(task: TaskInput, phase: 'plan' | 'implementation', files: {
    path: string;
    sha256: string;
}[]) {
    const sorted = [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const plan = { goal: task.goal, project: task.project, mode: task.mode, scope: task.scope, decisions: task.decisions, direction: task.direction, acceptanceCriteria: task.acceptanceCriteria, scopeNote: task.notes.scope, change: task.notes.change, requirements: task.requirements, paths: planPaths(task) };
    return sha256(canonical(phase === 'plan' ? { plan, files: sorted } : { plan: task.snapshots.plan?.digest, paths: task.inputs.implementation, files: sorted }));
}
export function checkPhase(task: TaskInput, kind: TaskInput['checks'][number]['kind']) { return task.mode === 'grill-me' || kind === 'before-code' ? 'plan' : 'implementation'; }
export function upgradeTask(legacy: TaskContent): TaskInput {
    if (legacy.schemaVersion === 2)
        return structuredClone(legacy);
    return taskInputSchema.parse({ ...legacy, schemaVersion: 2, acceptanceCriteria: legacy.acceptanceCriteria.map((text, i) => ({ id: `AC-${String(i + 1).padStart(2, '0')}`, text, decisionIds: [] })), checks: legacy.checks.map(c => ({ ...c, status: 'pending', criterionIds: [], artifactIds: [] })) });
}
export function validateTask(task: TaskContent, options: {
    requireLocal?: boolean;
} = {}) {
    const issues: TaskIssue[] = [];
    const add = (code: string, message: string, location: string) => issues.push({ code, message, location });
    if (task.schemaVersion === 1)
        return { valid: false, issues: [{ code: 'upgrade', message: 'Cần nâng hồ sơ v1 lên v2 để nghiệm thu theo chuẩn mới.', location: 'schemaVersion' }, ...validateLegacyTask(task).issues] };
    const decisions = new Map(task.decisions.map(d => [d.id, d])), artifacts = new Map(task.artifacts.map(a => [a.id, a]));
    const sourced = (d: TaskInput['decisions'][number]) => d.status === 'resolved' && d.source !== 'unresolved' && !!d.answer && !!d.evidence;
    if (!task.acceptanceCriteria.length)
        add('acceptance', 'Cần tiêu chí nghiệm thu cụ thể.', 'acceptanceCriteria');
    for (const d of task.decisions)
        if (d.material && !sourced(d))
            add('decision', `Quyết định chưa rõ hoặc thiếu nguồn: ${d.question}`, `decisions.${d.id}`);
    for (const c of task.acceptanceCriteria) {
        if (!c.decisionIds.length || c.decisionIds.some(i => !decisions.has(i) || !sourced(decisions.get(i)!)))
            add('criterion-source', `Tiêu chí ${c.id} cần quyết định đã rõ và có nguồn.`, `acceptanceCriteria.${c.id}`);
        if (!task.checks.some(k => k.kind === 'acceptance' && k.status === 'passed' && k.evidence && k.criterionIds.includes(c.id) && k.artifactIds.length))
            add('criterion-result', `Tiêu chí ${c.id} chưa có kiểm tra nghiệm thu đạt và bằng chứng.`, `acceptanceCriteria.${c.id}`);
    }
    for (const phase of ['plan', 'implementation'] as const) {
        if (phase === 'implementation' && task.mode === 'grill-me')
            continue;
        const s = task.snapshots[phase], paths = phase === 'plan' ? planPaths(task) : task.inputs.implementation;
        if (!s || s.digest !== snapshotDigest(task, phase, s.files) || paths.some(p => !s.files.some(f => f.path === p)) || (phase === 'implementation' && !paths.length))
            add('snapshot', `Cần snapshot ${phase} khớp các đầu vào liên quan.`, `snapshots.${phase}`);
    }
    for (const c of task.checks) {
        const loc = `checks.${c.id}`;
        if (c.required && (c.status !== 'passed' || !c.evidence))
            add('check', `Kiểm tra bắt buộc chưa đạt: ${c.label}`, loc);
        if (c.criterionIds.some(i => !task.acceptanceCriteria.some(a => a.id === i)) || c.artifactIds.some(i => !artifacts.has(i)))
            add('reference', `Kiểm tra ${c.id} liên kết ID không tồn tại.`, loc);
        if (c.status === 'passed') {
            if (!c.evidence || !c.artifactIds.length)
                add('check-evidence', `Kiểm tra ${c.id} cần bằng chứng có liên kết.`, loc);
            if (!c.fingerprint || c.fingerprint !== task.snapshots[checkPhase(task, c.kind)]?.digest)
                add('freshness', `Bằng chứng ${c.id} không khớp snapshot hiện tại.`, loc);
            for (const aid of c.artifactIds) {
                const a = artifacts.get(aid);
                if (a && (!a.sha256 || /^https?:/i.test(a.path)))
                    add('artifact-hash', `Bằng chứng ${aid} cần file local và SHA-256 đã ghi nhận.`, loc);
            }
        }
    }
    for (const f of task.findings)
        if (f.severity !== 'minor' && (f.status !== 'fixed' || !f.repair || !f.recheck))
            add('finding', `Cần sửa và kiểm tra lại ${f.severity}: ${f.observation}`, `findings.${f.id}`);
    task.limitations.forEach((l, i) => { if (l.blocking)
        add('limitation', l.message, `limitations.${i}`); });
    const artifact = (kind: TaskInput['artifacts'][number]['kind']) => { if (!task.artifacts.some(a => a.kind === kind))
        add('artifact', `Cần liên kết ${kind}.`, `artifacts.${kind}`); };
    const check = (kind: TaskInput['checks'][number]['kind']) => { if (!task.checks.some(c => c.kind === kind && c.status === 'passed' && c.evidence))
        add('check', `Cần kết quả ${kind}.`, `checks.${kind}`); };
    const renders = task.artifacts.filter(a => a.kind === 'render' && a.viewport);
    if (task.mode === 'grill-me')
        artifact('spec');
    else if (task.scope !== 'screen') {
        if (!task.notes.scope || !task.notes.change || !task.notes.handoff)
            add('scope-notes', 'Cần phạm vi, kết quả thay đổi và bàn giao ngắn.', 'notes');
        check('affected');
        if (task.scope === 'local-ui' || task.requirements.render) {
            if (!renders.length)
                add('render', 'Cần ảnh vùng ảnh hưởng kèm viewport.', 'artifacts.render');
        }
        if (task.requirements.contrast)
            check('contrast');
    }
    else {
        artifact('design');
        artifact('review');
        artifact('handoff');
        check('before-code');
        check('primary-flow');
        check('after-render');
        if (task.direction.source === 'unresolved' || !task.direction.summary || !task.direction.evidence)
            add('direction', 'Hướng thiết kế cần có nội dung và nguồn.', 'direction');
        if (!renders.length)
            add('render', 'Cần ảnh render kèm viewport.', 'artifacts.render');
        if (task.mode === 'design-and-build') {
            artifact('spec');
            if (!renders.some(a => a.viewport!.width <= 640))
                add('mobile', 'Cần ảnh màn hình nhỏ ≤640px.', 'artifacts.render');
            if (!renders.some(a => a.viewport!.width >= 1024))
                add('desktop', 'Cần ảnh desktop ≥1024px.', 'artifacts.render');
        }
        if (task.mode === 'replicate') {
            artifact('reference');
            if (!task.artifacts.some(a => a.kind === 'reference' && a.viewport && renders.some(r => r.viewport!.width === a.viewport!.width && r.viewport!.height === a.viewport!.height)))
                add('reference-viewport', 'Cần render và tham chiếu cùng viewport.', 'artifacts.reference');
        }
    }
    if (options.requireLocal !== false) {
        const v = task.verification;
        if (!v || v.kind !== 'local' || !v.valid || v.issues.length || v.taskDigest !== taskDigest(task))
            add('local-verification', 'Cần báo cáo verify local đạt và khớp nội dung hồ sơ hiện tại.', 'verification');
        else {
            for (const a of task.artifacts.filter(a => !/^https?:/i.test(a.path)))
                if (!v.files.some(f => f.path === a.path && (!a.sha256 || a.sha256 === f.sha256)))
                    add('local-file', `Báo cáo chưa kiểm chứng file ${a.path}.`, `artifacts.${a.id}`);
            for (const s of Object.values(task.snapshots))
                if (s)
                    for (const f of s.files)
                        if (!v.files.some(r => r.path === f.path && r.sha256 === f.sha256))
                            add('local-input', `Báo cáo thiếu hash đầu vào ${f.path}.`, 'verification');
            if (new Set(v.files.map(f => f.path)).size !== v.files.length)
                add('local-input', 'Báo cáo có đường dẫn trùng.', 'verification');
        }
    }
    return { valid: issues.length === 0, issues };
}
export function evidenceLevel(task: TaskContent) { if (task.schemaVersion === 1)
    return 'legacy'; if (!task.verification || task.verification.kind === 'structure-only')
    return 'structure-only'; return validateTask(task).valid ? 'local-reported' : 'needs-verification'; }
