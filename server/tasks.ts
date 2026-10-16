import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import { z } from 'zod';
import { taskInputSchema, taskRecordSchema, validateTask, type TaskInput, type TaskRecord } from '../shared/tasks.js';
import { StoreError } from './store.js';

const diskSchema = z.object({ schemaVersion: z.literal(1), tasks: z.array(taskRecordSchema).max(1000) }).strict();
export class TaskStore {
  private tasks: TaskRecord[];
  constructor(readonly path: string) {
    this.tasks = existsSync(path) ? diskSchema.parse(JSON.parse(readFileSync(path, 'utf8'))).tasks : [];
    if (new Set(this.tasks.map(t => t.id)).size !== this.tasks.length) throw new Error('Trùng ID tác vụ trong kho dữ liệu.');
  }
  private save(next: TaskRecord[]) {
    mkdirSync(dirname(this.path), { recursive: true });
    const temp = `${this.path}.${process.pid}.tmp`; writeFileSync(temp, JSON.stringify({ schemaVersion: 1, tasks: next }, null, 2), { mode: 0o600 }); renameSync(temp, this.path); this.tasks = next;
  }
  list() { return this.tasks.map(({ id, revision, status, syncedAt, task }) => ({ id, revision, status, syncedAt, title: task.title, project: task.project, mode: task.mode, scope: task.scope })); }
  get(id: string) { const record = this.tasks.find(t => t.id === id); if (!record) throw new StoreError('Không tìm thấy tác vụ.', 404); return structuredClone(record); }
  create(input: TaskInput, id: string = randomUUID()) {
    z.string().uuid().parse(id);
    if (this.tasks.some(t => t.id === id)) throw new StoreError('ID tác vụ đã tồn tại. Đọc bản hiện tại và dùng update_task.', 409);
    if (this.tasks.length >= 1000) throw new StoreError('Tối đa 1000 tác vụ trong kho này.');
    const now = new Date().toISOString(); const record: TaskRecord = { id, revision: 0, status: 'in-progress', createdAt: now, syncedAt: now, completedAt: null, task: taskInputSchema.parse(input) };
    this.save([...this.tasks, record]); return this.get(id);
  }
  private current(id: string, revision: number) { const record = this.get(id); if (record.revision !== revision) throw new StoreError(`Tác vụ đã thay đổi. Đọc lại get_task; revision hiện tại: ${record.revision}.`, 409); return record; }
  update(id: string, input: TaskInput, revision: number) {
    const record = this.current(id, revision), task = taskInputSchema.parse(input);
    const next: TaskRecord = { ...record, task, revision: record.revision + 1, status: 'in-progress', completedAt: null, syncedAt: new Date().toISOString() };
    this.save(this.tasks.map(t => t.id === id ? next : t)); return this.get(id);
  }
  validate(id: string) { const record = this.get(id); return { id, revision: record.revision, ...validateTask(record.task), evidencePolicy: 'Hồ sơ do agent/người dùng cung cấp; server không đọc file dự án hoặc xác thực nội dung ảnh.' }; }
  complete(id: string, revision: number) {
    const record = this.current(id, revision), validation = this.validate(id);
    if (!validation.valid) throw new StoreError(`Chưa thể hoàn tất: ${validation.issues.map(i => i.message).join(' ')}`, 422);
    if (record.status === 'completed') return record;
    const next: TaskRecord = { ...record, status: 'completed', revision: record.revision + 1, completedAt: new Date().toISOString() };
    this.save(this.tasks.map(t => t.id === id ? next : t)); return this.get(id);
  }
}
