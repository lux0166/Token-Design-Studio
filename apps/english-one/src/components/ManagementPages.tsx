import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Wallet,
  BookOpen,
  Video,
  Headphones,
  Settings2,
  Bell,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PersonAvatar,
  Panel,
  StudentStatus,
  ProgressLine,
  Empty,
  Pager,
  SearchField,
  Level,
  TextAction,
} from "./common";
import { Choice } from "./Dialogs";
import { MiniCalendar } from "./Calendar";
import { LessonRows } from "./Dashboard";
import { cn } from "@/lib/utils";
import {
  formatDate,
  money,
  roadmapSteps,
  shiftDate,
  today,
  type AppData,
  type Lesson,
  type Role,
  type Student,
  type Teacher,
} from "@/lib/data";

export function downloadText(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function StudentsPage({
  data,
  role,
  query,
  onQuery,
  onStudent,
  onAdd,
}: {
  data: AppData;
  role: Role;
  query: string;
  onQuery: (q: string) => void;
  onStudent: (s: Student) => void;
  onAdd: () => void;
}) {
  const [filter, setFilter] = useState("all"),
    [teacher, setTeacher] = useState("all"),
    [page, setPage] = useState(1);
  const all = data.students.filter(
    (s) => role !== "teacher" || s.teacherId === "t1",
  );
  const matching = all.filter(
    (s) =>
      (filter === "all" || s.status === filter) &&
      (teacher === "all" || s.teacherId === teacher) &&
      `${s.name} ${s.email} ${s.goal}`
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
  );
  useEffect(() => setPage(1), [filter, teacher, query]);
  const exportCsv = () => {
    const cell = (s: string | number) => `"${String(s).replaceAll('"', '""')}"`;
    const rows = [
      ["Học viên", "Email", "Mục tiêu", "Trình độ", "Tiến độ", "Giáo viên"],
      ...matching.map((s) => [
        s.name,
        s.email,
        s.goal,
        s.level,
        `${s.progress}%`,
        data.teachers.find((t) => t.id === s.teacherId)?.name ?? "",
      ]),
    ];
    downloadText(
      "fluento-hoc-vien.csv",
      "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\n"),
      "text/csv;charset=utf-8",
    );
    toast.success("Đã xuất danh sách học viên đang lọc.");
  };
  return (
    <>
      <div className="page-subhead">
        <p>
          <strong>{all.length} học viên</strong> · Những hành trình khác nhau,
          cùng một sự đồng hành.
        </p>
        <div>
          <Button variant="outline" onClick={exportCsv}>
            <Download data-icon="inline-start" />
            Xuất danh sách
          </Button>
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Thêm học viên
          </Button>
        </div>
      </div>
      <Panel
        title={
          role === "teacher" ? "Học viên của tôi" : "Học viên của trung tâm"
        }
        description="Theo sát mục tiêu, năng lực và tiến độ của từng người."
        className="students-panel"
      >
        <div className="table-toolbar">
          <SearchField
            value={query}
            onChange={onQuery}
            placeholder="Tìm theo tên, email, mục tiêu…"
            label="Tìm học viên"
          />
          <div>
            <Choice
              label="Lọc trạng thái học viên"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "good", label: "Đang tiến bộ" },
                { value: "attention", label: "Cần hỗ trợ" },
                { value: "slow", label: "Chậm tiến độ" },
              ]}
            />
            {role === "admin" && (
              <Choice
                label="Lọc giáo viên"
                value={teacher}
                onChange={setTeacher}
                options={[
                  { value: "all", label: "Tất cả giáo viên" },
                  ...data.teachers.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            )}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Mục tiêu học tập</TableHead>
              <TableHead>Trình độ</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Giáo viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="sr-only">Xem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matching.slice((page - 1) * 8, page * 8).map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <button className="person-cell" onClick={() => onStudent(s)}>
                    <PersonAvatar initials={s.initials} color={s.color} />
                    <span>
                      <strong>{s.name}</strong>
                      <small>{s.email}</small>
                    </span>
                  </button>
                </TableCell>
                <TableCell>{s.goal}</TableCell>
                <TableCell>
                  <Level level={s.level} />
                  <span className="level-arrow">→</span>
                  <Level level={s.target} />
                </TableCell>
                <TableCell>
                  <ProgressLine value={s.progress} withLabel />
                  <small className="muted-text">
                    {s.completed}/{s.total} buổi
                  </small>
                </TableCell>
                <TableCell>
                  {data.teachers.find((t) => t.id === s.teacherId)?.name}
                </TableCell>
                <TableCell>
                  <StudentStatus status={s.status} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Xem hồ sơ ${s.name}`}
                    onClick={() => onStudent(s)}
                  >
                    <ChevronRight />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!matching.length && (
          <Empty
            title="Chưa tìm thấy học viên"
            description="Thử một tên khác hoặc bỏ bớt bộ lọc."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  onQuery("");
                  setFilter("all");
                  setTeacher("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            }
          />
        )}
        <Pager
          total={matching.length}
          page={page}
          perPage={8}
          onPage={setPage}
        />
      </Panel>
    </>
  );
}
export function TeachersPage({
  data,
  query,
  onSchedule,
  onSave,
}: {
  data: AppData;
  query: string;
  onSchedule: (id: string) => void;
  onSave: (t: Teacher) => void;
}) {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [specialty, setSpecialty] = useState("Giao tiếp tiếng Anh"),
    [error, setError] = useState("");
  const filtered = data.teachers.filter((t) =>
    `${t.name} ${t.specialty} ${t.country}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-subhead">
        <p>Những người thầy tạo nên sự khác biệt cho từng học viên.</p>
        <Button onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" />
          Thêm giáo viên
        </Button>
      </div>
      <div className="teacher-grid">
        {filtered.map((t) => (
          <Card key={t.id} className="teacher-card">
            <CardHeader>
              <div className="teacher-card-top">
                <PersonAvatar initials={t.initials} color={t.color} />
                <Badge
                  variant="secondary"
                  className={cn(
                    "status-badge",
                    t.available ? "student-good" : "student-slow",
                  )}
                >
                  {t.available ? "Đang nhận lớp" : "Đã kín lịch"}
                </Badge>
              </div>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.specialty}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="teacher-country">
                <span>
                  {t.country === "Việt Nam"
                    ? "VN"
                    : t.country === "Anh Quốc"
                      ? "UK"
                      : "US"}
                </span>
                {t.country}
                <i />
                {t.experience}
              </div>
              <div className="teacher-metrics">
                <div>
                  <strong>
                    {data.students.filter((s) => s.teacherId === t.id).length}
                  </strong>
                  <small>Học viên</small>
                </div>
                <div>
                  <strong>
                    {
                      data.lessons.filter(
                        (l) =>
                          l.teacherId === t.id &&
                          l.date === today &&
                          l.status !== "cancelled",
                      ).length
                    }
                  </strong>
                  <small>Buổi hôm nay</small>
                </div>
                <div>
                  <strong>1–1</strong>
                  <small>Hình thức dạy</small>
                </div>
              </div>
              <p className="teacher-email">
                <Mail />
                {t.email}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="full-width"
                onClick={() => onSchedule(t.id)}
              >
                <CalendarDays data-icon="inline-start" />
                Xem lịch giảng dạy
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="Không tìm thấy giáo viên"
          description="Thử tìm theo tên hoặc chuyên môn khác."
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Thêm giáo viên đồng hành</DialogTitle>
            <DialogDescription>
              Tạo hồ sơ giảng dạy cho trung tâm.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                data.teachers.some(
                  (t) => t.email.toLowerCase() === email.trim().toLowerCase(),
                )
              ) {
                setError("Email giáo viên đã tồn tại.");
                return;
              }
              onSave({
                id: crypto.randomUUID(),
                name: name.trim(),
                email: email.trim(),
                specialty: specialty.trim(),
                country: "Việt Nam",
                experience: "Giáo viên mới",
                available: true,
                color: "violet",
                initials: name
                  .trim()
                  .split(/\s+/)
                  .slice(-2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase(),
              });
              toast.success("Đã tạo hồ sơ giáo viên.");
              setOpen(false);
              setName("");
              setEmail("");
            }}
          >
            <FieldGroup className="form-fields">
              <Field>
                <FieldLabel htmlFor="teacher-name">Họ tên giáo viên</FieldLabel>
                <Input
                  id="teacher-name"
                  value={name}
                  maxLength={60}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="teacher-email">Email giáo viên</FieldLabel>
                <Input
                  id="teacher-email"
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="teacher-specialty">Chuyên môn</FieldLabel>
                <Input
                  id="teacher-specialty"
                  value={specialty}
                  maxLength={100}
                  required
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </Field>
            </FieldGroup>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu hồ sơ giáo viên</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function SchedulePage({
  data,
  selectedDate,
  onDate,
  teacherId,
  onTeacher,
  onLesson,
  onBook,
}: {
  data: AppData;
  selectedDate: string;
  onDate: (d: string) => void;
  teacherId: string;
  onTeacher: (id: string) => void;
  onLesson: (l: Lesson) => void;
  onBook: () => void;
}) {
  const [view, setView] = useState("day");
  const relevant = data.lessons.filter(
    (l) => teacherId === "all" || l.teacherId === teacherId,
  );
  const matching = relevant
    .filter((l) => l.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div className="schedule-layout">
      <div>
        <Card className="calendar-card">
          <CardContent>
            <MiniCalendar
              selected={selectedDate}
              onSelect={onDate}
              lessons={relevant}
            />
          </CardContent>
        </Card>
        <div className="schedule-legend">
          <h3>Một lịch học, nhiều kết nối.</h3>
          <p>
            Chọn ngày để xem các lớp 1–1. Mỗi buổi được gắn với đúng học viên và
            giáo viên.
          </p>
          <Badge variant="outline">Múi giờ Việt Nam · GMT+7</Badge>
        </div>
      </div>
      <Panel
        title={formatDate(selectedDate, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        action={
          <div className="date-arrows">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Ngày trước"
              onClick={() => onDate(shiftDate(selectedDate, -1))}
            >
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDate(today)}>
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Ngày sau"
              onClick={() => onDate(shiftDate(selectedDate, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        }
        className="schedule-panel"
      >
        <div className="schedule-toolbar">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="day">Theo ngày</TabsTrigger>
              <TabsTrigger value="week">7 ngày tới</TabsTrigger>
            </TabsList>
          </Tabs>
          <Choice
            label="Giáo viên trên lịch"
            value={teacherId}
            onChange={onTeacher}
            options={[
              { value: "all", label: "Tất cả giáo viên" },
              ...data.teachers.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        </div>
        {view === "day" ? (
          <LessonRows lessons={matching} data={data} onLesson={onLesson} />
        ) : (
          <div className="week-list">
            {Array.from({ length: 7 }, (_, i) => {
              const day = shiftDate(selectedDate, i),
                lessons = relevant
                  .filter((l) => l.date === day)
                  .sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div key={day}>
                  <h4>
                    {formatDate(day, {
                      weekday: "short",
                      day: "numeric",
                      month: "numeric",
                    })}
                    <span>{lessons.length} buổi</span>
                  </h4>
                  {lessons.length ? (
                    <LessonRows
                      lessons={lessons}
                      data={data}
                      onLesson={onLesson}
                      compact
                    />
                  ) : (
                    <p className="quiet-day">Chưa có lịch học</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="schedule-add">
          <Button variant="outline" onClick={onBook}>
            <Plus data-icon="inline-start" />
            Thêm buổi học mới
          </Button>
        </div>
      </Panel>
    </div>
  );
}
export function RoadmapsPage({
  data,
  role,
  onStudent,
}: {
  data: AppData;
  role: Role;
  onStudent: (s: Student) => void;
}) {
  const students = data.students.filter(
    (s) => role !== "teacher" || s.teacherId === "t1",
  );
  return (
    <>
      <div className="roadmap-page-banner">
        <div className="dialog-symbol tone-violet">
          <Target />
        </div>
        <div>
          <h2>Đích đến chung. Hành trình riêng.</h2>
          <p>
            Mỗi lộ trình bắt đầu từ năng lực hiện tại và hướng về mục tiêu của
            học viên.
          </p>
        </div>
        <Badge variant="secondary">Cá nhân hóa bởi giáo viên</Badge>
      </div>
      <div className="roadmap-grid">
        {students.map((s) => (
          <Card className="roadmap-card" key={s.id}>
            <CardHeader>
              <div className="roadmap-card-heading">
                <PersonAvatar initials={s.initials} color={s.color} />
                <div>
                  <CardTitle>{s.name}</CardTitle>
                  <CardDescription>{s.goal}</CardDescription>
                </div>
                <Level level={`${s.level} → ${s.target}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="roadmap-milestones">
                {roadmapSteps.map((step, i) => (
                  <span
                    key={step.title}
                    className={cn(
                      s.progress >= (i + 1) * 25
                        ? "complete"
                        : s.progress >= i * 25
                          ? "current"
                          : "",
                    )}
                    title={step.title}
                  >
                    {s.progress >= (i + 1) * 25 ? <Check /> : i + 1}
                  </span>
                ))}
              </div>
              <div className="roadmap-completion">
                <span>
                  {s.completed} / {s.total} buổi học
                </span>
                <strong>{s.progress}%</strong>
              </div>
              <ProgressLine value={s.progress} />
              <p className="roadmap-focus">Trọng tâm: {s.note}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => onStudent(s)}>
                Xem hành trình cá nhân
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="future-note">
        <Sparkles />
        <p>
          <strong>Không ngừng cá nhân hóa.</strong> AI hỗ trợ đánh giá và gợi ý
          bài tập nằm trong giai đoạn tiếp theo. Lộ trình hiện tại được giáo
          viên theo dõi và điều chỉnh.
        </p>
      </div>
    </>
  );
}
export function TuitionPage({
  data,
  onPaid,
}: {
  data: AppData;
  onPaid: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Student | null>(null);
  const pending = data.students.filter((s) => s.balance > 0),
    total = pending.reduce((sum, s) => sum + s.balance, 0);
  return (
    <>
      <div className="tuition-summary">
        <Panel title="Học phí cần theo dõi">
          <strong className="money-total">{money(total)}</strong>
          <p>{pending.length} học viên còn số dư học phí</p>
        </Panel>
        <Panel title="Gói học đang sử dụng">
          <strong className="money-total">
            {data.students.length}
            <small> học viên</small>
          </strong>
          <p>Theo dõi số buổi và học phí cùng một nơi</p>
        </Panel>
        <Panel title="Hình thức quản lý">
          <div className="local-ledger">
            <Wallet />
            <strong>Sổ theo dõi cục bộ</strong>
          </div>
          <p>Chưa kết nối cổng thanh toán hoặc ngân hàng.</p>
        </Panel>
      </div>
      <Panel
        title="Theo dõi học phí"
        description="Gắn với hồ sơ và số buổi học còn lại của từng học viên."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Gói học</TableHead>
              <TableHead>Số buổi còn lại</TableHead>
              <TableHead>Học phí cần thu</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.students.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="person-cell">
                    <PersonAvatar initials={s.initials} color={s.color} small />
                    <strong>{s.name}</strong>
                  </div>
                </TableCell>
                <TableCell>1 kèm 1 · {s.total} buổi</TableCell>
                <TableCell>{Math.max(0, s.total - s.completed)} buổi</TableCell>
                <TableCell>
                  <strong>{money(s.balance)}</strong>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "status-badge",
                      s.balance > 0 ? "student-slow" : "student-good",
                    )}
                  >
                    {s.balance > 0 ? "Cần theo dõi" : "Đã hoàn tất"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={s.balance === 0}
                    onClick={() => setSelected(s)}
                  >
                    Ghi nhận đã thu
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Ghi nhận học phí đã thu</DialogTitle>
            <DialogDescription>
              Chỉ cập nhật sổ theo dõi trong bản trải nghiệm. Thao tác này không
              thực hiện giao dịch hoặc chuyển tiền.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="tuition-confirm">
              <PersonAvatar
                initials={selected.initials}
                color={selected.color}
              />
              <strong>{selected.name}</strong>
              <span>{money(selected.balance)}</span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Để sau
            </Button>
            <Button
              onClick={() => {
                if (selected) onPaid(selected.id);
                setSelected(null);
                toast.success("Đã cập nhật sổ theo dõi học phí cục bộ.");
              }}
            >
              Xác nhận ghi sổ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
const resources = [
  {
    title: "Everyday Conversations",
    category: "Giao tiếp",
    level: "A2–B1",
    type: "Bài luyện nói",
    icon: MessageIcon,
    color: "violet",
    content:
      "Chủ đề: Giới thiệu một ngày làm việc của bạn.\n\n1. What does a typical workday look like for you?\n2. What do you enjoy most about your job?\n3. How do you usually communicate with your team?\n\nThực hành: Trả lời mỗi câu trong 60 giây. Chú ý dùng hiện tại đơn và các từ nối: first, then, after that.",
  },
  {
    title: "Your First Presentation",
    category: "Công việc",
    level: "B1–B2",
    type: "Bài thực hành",
    icon: FileText,
    color: "peach",
    content:
      "Mục tiêu: Trình bày một ý tưởng trong 2 phút.\n\nOpening: Today I would like to talk about...\nStructure: There are three things I want to share...\nClosing: To sum up, the key takeaway is...\n\nBài tập: Chọn một sản phẩm bạn yêu thích và thuyết trình về lợi ích của nó. Ghi chú 3 từ mới bạn muốn sử dụng.",
  },
  {
    title: "IELTS Speaking Practice",
    category: "IELTS",
    level: "B1–B2",
    type: "Bộ câu hỏi",
    icon: Headphones,
    color: "mint",
    content:
      "Describe a skill you would like to learn.\n\nYou should say:\n• What the skill is\n• Why you want to learn it\n• How you plan to learn it\n• And explain how it could help you in the future.\n\nChuẩn bị 1 phút, trình bày 2 phút. Giáo viên nhận xét về tính mạch lạc, từ vựng và phát âm.",
  },
  {
    title: "Travel with Confidence",
    category: "Giao tiếp",
    level: "A1–A2",
    type: "Từ vựng & hội thoại",
    icon: BookOpen,
    color: "blue",
    content:
      "Tình huống: Nhận phòng tại khách sạn.\n\nGuest: Hello, I have a reservation under the name...\nReceptionist: Welcome! Could I see your passport, please?\nGuest: Of course. What time is breakfast?\n\nTừ vựng: reservation, check-in, single room, breakfast included, luggage.\n\nThực hành: Đóng vai cùng giáo viên và hỏi về ba dịch vụ của khách sạn.",
  },
];
function MessageIcon() {
  return <BookOpen />;
}
export function ResourcesPage() {
  const [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState<(typeof resources)[number] | null>(null);
  return (
    <>
      <div className="page-subhead">
        <p>Học liệu mẫu được biên soạn để trải nghiệm luồng giao bài.</p>
        <Choice
          label="Chủ đề học liệu"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Tất cả chủ đề" },
            ...["Giao tiếp", "Công việc", "IELTS"].map((v) => ({
              value: v,
              label: v,
            })),
          ]}
        />
      </div>
      <div className="resources-grid">
        {resources
          .filter((r) => filter === "all" || r.category === filter)
          .map((r) => (
            <Card className="resource-card" key={r.title}>
              <div className={cn("resource-cover", `tone-${r.color}`)}>
                <r.icon />
                <span>{r.level}</span>
                <div className="resource-cover-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <CardHeader>
                <CardDescription>
                  {r.type} · {r.category}
                </CardDescription>
                <CardTitle>{r.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Học liệu gắn với tình huống thực tế, sẵn sàng cho buổi học
                  1–1.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => setSelected(r)}>
                  Mở học liệu
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="form-dialog resource-dialog">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.type} · {selected?.level} · Học liệu mẫu
            </DialogDescription>
          </DialogHeader>
          <div className="resource-content">{selected?.content}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                if (selected)
                  downloadText(
                    `${selected.title.toLowerCase().replaceAll(" ", "-")}.txt`,
                    selected.content,
                    "text/plain;charset=utf-8",
                  );
              }}
            >
              <Download data-icon="inline-start" />
              Tải nội dung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function SettingsPage({
  data,
  onSave,
}: {
  data: AppData;
  onSave: (academy: string, notifications: boolean) => void;
}) {
  const [academy, setAcademy] = useState(data.academy),
    [notifications, setNotifications] = useState(data.notifications);
  return (
    <div className="settings-layout">
      <Panel
        title="Không gian trung tâm"
        description="Những thiết lập cơ bản cho trải nghiệm của bạn."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(academy.trim(), notifications);
            toast.success("Đã lưu cài đặt trên trình duyệt.");
          }}
        >
          <FieldGroup className="form-fields">
            <Field>
              <FieldLabel htmlFor="academy-name">Tên trung tâm</FieldLabel>
              <Input
                id="academy-name"
                value={academy}
                maxLength={60}
                required
                onChange={(e) => setAcademy(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Múi giờ</FieldLabel>
              <Input value="Việt Nam · Asia/Bangkok · GMT+7" readOnly />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="local-notifications"
                checked={notifications}
                onCheckedChange={(v) => setNotifications(v === true)}
              />
              <FieldLabel htmlFor="local-notifications">
                Hiển thị nhắc việc trong ứng dụng
              </FieldLabel>
            </Field>
          </FieldGroup>
          <Button type="submit" className="settings-save">
            <Check data-icon="inline-start" />
            Lưu cài đặt
          </Button>
        </form>
      </Panel>
      <Panel
        title="Về bản trải nghiệm"
        description="Thiết kế để kiểm chứng trải nghiệm trước khi triển khai hệ thống thật."
      >
        <div className="integration-state">
          <Check />
          <div>
            <strong>Hồ sơ, lịch và nhận xét</strong>
            <p>Tương tác đầy đủ, lưu cục bộ trên trình duyệt.</p>
          </div>
          <Badge variant="secondary">Có sẵn</Badge>
        </div>
        {[
          "Tài khoản & phân quyền trên máy chủ",
          "Zoom / Google Meet",
          "Email, SMS & nhắc lịch tự động",
          "Cổng thanh toán & hóa đơn",
          "AI đánh giá năng lực",
        ].map((item) => (
          <div className="integration-state" key={item}>
            <Settings2 />
            <div>
              <strong>{item}</strong>
              <p>Cần tích hợp dịch vụ khi xây bản vận hành.</p>
            </div>
            <Badge variant="outline">Chưa kết nối</Badge>
          </div>
        ))}
      </Panel>
    </div>
  );
}
