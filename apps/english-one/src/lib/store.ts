import { useCallback, useEffect, useState } from "react";
import {
  initialData,
  type AppData,
  type Lesson,
  type Student,
  type Assessment,
} from "./data";
export const storageKey = "fluento.academy.v1";
export function validateBooking(
  lesson: Omit<Lesson, "id" | "status">,
  data: AppData,
): string | null {
  if (
    !data.students.some((s) => s.id === lesson.studentId) ||
    !data.teachers.some((t) => t.id === lesson.teacherId)
  )
    return "Chọn học viên và giáo viên hợp lệ.";
  const parsedDate = new Date(`${lesson.date}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date) ||
    !Number.isFinite(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== lesson.date ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(lesson.time)
  )
    return "Ngày và giờ học không hợp lệ.";
  if (!lesson.title.trim() || lesson.title.length > 120)
    return "Nhập nội dung buổi học, tối đa 120 ký tự.";
  if (![25, 50, 80].includes(lesson.duration))
    return "Thời lượng buổi học không hợp lệ.";
  const minutes = (time: string) =>
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const start = minutes(lesson.time),
    end = start + lesson.duration;
  if (end > 24 * 60) return "Buổi học phải kết thúc trong cùng ngày.";
  const collision = data.lessons.find(
    (l) =>
      l.date === lesson.date &&
      l.status !== "cancelled" &&
      (l.teacherId === lesson.teacherId || l.studentId === lesson.studentId) &&
      start < minutes(l.time) + l.duration &&
      end > minutes(l.time),
  );
  if (collision)
    return collision.teacherId === lesson.teacherId
      ? "Giáo viên đã có buổi học trong khoảng giờ này. Hãy chọn giờ khác."
      : "Học viên đã có lịch trong khoảng giờ này. Hãy chọn giờ khác.";
  return null;
}
export function applyAssessment(data: AppData, entry: Assessment): AppData {
  const lesson = data.lessons.find(
    (l) => l.id === entry.lessonId && l.studentId === entry.studentId,
  );
  if (!lesson || lesson.status === "cancelled")
    throw new Error("Buổi học không hợp lệ.");
  if (data.assessments.some((a) => a.lessonId === entry.lessonId))
    throw new Error("Buổi học này đã có đánh giá.");
  if (
    !Number.isInteger(entry.score) ||
    entry.score < 1 ||
    entry.score > 10 ||
    !entry.summary.trim()
  )
    throw new Error("Nhập nhận xét và điểm từ 1 đến 10.");
  if (
    entry.skills &&
    (["listening", "speaking", "reading", "writing"] as const).some(
      (key) =>
        !Number.isInteger(entry.skills![key]) ||
        entry.skills![key] < 0 ||
        entry.skills![key] > 100,
    )
  )
    throw new Error("Điểm kỹ năng phải là số nguyên từ 0 đến 100.");
  const wasCompleted = lesson.status === "completed";
  return {
    ...data,
    assessments: [...data.assessments, entry],
    lessons: data.lessons.map((l) =>
      l.id === lesson.id
        ? { ...l, status: "completed", feedback: entry.summary }
        : l,
    ),
    students: data.students.map((s) => {
      if (s.id !== entry.studentId) return s;
      const completed = Math.min(s.total, s.completed + (wasCompleted ? 0 : 1));
      return {
        ...s,
        completed,
        progress: Math.round((completed / s.total) * 100),
        note: entry.summary,
        skills: entry.skills ? { ...entry.skills } : s.skills,
      };
    }),
  };
}
function load(): AppData {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const value = JSON.parse(raw);
      if (
        value.version === 1 &&
        Array.isArray(value.students) &&
        Array.isArray(value.lessons) &&
        Array.isArray(value.teachers) &&
        Array.isArray(value.assessments)
      )
        return value;
    }
  } catch {
    /* A failed local read falls back to clearly labeled sample data. */
  }
  return initialData();
}
export function useAcademy() {
  const [data, setData] = useState<AppData>(load);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [data]);
  const update = useCallback(
    (fn: (data: AppData) => AppData) => setData((previous) => fn(previous)),
    [],
  );
  const addStudent = (student: Student) =>
    update((data) => ({ ...data, students: [...data.students, student] }));
  const book = (lesson: Lesson) =>
    update((data) => ({ ...data, lessons: [...data.lessons, lesson] }));
  return { data, update, addStudent, book, saveError };
}
