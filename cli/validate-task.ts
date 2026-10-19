import { readFileSync, writeFileSync, renameSync, copyFileSync, existsSync, realpathSync, rmSync } from 'node:fs';
import { dirname, resolve, basename, join, relative, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { acceptedTaskSchema, taskInputSchema, upgradeTask, validateTask } from '../shared/tasks';
import { captureSnapshot, artifactHashes, verifyFiles } from './task-files';
try {
    const args = process.argv.slice(2), command = ['upgrade', 'snapshot', 'verify'].includes(args[0]) ? args.shift()! : 'verify';
    const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { 'project-root': { type: 'string' }, phase: { type: 'string' }, 'structure-only': { type: 'boolean' }, write: { type: 'boolean' } } });
    if (positionals.length !== 1)
        throw new Error('Dùng: validate-task.cjs [upgrade|snapshot|verify] <task.json> [--project-root ROOT] [--phase plan|implementation] [--write] [--structure-only]');
    const path = resolve(positionals[0]), original = readFileSync(path), content = JSON.parse(original.toString('utf8'));
    const task = acceptedTaskSchema.parse(content.task ?? content);
    function save(next: unknown, backup = false) {
        if (!readFileSync(path).equals(original))
            throw new Error('task.json đã được sửa trong lúc kiểm tra. Chạy lại.');
        if (backup)
            copyFileSync(path, `${path}.${randomUUID()}.bak`, 1);
        const tmp = `${path}.${randomUUID()}.tmp`;
        try {
            writeFileSync(tmp, JSON.stringify(content.task ? { ...content, task: next } : next, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
            if (!readFileSync(path).equals(original))
                throw new Error('task.json thay đổi trước khi ghi.');
            renameSync(tmp, path);
        }
        finally {
            rmSync(tmp, { force: true });
        }
    }
    if (command === 'upgrade') {
        const next = upgradeTask(task);
        if (task.schemaVersion === 1)
            save(next, true);
        console.log(JSON.stringify({ task: next, message: 'Nâng hồ sơ giữ bằng chứng cũ; các kiểm tra cần liên kết và kiểm tra lại. Không tự đánh dấu đạt.' }, null, 2));
    }
    else {
        if (task.schemaVersion !== 2)
            throw new Error('Hồ sơ v1: chạy upgrade trước; chuẩn cũ vẫn được giữ trong Studio.');
        let root = values['project-root'] ? realpathSync(resolve(values['project-root'])) : undefined;
        if (!root) {
            const dir = dirname(path), parent = dirname(dir);
            if (basename(parent) === 'tasks' && basename(dirname(parent)) === '.token-studio')
                root = dirname(dirname(parent));
        }
        if (!root && !values['structure-only'])
            throw new Error('Không xác định được gốc dự án. Thêm --project-root ROOT hoặc đặt hồ sơ ở .token-studio/tasks/<UUID>/task.json.');
        if (root) {
            const rel = relative(realpathSync(root), realpathSync(path));
            if (!rel || rel === '..' || rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(rel))
                throw new Error('task.json phải nằm trong project root.');
        }
        if (command === 'snapshot') {
            if (!root || !['plan', 'implementation'].includes(values.phase || ''))
                throw new Error('snapshot yêu cầu project root và --phase plan|implementation.');
            const phase = values.phase as 'plan' | 'implementation';
            // A task JSON cannot be one of its own fingerprint inputs.
            if ([...task.inputs.plan, ...task.inputs.implementation, ...task.artifacts.filter(a => ['spec', 'design'].includes(a.kind)).map(a => a.path)].some(p => existsSync(join(root!, p)) && realpathSync(join(root!, p)) === realpathSync(path)))
                throw new Error('Không dùng task.json làm đầu vào snapshot của chính nó.');
            const snapshot = captureSnapshot(task, root, phase);
            const hashes = artifactHashes(task, root);
            if (values.write) {
                task.snapshots[phase] = snapshot;
                save(task);
            }
            console.log(JSON.stringify({ snapshot, artifactHashes: hashes, message: 'Chỉ ghi snapshot khi --write; không sửa kết quả kiểm tra, fingerprint của kiểm tra hoặc hash bằng chứng cũ.' }, null, 2));
        }
        else {
            const report = verifyFiles(task, root || '.', !!values['structure-only']);
            if (values.write) {
                task.verification = report;
                save(taskInputSchema.parse(task));
            }
            console.log(JSON.stringify({ ...report, evidencePolicy: 'Báo cáo file/hash tại dự án; không chạy lệnh, xác thực nội dung ảnh hay chứng nhận thiết kế. Structure-only không đủ hoàn tất.' }, null, 2));
            process.exitCode = report.valid ? 0 : 1;
        }
    }
}
catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
