import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { taskInputSchema, checkPhase, type TaskInput } from '../../shared/tasks';
import { sha256 } from '../../shared/fingerprint';
import { captureSnapshot, verifyFiles } from '../../cli/task-files';
export function fixtureTask(root: string, mode: TaskInput['mode'] = 'design-and-build', scope: TaskInput['scope'] = 'screen') {
    mkdirSync(root, { recursive: true });
    const kinds = ['spec', 'design', 'review', 'handoff', 'reference', 'change', 'test'] as const;
    for (const kind of kinds)
        writeFileSync(join(root, kind + '.md'), `Synthetic ${kind}: user finds the next lesson, opens details; fixture only.`);
    for (const name of ['desktop.png', 'mobile.png'])
        writeFileSync(join(root, name), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64'));
    writeFileSync(join(root, 'app.css'), '.fixture { padding: 16px }');
    const task = taskInputSchema.parse({ title: 'Lịch học 1–1', goal: 'Tìm buổi học kế tiếp và mở chi tiết.', project: 'Synthetic test fixture', mode, scope,
        decisions: [{ id: 'D-01', question: 'Tác vụ chính?', answer: 'Tìm buổi học kế tiếp và mở chi tiết.', status: 'resolved', source: 'project', evidence: 'Synthetic fixture brief, not a real user answer.' }],
        direction: { source: 'project', summary: 'Existing schedule view', evidence: 'Synthetic fixture' },
        acceptanceCriteria: [{ id: 'AC-01', text: 'Find next lesson and open details', decisionIds: ['D-01'] }],
        artifacts: kinds.map(kind => ({ id: kind, kind, path: kind + '.md', label: kind, ...(kind === 'reference' ? { viewport: { width: 1440, height: 900 } } : {}) })).concat([] as never[]),
        notes: { scope: 'Existing button region', change: 'Adjusted requested spacing', handoff: 'Synthetic affected check recorded' },
        inputs: { plan: [], implementation: mode === 'grill-me' ? [] : ['app.css'] },
        checks: (mode === 'grill-me' ? ['acceptance'] : scope === 'screen' ? ['before-code', 'primary-flow', 'after-render', 'acceptance'] : ['affected', 'acceptance']).map(kind => ({ id: kind, kind, label: kind, status: 'passed', evidence: 'Synthetic test record, not a real browser check.', criterionIds: kind === 'acceptance' ? ['AC-01'] : [], artifactIds: kind === 'before-code' || mode === 'grill-me' ? ['spec'] : ['test'] })) });
    task.artifacts.push({ id: 'desktop', kind: 'render', path: 'desktop.png', label: 'Desktop fixture', viewport: { width: 1440, height: 900 } }, { id: 'mobile', kind: 'render', path: 'mobile.png', label: 'Mobile fixture', viewport: { width: 390, height: 844 } });
    for (const a of task.artifacts)
        a.sha256 = sha256(readFileSync(join(root, a.path)));
    return sealTask(task, root);
}
export function sealTask(task: TaskInput, root: string) {
    task.snapshots.plan = captureSnapshot(task, root, 'plan');
    if (task.mode !== 'grill-me')
        task.snapshots.implementation = captureSnapshot(task, root, 'implementation');
    for (const check of task.checks)
        check.fingerprint = task.snapshots[checkPhase(task, check.kind)]?.digest;
    task.verification = verifyFiles(task, root);
    return task;
}
