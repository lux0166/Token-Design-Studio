import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquareText,
  Plus,
  Sparkles,
  Target,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PersonAvatar,
  StudentStatus,
  ProgressLine,
  Level,
  LessonStatus,
  Empty,
} from "./common";
import {
  formatDate,
  roadmapSteps,
  skillLabels,
  today,
  type AppData,
  type Assessment,
  type Lesson,
  type Student,
} from "@/lib/data";
import { validateBooking } from "@/lib/store";

export function Choice({
  label,
  value,
  onChange,
  options,
  id,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export function BookingDialog({
  data,
  date,
  studentId,
  onClose,
  onSave,
}: {
  data: AppData;
  date: string;
  studentId?: string;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
}) {
  const [learner, setLearner] = useState(
    studentId ?? data.students[0]?.id ?? "",
  );
  const [teacher, setTeacher] = useState(
    data.students.find((s) => s.id === learner)?.teacherId ??
      data.teachers[0]?.id ??
      "",
  );
  const [day, setDay] = useState(date);
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("50");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="form-dialog">
        <DialogHeader>
          <div className="dialog-symbol tone-violet">
            <CalendarDays />
          </div>
          <DialogTitle>Đặt lịch học 1–1</DialogTitle>
          <DialogDescription>
            Một buổi học đúng lúc, một bước gần hơn đến mục tiêu.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const draft = {
              studentId: learner,
              teacherId: teacher,
              date: day,
              time,
              duration: Number(duration),
              title: title.trim(),
            };
            const problem = validateBooking(draft, data);
            if (problem) {
              setError(problem);
              return;
            }
            setSaving(true);
            onSave({ ...draft, id: crypto.randomUUID(), status: "upcoming" });
            toast.success("Đã đặt lịch học", {
              description: `${time} · ${formatDate(day)}. Lịch được lưu trên trình duyệt.`,
            });
            onClose();
          }}
        >
          <FieldGroup className="form-fields">
            <Field>
              <FieldLabel htmlFor="booking-student">Học viên</FieldLabel>
              <Choice
                id="booking-student"
                label="Học viên"
                value={learner}
                onChange={(id) => {
                  setLearner(id);
                  setTeacher(
                    data.students.find((s) => s.id === id)?.teacherId ??
                      teacher,
                  );
                  setError("");
                }}
                options={data.students.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="booking-teacher">
                Giáo viên đồng hành
              </FieldLabel>
              <Choice
                id="booking-teacher"
                label="Giáo viên đồng hành"
                value={teacher}
                onChange={(v) => {
                  setTeacher(v);
                  setError("");
                }}
                options={data.teachers.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
              />
            </Field>
            <div className="form-two-columns">
              <Field>
                <FieldLabel htmlFor="booking-date">Ngày học</FieldLabel>
                <Input
                  id="booking-date"
                  type="date"
                  value={day}
                  min={today}
                  required
                  onInput={(e) => {
                    setDay(e.currentTarget.value);
                    setError("");
                  }}
                  onChange={(e) => {
                    setDay(e.target.value);
                    setError("");
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="booking-time">Giờ bắt đầu</FieldLabel>
                <Input
                  id="booking-time"
                  type="time"
                  value={time}
                  required
                  onInput={(e) => {
                    setTime(e.currentTarget.value);
                    setError("");
                  }}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setError("");
                  }}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Thời lượng</FieldLabel>
              <Choice
                label="Thời lượng"
                value={duration}
                onChange={setDuration}
                options={[
                  { value: "25", label: "25 phút · Buổi ngắn" },
                  { value: "50", label: "50 phút · Tiêu chuẩn" },
                  { value: "80", label: "80 phút · Chuyên sâu" },
                ]}
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="booking-title">Nội dung buổi học</FieldLabel>
              <Input
                id="booking-title"
                placeholder="Ví dụ: Giao tiếp trong cuộc họp"
                value={title}
                maxLength={120}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
              <FieldDescription>
                Giờ Việt Nam (GMT+7). Hệ thống kiểm tra trùng lịch học viên và
                giáo viên.
              </FieldDescription>
            </Field>
          </FieldGroup>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="local-info">
            <CalendarDays />
            <span>
              Lịch được lưu cục bộ. Chưa tự gửi thông báo hoặc tạo phòng video.
            </span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Để sau
            </Button>
            <Button type="submit" disabled={saving}>
              <Check data-icon="inline-start" />
              {saving ? "Đang lưu…" : "Xác nhận đặt lịch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function AddStudentDialog({
  data,
  onClose,
  onSave,
}: {
  data: AppData;
  onClose: () => void;
  onSave: (s: Student) => void;
}) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [goal, setGoal] = useState("Giao tiếp trong công việc");
  const [level, setLevel] = useState("A2"),
    [target, setTarget] = useState("B1"),
    [teacher, setTeacher] = useState(data.teachers[0].id),
    [total, setTotal] = useState(24);
  const [error, setError] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="form-dialog">
        <DialogHeader>
          <div className="dialog-symbol tone-mint">
            <GraduationCap />
          </div>
          <DialogTitle>Chào đón học viên mới</DialogTitle>
          <DialogDescription>
            Bắt đầu từ mục tiêu. Xây dựng một hành trình phù hợp.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              data.students.some(
                (s) => s.email.toLowerCase() === email.trim().toLowerCase(),
              )
            ) {
              setError("Email này đã có trong danh sách học viên.");
              return;
            }
            if (!name.trim() || !goal.trim() || total < 4 || total > 100) {
              setError("Kiểm tra họ tên, mục tiêu và số buổi từ 4 đến 100.");
              return;
            }
            const initials = name
              .trim()
              .split(/\s+/)
              .slice(-2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            onSave({
              id: crypto.randomUUID(),
              name: name.trim(),
              email: email.trim(),
              initials,
              color: "violet",
              goal: goal.trim(),
              level,
              target,
              teacherId: teacher,
              progress: 0,
              completed: 0,
              total,
              status: "attention",
              joined: today,
              balance: 0,
              skills: { listening: 0, speaking: 0, reading: 0, writing: 0 },
              note: "Chưa có đánh giá kỹ năng đầu vào. Giáo viên cần bổ sung sau buổi đầu tiên.",
            });
            toast.success("Đã thêm học viên", {
              description: "Hồ sơ mới đã sẵn sàng để lên lịch học.",
            });
            onClose();
          }}
        >
          <FieldGroup className="form-fields">
            <Field>
              <FieldLabel htmlFor="student-name">Họ và tên</FieldLabel>
              <Input
                id="student-name"
                placeholder="Nguyễn Minh Anh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="student-email">Email</FieldLabel>
              <Input
                id="student-email"
                type="email"
                placeholder="hocvien@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="student-goal">Mục tiêu học tập</FieldLabel>
              <Input
                id="student-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                maxLength={100}
                required
              />
            </Field>
            <div className="form-two-columns">
              <Field>
                <FieldLabel>Trình độ hiện tại</FieldLabel>
                <Choice
                  label="Trình độ hiện tại"
                  value={level}
                  onChange={setLevel}
                  options={["A1", "A2", "B1", "B2", "C1"].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Field>
              <Field>
                <FieldLabel>Mục tiêu năng lực</FieldLabel>
                <Choice
                  label="Mục tiêu năng lực"
                  value={target}
                  onChange={setTarget}
                  options={["A1", "A2", "B1", "B2", "C1", "C2"].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Field>
            </div>
            <div className="form-two-columns">
              <Field>
                <FieldLabel>Giáo viên phụ trách</FieldLabel>
                <Choice
                  label="Giáo viên phụ trách"
                  value={teacher}
                  onChange={setTeacher}
                  options={data.teachers.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="student-total">Số buổi dự kiến</FieldLabel>
                <Input
                  id="student-total"
                  type="number"
                  min={4}
                  max={100}
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  required
                />
              </Field>
            </div>
          </FieldGroup>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              <Plus data-icon="inline-start" />
              Tạo hồ sơ học viên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function StudentDialog({
  student,
  data,
  onClose,
  onBook,
  onLesson,
}: {
  student: Student;
  data: AppData;
  onClose: () => void;
  onBook: (id: string) => void;
  onLesson: (l: Lesson) => void;
}) {
  const teacher = data.teachers.find((t) => t.id === student.teacherId);
  const history = data.assessments
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lessons = data.lessons
    .filter((l) => l.studentId === student.id && l.status !== "cancelled")
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="profile-dialog">
        <DialogHeader className="profile-header">
          <PersonAvatar initials={student.initials} color={student.color} />
          <div>
            <DialogTitle>{student.name}</DialogTitle>
            <DialogDescription>
              <Mail />
              {student.email}
            </DialogDescription>
          </div>
          <StudentStatus status={student.status} />
        </DialogHeader>
        <div className="profile-summary">
          <div>
            <span>Mục tiêu học tập</span>
            <strong>{student.goal}</strong>
          </div>
          <div>
            <span>Năng lực</span>
            <strong>
              {student.level}
              <ChevronRight />
              {student.target}
            </strong>
          </div>
          <div>
            <span>Giáo viên đồng hành</span>
            <strong>{teacher?.name}</strong>
          </div>
          <div>
            <span>Hành trình</span>
            <strong>
              {student.completed}
              <small> / {student.total} buổi</small>
            </strong>
          </div>
        </div>
        <Tabs defaultValue="overview" className="profile-tabs">
          <TabsList>
            <TabsTrigger value="overview">Hồ sơ năng lực</TabsTrigger>
            <TabsTrigger value="roadmap">Lộ trình riêng</TabsTrigger>
            <TabsTrigger value="history">Sau mỗi buổi học</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="profile-section">
              <h3>Từng kỹ năng, từng bước tiến</h3>
              <p>Điểm năng lực do giáo viên theo dõi, theo thang 100.</p>
              <div className="skill-bars">
                {Object.entries(student.skills).map(([key, value]) => (
                  <div key={key}>
                    <span>{skillLabels[key as keyof typeof skillLabels]}</span>
                    <ProgressLine value={value} />
                    <strong>
                      {value}
                      <small>/100</small>
                    </strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="teacher-note">
              <MessageSquareText />
              <div>
                <h4>Ghi chú từ giáo viên</h4>
                <p>{student.note}</p>
              </div>
            </div>
            <div className="profile-progress">
              <div>
                <span>Hoàn thành lộ trình</span>
                <strong>{student.progress}%</strong>
              </div>
              <ProgressLine value={student.progress} />
            </div>
          </TabsContent>
          <TabsContent value="roadmap">
            <div className="roadmap-intro">
              <Target />
              <div>
                <h3>
                  {student.level} đến {student.target}, theo nhịp của bạn.
                </h3>
                <p>
                  Lộ trình tham khảo được điều chỉnh theo mục tiêu:{" "}
                  {student.goal.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="roadmap-timeline">
              {roadmapSteps.map((step, i) => {
                const complete = student.progress >= (i + 1) * 25;
                const active = !complete && student.progress >= i * 25;
                return (
                  <div
                    key={step.title}
                    className={complete ? "complete" : active ? "current" : ""}
                  >
                    <span>{complete ? <Check /> : i + 1}</span>
                    <div>
                      <h4>
                        {step.title}
                        {active && <Badge variant="secondary">Đang học</Badge>}
                      </h4>
                      <p>{step.desc}</p>
                      <small>
                        Chặng {i + 1} · khoảng {Math.round(student.total / 4)}{" "}
                        buổi
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="future-note">
              <Sparkles />
              <p>
                Giai đoạn tiếp theo: AI hỗ trợ đề xuất bài tập. Hiện tại lộ
                trình và nhận xét do giáo viên phụ trách.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="assessment-history">
              {history.length ? (
                history.map((a) => (
                  <div className="assessment-entry" key={a.id}>
                    <div>
                      <span>
                        <CalendarDays />
                        {formatDate(a.date, { day: "numeric", month: "long" })}
                      </span>
                      <Badge variant="secondary">{a.score}/10</Badge>
                    </div>
                    <p>{a.summary}</p>
                    {a.homework && (
                      <small>
                        <BookOpenIcon />
                        Bài tập: {a.homework}
                      </small>
                    )}
                  </div>
                ))
              ) : (
                <Empty
                  title="Những bước tiến sắp được ghi lại"
                  description="Nhận xét từ giáo viên sẽ xuất hiện tại đây sau mỗi buổi học."
                />
              )}
            </div>
            <h4 className="upcoming-title">Các buổi học đã lên lịch</h4>
            <div className="profile-lessons">
              {lessons.slice(0, 5).map((l) => (
                <button key={l.id} onClick={() => onLesson(l)}>
                  <span>
                    <strong>{l.title}</strong>
                    <small>
                      {formatDate(l.date, { day: "2-digit", month: "2-digit" })}{" "}
                      · {l.time}
                    </small>
                  </span>
                  <LessonStatus status={l.status} />
                  <ChevronRight />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng hồ sơ
          </Button>
          <Button onClick={() => onBook(student.id)}>
            <CalendarDays data-icon="inline-start" />
            Đặt lịch cho học viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function BookOpenIcon() {
  return <FileText />;
}
export function LessonDialog({
  lesson,
  data,
  onClose,
  onAssess,
  onCancel,
}: {
  lesson: Lesson;
  data: AppData;
  onClose: () => void;
  onAssess: (a: Assessment) => boolean;
  onCancel: () => void;
}) {
  const student = data.students.find((s) => s.id === lesson.studentId)!;
  const teacher = data.teachers.find((t) => t.id === lesson.teacherId)!;
  const existing = data.assessments.find((a) => a.lessonId === lesson.id);
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [homework, setHomework] = useState(existing?.homework ?? "");
  const [score, setScore] = useState(String(existing?.score ?? 7));
  const [tab, setTab] = useState(existing ? "review" : "details");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [updateSkills, setUpdateSkills] = useState(!!existing?.skills);
  const [skills, setSkills] = useState(
    existing?.skills ?? { ...student.skills },
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="form-dialog lesson-dialog">
        <DialogHeader>
          <div className="dialog-top-label">
            <Badge variant="outline">LỚP HỌC 1–1</Badge>
            <LessonStatus status={lesson.status} />
          </div>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>
            {formatDate(lesson.date)} · {lesson.time} · {lesson.duration} phút
          </DialogDescription>
        </DialogHeader>
        <div className="lesson-people">
          <div>
            <PersonAvatar initials={student.initials} color={student.color} />
            <div>
              <small>Học viên</small>
              <strong>{student.name}</strong>
            </div>
          </div>
          <div>
            <PersonAvatar initials={teacher.initials} color={teacher.color} />
            <div>
              <small>Giáo viên</small>
              <strong>{teacher.name}</strong>
            </div>
          </div>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="details">Thông tin buổi học</TabsTrigger>
            <TabsTrigger value="review">Nhận xét & bài tập</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="lesson-focus">
              <Target />
              <div>
                <h3>Mục tiêu cá nhân</h3>
                <p>
                  {student.goal} · {student.level} → {student.target}
                </p>
              </div>
            </div>
            <div className="teacher-note">
              <MessageSquareText />
              <div>
                <h4>Cần chú ý trong buổi học</h4>
                <p>{student.note}</p>
              </div>
            </div>
            <div className="video-placeholder">
              <Video />
              <strong>Sẵn sàng cho buổi học 1–1</strong>
              <p>
                Bản thiết kế chưa kết nối Zoom / Google Meet. Lịch, hồ sơ và
                nhận xét vẫn có thể trải nghiệm đầy đủ.
              </p>
              <Button variant="outline" disabled>
                Chưa kết nối phòng học
              </Button>
            </div>
            {lesson.status !== "cancelled" && !existing && (
              <Button className="full-width" onClick={() => setTab("review")}>
                <MessageSquareText data-icon="inline-start" />
                Ghi nhận xét sau buổi học
              </Button>
            )}
            {lesson.status === "upcoming" && (
              <div className="cancel-lesson">
                {cancelConfirm ? (
                  <>
                    <span>Hủy buổi học này?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelConfirm(false)}
                    >
                      Giữ lịch
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onCancel();
                        toast.success("Đã hủy buổi học trên lịch cục bộ.");
                        onClose();
                      }}
                    >
                      Xác nhận hủy
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancelConfirm(true)}
                  >
                    Hủy lịch học
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="review">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (existing || lesson.status === "cancelled") return;
                const saved = onAssess({
                  id: crypto.randomUUID(),
                  studentId: student.id,
                  lessonId: lesson.id,
                  date: today,
                  score: Number(score),
                  summary: summary.trim(),
                  homework: homework.trim(),
                  ...(updateSkills ? { skills } : {}),
                });
                if (!saved) return;
                toast.success("Đã ghi nhận bước tiến mới", {
                  description: "Nhận xét đã được thêm vào hồ sơ học viên.",
                });
                onClose();
              }}
            >
              <FieldGroup className="form-fields">
                <Field>
                  <FieldLabel>Đánh giá buổi học</FieldLabel>
                  <Choice
                    disabled={!!existing || lesson.status === "cancelled"}
                    label="Điểm đánh giá"
                    value={score}
                    onChange={setScore}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: String(i + 1),
                      label: `${i + 1} / 10`,
                    }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="review-summary">
                    Nhận xét từ giáo viên
                  </FieldLabel>
                  <Textarea
                    id="review-summary"
                    placeholder="Học viên đã tiến bộ như thế nào? Cần tập trung điều gì?"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    minLength={10}
                    maxLength={1500}
                    required
                    disabled={!!existing}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="review-homework">
                    Bài tập sau buổi học
                  </FieldLabel>
                  <Textarea
                    id="review-homework"
                    placeholder="Một bài tập vừa sức để duy trì tiến bộ…"
                    value={homework}
                    maxLength={1000}
                    onChange={(e) => setHomework(e.target.value)}
                    disabled={!!existing}
                  />
                </Field>
                <Field>
                  <div className="skills-update-toggle">
                    <Checkbox
                      id="update-skills"
                      checked={updateSkills}
                      onCheckedChange={(v) => setUpdateSkills(v === true)}
                      disabled={!!existing || lesson.status === "cancelled"}
                    />
                    <FieldLabel htmlFor="update-skills">
                      Cập nhật hồ sơ bốn kỹ năng
                    </FieldLabel>
                  </div>
                  <FieldDescription>
                    Chỉ cập nhật khi đã đánh giá. Điểm 0–100 là nhận định của
                    giáo viên, không phải kết quả quy đổi CEFR.
                  </FieldDescription>
                </Field>
                {updateSkills && (
                  <div className="form-two-columns">
                    {Object.entries(skillLabels).map(([key, label]) => (
                      <Field key={key}>
                        <FieldLabel htmlFor={`skill-${key}`}>
                          {label} / 100
                        </FieldLabel>
                        <Input
                          id={`skill-${key}`}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          required
                          value={skills[key as keyof typeof skills]}
                          disabled={!!existing || lesson.status === "cancelled"}
                          onChange={(e) =>
                            setSkills((previous) => ({
                              ...previous,
                              [key]: Number(e.target.value),
                            }))
                          }
                        />
                      </Field>
                    ))}
                  </div>
                )}
              </FieldGroup>
              <p className="local-info">
                <FileText />
                Đánh giá thủ công từ giáo viên; chưa sử dụng AI.
              </p>
              {!existing && lesson.status !== "cancelled" && (
                <Button
                  type="submit"
                  className="full-width"
                  disabled={summary.trim().length < 10}
                >
                  <Check data-icon="inline-start" />
                  Lưu nhận xét & hoàn thành buổi học
                </Button>
              )}
              {existing && (
                <p className="review-saved">
                  <Check />
                  Nhận xét này đã được lưu trong hồ sơ.
                </p>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
