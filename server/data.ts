import { diskSchema } from './store.js';
export const validateData = (value: unknown) => {
  const data = diskSchema.parse(value);
  for (const system of data.systems) if (system.cursor > system.history.length) throw new Error('Lịch sử không hợp lệ.');
  return data;
};
