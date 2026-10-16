import test from "node:test";
import assert from "node:assert/strict";
import { initialData, today, type Assessment } from "../src/lib/data";
import { applyAssessment, validateBooking } from "../src/lib/store";

const booking = () => ({
  studentId: "s1",
  teacherId: "t1",
  date: today,
  time: "11:00",
  duration: 50,
  title: "Practice",
});
const assessment = (): Assessment => ({
  id: "review-test",
  studentId: "s3",
  lessonId: "l3",
  date: today,
  score: 8,
  summary: "Clearer answers and stronger examples.",
  homework: "Practice interview questions.",
});

test("Rejects a teacher collision even for a different learner", () => {
  const result = validateBooking(
    { ...booking(), studentId: "s2", time: "14:25" },
    initialData(),
  );
  assert.match(result!, /Giáo viên/);
});
test("Rejects a learner collision with a different teacher", () => {
  const result = validateBooking(
    { ...booking(), teacherId: "t2", time: "08:20" },
    initialData(),
  );
  assert.match(result!, /Học viên/);
});
test("Allows adjacent slots and ignores cancelled lessons", () => {
  const data = initialData();
  assert.equal(validateBooking({ ...booking(), time: "08:50" }, data), null);
  data.lessons = data.lessons.map((l) =>
    l.id === "l1" ? { ...l, status: "cancelled" } : l,
  );
  assert.equal(validateBooking({ ...booking(), time: "08:00" }, data), null);
});
test("Validates references, dates, duration, title and end of day", () => {
  const data = initialData();
  for (const draft of [
    { ...booking(), studentId: "missing" },
    { ...booking(), teacherId: "missing" },
    { ...booking(), date: "2026-02-31" },
    { ...booking(), date: "invalid" },
    { ...booking(), time: "24:00" },
    { ...booking(), time: "23:30" },
    { ...booking(), duration: 17 },
    { ...booking(), title: "  " },
  ])
    assert.notEqual(validateBooking(draft, data), null);
  assert.equal(validateBooking(booking(), data), null);
});
test("A review completes the lesson and updates progress without mutating the previous snapshot", () => {
  const data = initialData(),
    original = structuredClone(data);
  const updated = applyAssessment(data, assessment());
  assert.deepEqual(data, original);
  assert.equal(updated.lessons.find((l) => l.id === "l3")!.status, "completed");
  const learner = updated.students.find((s) => s.id === "s3")!;
  assert.equal(learner.completed, 9);
  assert.equal(learner.progress, 45);
  assert.equal(learner.note, assessment().summary);
  assert.equal(updated.assessments.length, data.assessments.length + 1);
});
test("An already completed lesson is not counted again; duplicate reviews are rejected", () => {
  const data = initialData();
  const entry = { ...assessment(), studentId: "s1", lessonId: "l1" };
  const updated = applyAssessment(data, entry);
  assert.equal(updated.students[0].completed, data.students[0].completed);
  assert.throws(
    () => applyAssessment(updated, { ...entry, id: "another" }),
    /đã có đánh giá/,
  );
});
test("Cancelled lessons, mismatched learners and invalid scores cannot be reviewed", () => {
  const data = initialData();
  assert.throws(() =>
    applyAssessment(data, { ...assessment(), studentId: "s1" }),
  );
  for (const score of [0, 11, 1.5, NaN])
    assert.throws(() => applyAssessment(data, { ...assessment(), score }));
  data.lessons = data.lessons.map((l) =>
    l.id === "l3" ? { ...l, status: "cancelled" } : l,
  );
  assert.throws(() => applyAssessment(data, assessment()));
});
test("Optional assessed skills update the profile with bounded integer scores", () => {
  const data = initialData();
  const skills = { listening: 65, speaking: 62, reading: 70, writing: 57 };
  const updated = applyAssessment(data, { ...assessment(), skills });
  assert.deepEqual(updated.students.find((s) => s.id === "s3")!.skills, skills);
  assert.notEqual(updated.students.find((s) => s.id === "s3")!.skills, skills);
  assert.throws(() =>
    applyAssessment(data, {
      ...assessment(),
      skills: { ...skills, speaking: 101 },
    }),
  );
  assert.throws(() =>
    applyAssessment(data, {
      ...assessment(),
      skills: { ...skills, reading: 4.5 },
    }),
  );
});
