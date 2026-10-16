import { readFileSync } from 'node:fs';
import { taskInputSchema, validateTask } from '../shared/tasks';
try {
  if (!process.argv[2]) throw new Error('Dùng: node validate-task.cjs <đường-dẫn/task.json>');
  const content = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const result = validateTask(taskInputSchema.parse(content.task ?? content));
  console.log(JSON.stringify({ ...result, evidencePolicy: 'Chỉ kiểm tra hồ sơ được cung cấp; không đọc file liên kết hoặc xác thực ảnh/kiểm thử.' }, null, 2));
  process.exitCode = result.valid ? 0 : 1;
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
