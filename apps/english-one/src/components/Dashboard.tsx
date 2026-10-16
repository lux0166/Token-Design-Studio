import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  MessageSquareText,
  Target,
  Users,
  Video,
  Wallet,
  BookOpen,
  CircleCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PersonAvatar,
  Panel,
  TextAction,
  StudentStatus,
  LessonStatus,
  ProgressLine,
  Empty,
} from "./common";
import { MiniCalendar } from "./Calendar";
import { cn } from "@/lib/utils";
import {
  formatDate,
  skillLabels,
  today,
  type AppData,
  type Lesson,
  type Page,
  type Role,
  type Student,
} from "@/lib/data";

export function LessonRows({
  lessons,
  data,
  onLesson,
  compact = false,
}: {
  lessons: Lesson[];
  data: AppData;
  onLesson: (lesson: Lesson) => void;
  compact?: boolean;
}) {
  if (!lessons.length)
    return (
      <Empty
        title="Một khoảng trống để lên kế hoạch"
        description="Chưa có buổi học phù hợp. Đặt lịch mới hoặc chọn ngày khác."
      />
    );
  return (
    <div className={cn("lesson-list", compact && "compact")}>
      {lessons.map((l) => {
        const student = data.students.find((s) => s.id === l.studentId),
          teacher = data.teachers.find((t) => t.id === l.teacherId);
        return (
          <div className="lesson-row" key={l.id}>
            <div className="lesson-time">
              <strong>{l.time}</strong>
              <span>
                <Clock3 />
                {l.duration} phút
              </span>
            </div>
            <PersonAvatar
              initials={student?.initials ?? "?"}
              color={student?.color}
            />
            <div className="lesson-info">
              <strong>{l.title}</strong>
              <span>
                <Users />
                {student?.name}
                <i />
                {teacher?.name}
              </span>
            </div>
            <LessonStatus status={l.status} />
            <Button
              size="sm"
              variant={l.status === "live" ? "default" : "outline"}
              onClick={() => onLesson(l)}
            >
              {l.status === "live" ? (
                <>
                  <Video data-icon="inline-start" />
                  Vào lớp
                </>
              ) : (
                "Chi tiết"
              )}
              {l.status !== "live" && <ChevronRight data-icon="inline-end" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
export function Dashboard({
  data,
  role,
  selectedDate,
  onDate,
  onPage,
  onStudent,
  onLesson,
  onTask,
}: {
  data: AppData;
  role: Role;
  selectedDate: string;
  onDate: (date: string) => void;
  onPage: (page: Page) => void;
  onStudent: (student: Student) => void;
  onLesson: (lesson: Lesson) => void;
  onTask: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const students =
    role === "teacher"
      ? data.students.filter((s) => s.teacherId === "t1")
      : data.students;
  const allLessons =
    role === "teacher"
      ? data.lessons.filter((l) => l.teacherId === "t1")
      : data.lessons;
  const dayLessons = allLessons
    .filter((l) => l.date === selectedDate && l.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));
  const visibleLessons = dayLessons.filter(
    (l) => filter === "all" || l.status === filter,
  );
  const care = students.filter((s) => s.status !== "good");
  const average = Math.round(
    students.reduce((sum, s) => sum + s.progress, 0) /
      Math.max(students.length, 1),
  );
  const assessed = students.filter((s) =>
    Object.values(s.skills).some((score) => score > 0),
  );
  const chart = Object.entries(skillLabels).map(([key, name]) => ({
    name,
    score: Math.round(
      assessed.reduce(
        (sum, s) => sum + s.skills[key as keyof typeof s.skills],
        0,
      ) / Math.max(assessed.length, 1),
    ),
  }));
  const reviews = allLessons.filter(
    (l) =>
      l.status === "completed" &&
      !data.assessments.some((a) => a.lessonId === l.id),
  );
  const outstanding = students.filter((s) => s.balance > 0);
  const stats = [
    {
      label: role === "teacher" ? "Học viên của tôi" : "Học viên đang học",
      value: students.length,
      icon: Users,
      tone: "mint",
      note: "Mỗi người một mục tiêu riêng",
      indicator: "Đang đồng hành",
    },
    {
      label:
        selectedDate === today ? "Buổi học hôm nay" : "Buổi học trong ngày",
      value: dayLessons.length,
      icon: CalendarDays,
      tone: "peach",
      note: `${dayLessons.filter((l) => l.status === "completed").length} buổi đã hoàn thành`,
      indicator: "Lịch đã xác nhận",
    },
    {
      label: role === "teacher" ? "Nhận xét cần ghi" : "Giáo viên đồng hành",
      value: role === "teacher" ? reviews.length : data.teachers.length,
      icon: GraduationCap,
      tone: "violet",
      note:
        role === "teacher"
          ? "Theo dõi sau từng buổi học"
          : `${data.teachers.filter((t) => t.available).length} giáo viên đang nhận lớp`,
      indicator: role === "teacher" ? "Cần hoàn thành" : "Kết nối đúng người",
    },
    {
      label: "Tiến độ trung bình",
      value: `${average}%`,
      icon: Target,
      tone: "mint",
      note: "Theo số buổi trong lộ trình",
      indicator: "Tiến từng bước nhỏ",
    },
  ];
  const tasks = [
    {
      id: "reviews",
      title: `${reviews.length} nhận xét sau buổi học`,
      detail: "Ghi lại từng bước tiến",
      icon: MessageSquareText,
      tone: "rose",
      action: () => (reviews[0] ? onLesson(reviews[0]) : onPage("schedule")),
    },
    {
      id: "students",
      title: `${care.length} học viên cần quan tâm`,
      detail: "Điều chỉnh cách đồng hành",
      icon: BookOpen,
      tone: "peach",
      action: () => onPage("students"),
    },
    {
      id: "tuition",
      title: `${outstanding.length} học phí cần theo dõi`,
      detail: "Kiểm tra số dư học phí",
      icon: Wallet,
      tone: "blue",
      action: () => onPage("tuition"),
    },
  ];
  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card className="stat-card" key={stat.label}>
            <CardHeader>
              <div className={cn("stat-icon", `tone-${stat.tone}`)}>
                <stat.icon />
              </div>
              <div>
                <CardTitle>{stat.label}</CardTitle>
                <strong>{stat.value}</strong>
              </div>
            </CardHeader>
            <CardContent>
              <span>
                <i />
                {stat.indicator}
              </span>
              <small>{stat.note}</small>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="welcome-banner">
            <div>
              <span className="welcome-eyebrow">
                PERSONALIZED LEARNING, REAL PROGRESS
              </span>
              <h2>
                Mỗi học viên,
                <br />
                một bước tiến.
              </h2>
              <p>
                Theo sát năng lực. Cá nhân hóa lộ trình.
                <br />
                Kết nối đúng giáo viên.
              </p>
              <Button onClick={() => onPage("students")}>
                Khám phá học viên
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
            <img
              src="/learning-journey.png"
              alt="Học viên tiến từng bước trên hành trình chinh phục tiếng Anh"
            />
            <span className="cefr-tag tag-a">A2</span>
            <span className="cefr-tag tag-b">B1</span>
            <span className="cefr-tag tag-c">B2</span>
          </section>
          <Panel
            title={
              selectedDate === today
                ? "Lớp học hôm nay"
                : `Lớp học ngày ${formatDate(selectedDate, { day: "2-digit", month: "2-digit" })}`
            }
            action={
              <TextAction onClick={() => onPage("schedule")}>
                Xem lịch học
              </TextAction>
            }
            className="today-panel"
          >
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="lesson-tabs">
                <TabsTrigger value="all">
                  Tất cả <span>{dayLessons.length}</span>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Sắp diễn ra{" "}
                  <span>
                    {dayLessons.filter((l) => l.status === "upcoming").length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Hoàn thành{" "}
                  <span>
                    {dayLessons.filter((l) => l.status === "completed").length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <LessonRows
              lessons={visibleLessons.slice(0, 3)}
              data={data}
              onLesson={onLesson}
              compact
            />
            {visibleLessons.length > 3 && (
              <button
                className="more-lessons"
                onClick={() => onPage("schedule")}
              >
                Xem thêm {visibleLessons.length - 3} buổi học <ArrowRight />
              </button>
            )}
          </Panel>
          <Panel
            title="Học viên cần quan tâm"
            description="Một chút đồng hành, một bước tiến xa hơn."
            action={
              <TextAction onClick={() => onPage("students")}>
                Xem tất cả
              </TextAction>
            }
            className="care-panel"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Mục tiêu</TableHead>
                  <TableHead>Tiến độ lộ trình</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="sr-only">Hồ sơ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {care.slice(0, 3).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <button
                        className="person-cell"
                        onClick={() => onStudent(s)}
                      >
                        <PersonAvatar
                          initials={s.initials}
                          color={s.color}
                          small
                        />
                        <span>{s.name}</span>
                      </button>
                    </TableCell>
                    <TableCell>{s.goal}</TableCell>
                    <TableCell>
                      <ProgressLine value={s.progress} withLabel />
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
            {!care.length && (
              <Empty
                title="Tất cả đang tiến bộ"
                description="Chưa có học viên nào cần hỗ trợ thêm trong nhóm này."
              />
            )}
          </Panel>
        </div>
        <div className="dashboard-side">
          <Card className="calendar-card">
            <CardContent>
              <MiniCalendar
                selected={selectedDate}
                onSelect={onDate}
                lessons={allLessons}
              />
            </CardContent>
          </Card>
          <Panel
            title="Năng lực học viên"
            action={<span className="quiet-label">4 kỹ năng</span>}
            className="progress-panel"
          >
            <p className="chart-description">
              Mức năng lực trung bình của học viên đã có đánh giá
            </p>
            <div className="skills-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chart}
                  margin={{ top: 10, left: -30, right: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="skill-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border)"
                    vertical={false}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [
                      `${value}/100`,
                      "Mức năng lực",
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#skill-fill)"
                    dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-key">
              <i />
              Dựa trên hồ sơ năng lực
            </div>
            <div className="chart-summary">
              <div>
                <strong>
                  {[...chart].sort((a, b) => b.score - a.score)[0]?.name}
                </strong>
                <span>Kỹ năng nổi bật</span>
              </div>
              <div>
                <strong>
                  {[...chart].sort((a, b) => a.score - b.score)[0]?.name}
                </strong>
                <span>Cần tập trung thêm</span>
              </div>
            </div>
          </Panel>
          <Panel title="Việc cần làm" className="tasks-panel">
            {tasks.map((task) => (
              <div
                className={cn(
                  "task-row",
                  data.completedTasks.includes(task.id) && "done",
                )}
                key={task.id}
              >
                <Checkbox
                  aria-label={`Đánh dấu ${task.title}`}
                  checked={data.completedTasks.includes(task.id)}
                  onCheckedChange={() => onTask(task.id)}
                />
                <span className={cn("task-icon", `tone-${task.tone}`)}>
                  <task.icon />
                </span>
                <button onClick={task.action}>
                  <span>{task.title}</span>
                  <small>{task.detail}</small>
                </button>
                <ChevronRight />
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}
