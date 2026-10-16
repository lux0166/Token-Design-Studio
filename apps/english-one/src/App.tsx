import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Bell,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell, navigation } from "@/components/Shell";
import { Dashboard } from "@/components/Dashboard";
import {
  AddStudentDialog,
  BookingDialog,
  LessonDialog,
  StudentDialog,
} from "@/components/Dialogs";
import {
  TeachersPage,
  StudentsPage,
  SchedulePage,
  RoadmapsPage,
  TuitionPage,
  ResourcesPage,
  SettingsPage,
} from "@/components/ManagementPages";
import {
  formatDate,
  today,
  type Assessment,
  type Lesson,
  type Page,
  type Role,
} from "@/lib/data";
import { applyAssessment, useAcademy } from "@/lib/store";

function currentPage(): Page {
  const hash = window.location.hash.slice(1);
  return navigation.some((n) => n.page === hash) ? (hash as Page) : "dashboard";
}
const descriptions: Record<Page, string> = {
  dashboard: "Một góc nhìn rõ ràng, cho từng bước tiến nhỏ.",
  students: "Hiểu từng học viên. Đồng hành đúng cách.",
  teachers: "Kết nối chuyên môn với những mục tiêu riêng.",
  schedule: "Sắp xếp buổi học. Giữ nhịp tiến bộ.",
  roadmaps: "Bắt đầu từ năng lực, hướng đến mục tiêu.",
  tuition: "Rõ ràng học phí, trọn vẹn hành trình.",
  resources: "Một chút cảm hứng cho mỗi buổi học.",
  settings: "Thiết lập không gian làm việc phù hợp.",
};
const titles: Record<Page, string> = {
  dashboard: "Tổng quan học tập",
  students: "Học viên",
  teachers: "Đội ngũ giáo viên",
  schedule: "Lịch học 1–1",
  roadmaps: "Lộ trình học tập",
  tuition: "Quản lý học phí",
  resources: "Thư viện học liệu",
  settings: "Cài đặt trung tâm",
};
export default function App() {
  const academy = useAcademy();
  const { data } = academy;
  const [page, setPage] = useState<Page>(currentPage),
    [role, setRole] = useState<Role>("admin"),
    [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(today),
    [teacherFilter, setTeacherFilter] = useState("all");
  const [studentId, setStudentId] = useState<string | null>(null),
    [lessonId, setLessonId] = useState<string | null>(null);
  const [booking, setBooking] = useState(false),
    [bookingStudent, setBookingStudent] = useState<string | undefined>();
  const [addStudent, setAddStudent] = useState(false),
    [notifications, setNotifications] = useState(false);
  useEffect(() => {
    const handler = () => setPage(currentPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (next: Page) => {
    setPage(next);
    window.location.hash = next;
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const chooseRole = (next: Role) => {
    setRole(next);
    setTeacherFilter(next === "teacher" ? "t1" : "all");
    navigate("dashboard");
    toast.success(
      next === "teacher"
        ? "Đang xem góc nhìn giáo viên Sarah."
        : "Đang xem góc nhìn quản trị trung tâm.",
    );
  };
  const openBooking = (id?: string) => {
    setBookingStudent(id);
    setStudentId(null);
    setBooking(true);
  };
  const student = data.students.find((s) => s.id === studentId),
    lesson = data.lessons.find((l) => l.id === lessonId);
  const pending = data.lessons.filter(
    (l) =>
      l.status === "completed" &&
      !data.assessments.some((a) => a.lessonId === l.id) &&
      (role === "admin" || l.teacherId === "t1"),
  );
  const search = (value: string) => {
    setQuery(value);
    if (value && page !== "teachers" && page !== "students") {
      setPage("students");
      window.location.hash = "students";
    }
  };
  const assess = (entry: Assessment) => {
    try {
      const next = applyAssessment(data, entry);
      academy.update(() => next);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Chưa lưu được đánh giá.",
      );
      return false;
    }
  };
  const base = { data, role };
  return (
    <TooltipProvider>
      <Shell
        page={page}
        onPage={navigate}
        role={role}
        onRole={chooseRole}
        academy={data.academy}
        query={query}
        onQuery={search}
        onNotifications={() => setNotifications(true)}
        pendingReviews={data.notifications ? pending.length : 0}
      >
        <div className="page-heading">
          <div>
            <div className="page-context">
              {role === "teacher"
                ? "GÓC NHÌN GIÁO VIÊN"
                : "KHÔNG GIAN QUẢN TRỊ"}
              <span />
              <span>
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  "vi-VN",
                  { weekday: "long" },
                )}
              </span>
            </div>
            <h1>{titles[page]}</h1>
            <p>{descriptions[page]}</p>
          </div>
          <div className="page-heading-actions">
            <label className="date-picker">
              <CalendarDays />
              <span>
                {formatDate(selectedDate, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <input
                aria-label="Chọn ngày làm việc"
                type="date"
                value={selectedDate}
                onInput={(e) =>
                  e.currentTarget.value &&
                  setSelectedDate(e.currentTarget.value)
                }
                onChange={(e) =>
                  e.target.value && setSelectedDate(e.target.value)
                }
              />
            </label>
            <Button onClick={() => openBooking()}>
              <Plus data-icon="inline-start" />
              Đặt lịch học
            </Button>
          </div>
        </div>
        {academy.saveError && (
          <div className="storage-error" role="alert">
            Trình duyệt chưa lưu được thay đổi. Cho phép lưu dữ liệu hoặc xuất
            danh sách trước khi đóng trang.
          </div>
        )}
        {page === "dashboard" && (
          <Dashboard
            {...base}
            selectedDate={selectedDate}
            onDate={setSelectedDate}
            onPage={navigate}
            onStudent={(s) => setStudentId(s.id)}
            onLesson={(l) => setLessonId(l.id)}
            onTask={(id) =>
              academy.update((d) => ({
                ...d,
                completedTasks: d.completedTasks.includes(id)
                  ? d.completedTasks.filter((v) => v !== id)
                  : [...d.completedTasks, id],
              }))
            }
          />
        )}
        {page === "students" && (
          <StudentsPage
            {...base}
            query={query}
            onQuery={setQuery}
            onStudent={(s) => setStudentId(s.id)}
            onAdd={() => setAddStudent(true)}
          />
        )}
        {page === "teachers" && (
          <TeachersPage
            data={data}
            query={query}
            onSchedule={(id) => {
              setTeacherFilter(id);
              navigate("schedule");
            }}
            onSave={(teacher) =>
              academy.update((d) => ({
                ...d,
                teachers: [...d.teachers, teacher],
              }))
            }
          />
        )}
        {page === "schedule" && (
          <SchedulePage
            data={data}
            selectedDate={selectedDate}
            onDate={setSelectedDate}
            teacherId={teacherFilter}
            onTeacher={setTeacherFilter}
            onLesson={(l) => setLessonId(l.id)}
            onBook={() => openBooking()}
          />
        )}
        {page === "roadmaps" && (
          <RoadmapsPage {...base} onStudent={(s) => setStudentId(s.id)} />
        )}
        {page === "tuition" && (
          <TuitionPage
            data={data}
            onPaid={(id) =>
              academy.update((d) => ({
                ...d,
                students: d.students.map((s) =>
                  s.id === id ? { ...s, balance: 0 } : s,
                ),
              }))
            }
          />
        )}
        {page === "resources" && <ResourcesPage />}
        {page === "settings" && (
          <SettingsPage
            data={data}
            onSave={(name, notifications) =>
              academy.update((d) => ({ ...d, academy: name, notifications }))
            }
          />
        )}
      </Shell>
      {booking && (
        <BookingDialog
          data={data}
          date={selectedDate < today ? today : selectedDate}
          studentId={bookingStudent}
          onClose={() => setBooking(false)}
          onSave={academy.book}
        />
      )}
      {addStudent && (
        <AddStudentDialog
          data={data}
          onClose={() => setAddStudent(false)}
          onSave={academy.addStudent}
        />
      )}
      {student && (
        <StudentDialog
          student={student}
          data={data}
          onClose={() => setStudentId(null)}
          onBook={openBooking}
          onLesson={(l) => {
            setStudentId(null);
            setLessonId(l.id);
          }}
        />
      )}
      {lesson && (
        <LessonDialog
          key={lesson.id}
          lesson={lesson}
          data={data}
          onClose={() => setLessonId(null)}
          onAssess={assess}
          onCancel={() =>
            academy.update((d) => ({
              ...d,
              lessons: d.lessons.map((l) =>
                l.id === lesson.id ? { ...l, status: "cancelled" } : l,
              ),
            }))
          }
        />
      )}
      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent className="form-dialog">
          <DialogHeader>
            <div className="dialog-symbol tone-violet">
              <Bell />
            </div>
            <DialogTitle>Những điều cần bạn quan tâm</DialogTitle>
            <DialogDescription>
              Nhắc việc trong ứng dụng, dựa trên dữ liệu đang hiển thị.
            </DialogDescription>
          </DialogHeader>
          <div className="notification-items">
            <button
              onClick={() => {
                setNotifications(false);
                navigate("schedule");
              }}
            >
              <span className="tone-rose">
                <CalendarDays />
              </span>
              <div>
                <strong>{pending.length} nhận xét sau buổi học</strong>
                <p>Ghi lại tiến bộ để học viên biết mình đang đi đúng hướng.</p>
              </div>
              <ArrowUpRight />
            </button>
            <button
              onClick={() => {
                setNotifications(false);
                navigate("students");
              }}
            >
              <span className="tone-mint">
                <CheckCircle2 />
              </span>
              <div>
                <strong>Đồng hành với học viên</strong>
                <p>
                  {data.students.filter((s) => s.status !== "good").length} học
                  viên cần thêm sự hỗ trợ.
                </p>
              </div>
              <ArrowUpRight />
            </button>
          </div>
          <p className="local-info">
            Chưa gửi email, SMS hoặc thông báo ra ngoài ứng dụng.
          </p>
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
