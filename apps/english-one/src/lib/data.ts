export type Page =
  | "dashboard"
  | "students"
  | "teachers"
  | "schedule"
  | "roadmaps"
  | "tuition"
  | "resources"
  | "settings";
export type Role = "admin" | "teacher";
export interface SkillScores {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}
export interface Student {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  goal: string;
  level: string;
  target: string;
  teacherId: string;
  progress: number;
  completed: number;
  total: number;
  status: "good" | "attention" | "slow";
  joined: string;
  balance: number;
  skills: SkillScores;
  note: string;
}
export interface Teacher {
  id: string;
  name: string;
  initials: string;
  color: string;
  specialty: string;
  country: string;
  experience: string;
  email: string;
  available: boolean;
}
export interface Lesson {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  duration: number;
  title: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  feedback?: string;
}
export interface Assessment {
  id: string;
  studentId: string;
  lessonId: string;
  date: string;
  score: number;
  summary: string;
  homework: string;
  skills?: SkillScores;
}
export interface AppData {
  version: 1;
  students: Student[];
  teachers: Teacher[];
  lessons: Lesson[];
  assessments: Assessment[];
  completedTasks: string[];
  academy: string;
  notifications: boolean;
}
export function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function shiftDate(key: string, amount: number) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}
export function formatDate(key: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(`${key}T12:00:00`).toLocaleDateString(
    "vi-VN",
    options ?? { day: "numeric", month: "long", year: "numeric" },
  );
}
export function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
export const today = dateKey();
export const skillLabels: Record<keyof SkillScores, string> = {
  listening: "Nghe",
  speaking: "Nói",
  reading: "Đọc",
  writing: "Viết",
};
export const statusLabels = {
  good: "Đang tiến bộ",
  attention: "Cần hỗ trợ",
  slow: "Chậm tiến độ",
};
export const lessonLabels = {
  upcoming: "Sắp diễn ra",
  live: "Đang học",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
export function initialData(): AppData {
  const teachers: Teacher[] = [
    {
      id: "t1",
      name: "Sarah Wilson",
      initials: "SW",
      color: "violet",
      specialty: "Giao tiếp & Business English",
      country: "Anh Quốc",
      experience: "6 năm giảng dạy",
      email: "sarah@fluento.example",
      available: true,
    },
    {
      id: "t2",
      name: "Nguyễn Hoàng Mai",
      initials: "HM",
      color: "mint",
      specialty: "IELTS & tiếng Anh học thuật",
      country: "Việt Nam",
      experience: "5 năm giảng dạy",
      email: "mai@fluento.example",
      available: true,
    },
    {
      id: "t3",
      name: "James Anderson",
      initials: "JA",
      color: "peach",
      specialty: "Phát âm & phản xạ giao tiếp",
      country: "Hoa Kỳ",
      experience: "8 năm giảng dạy",
      email: "james@fluento.example",
      available: true,
    },
    {
      id: "t4",
      name: "Trần Minh Khuê",
      initials: "MK",
      color: "blue",
      specialty: "Tiếng Anh nền tảng A1–B1",
      country: "Việt Nam",
      experience: "4 năm giảng dạy",
      email: "khue@fluento.example",
      available: false,
    },
  ];
  const students: Student[] = [
    {
      id: "s1",
      name: "Nguyễn Minh Anh",
      initials: "MA",
      color: "mint",
      email: "minhanh@example.com",
      goal: "Giao tiếp trong công việc",
      level: "A2",
      target: "B1",
      teacherId: "t1",
      progress: 58,
      completed: 14,
      total: 24,
      status: "attention",
      joined: "2026-08-10",
      balance: 1500000,
      skills: { listening: 62, speaking: 48, reading: 70, writing: 55 },
      note: "Cần tăng phản xạ khi trình bày ý tưởng. Ưu tiên luyện nói theo tình huống công việc.",
    },
    {
      id: "s2",
      name: "Lê Thu Trang",
      initials: "TT",
      color: "violet",
      email: "thutrang@example.com",
      goal: "IELTS 6.5",
      level: "B1",
      target: "B2",
      teacherId: "t2",
      progress: 72,
      completed: 18,
      total: 25,
      status: "good",
      joined: "2026-07-22",
      balance: 0,
      skills: { listening: 78, speaking: 68, reading: 82, writing: 60 },
      note: "Khả năng đọc tốt. Dành thêm thời gian cho lập luận và liên kết trong Writing Task 2.",
    },
    {
      id: "s3",
      name: "Phạm Hoàng Nam",
      initials: "HN",
      color: "peach",
      email: "hoangnam@example.com",
      goal: "Phỏng vấn bằng tiếng Anh",
      level: "B1",
      target: "B2",
      teacherId: "t1",
      progress: 40,
      completed: 8,
      total: 20,
      status: "slow",
      joined: "2026-09-01",
      balance: 2000000,
      skills: { listening: 60, speaking: 54, reading: 65, writing: 50 },
      note: "Cần duy trì ít nhất hai buổi mỗi tuần. Luyện trả lời theo cấu trúc STAR.",
    },
    {
      id: "s4",
      name: "Trần Gia Hân",
      initials: "GH",
      color: "blue",
      email: "giahan@example.com",
      goal: "Giao tiếp tự tin",
      level: "A2",
      target: "B1",
      teacherId: "t3",
      progress: 83,
      completed: 20,
      total: 24,
      status: "good",
      joined: "2026-07-01",
      balance: 0,
      skills: { listening: 80, speaking: 78, reading: 76, writing: 70 },
      note: "Chủ động trong hội thoại. Chuyển sang tình huống thuyết trình ngắn.",
    },
    {
      id: "s5",
      name: "Vũ Hoàng Linh",
      initials: "HL",
      color: "rose",
      email: "hoanglinh@example.com",
      goal: "Tiếng Anh du lịch",
      level: "A1",
      target: "A2",
      teacherId: "t4",
      progress: 35,
      completed: 7,
      total: 20,
      status: "slow",
      joined: "2026-09-05",
      balance: 1000000,
      skills: { listening: 42, speaking: 35, reading: 48, writing: 32 },
      note: "Ôn từ vựng theo chủ đề trước mỗi buổi. Cần thêm hỗ trợ phát âm cơ bản.",
    },
    {
      id: "s6",
      name: "Đặng Quang Huy",
      initials: "QH",
      color: "yellow",
      email: "quanghuy@example.com",
      goal: "Business English",
      level: "B2",
      target: "C1",
      teacherId: "t3",
      progress: 67,
      completed: 16,
      total: 24,
      status: "good",
      joined: "2026-08-02",
      balance: 0,
      skills: { listening: 84, speaking: 78, reading: 88, writing: 72 },
      note: "Tập trung đàm phán và diễn đạt sắc thái. Duy trì bài đọc chuyên ngành.",
    },
  ];
  const lessons: Lesson[] = [
    {
      id: "l1",
      studentId: "s1",
      teacherId: "t1",
      date: today,
      time: "08:00",
      duration: 50,
      title: "Giao tiếp trong cuộc họp",
      status: "completed",
    },
    {
      id: "l2",
      studentId: "s2",
      teacherId: "t2",
      date: today,
      time: "10:00",
      duration: 50,
      title: "IELTS Speaking · Part 2",
      status: "live",
    },
    {
      id: "l3",
      studentId: "s3",
      teacherId: "t1",
      date: today,
      time: "14:00",
      duration: 50,
      title: "Tell me about yourself",
      status: "upcoming",
    },
    {
      id: "l4",
      studentId: "s4",
      teacherId: "t3",
      date: today,
      time: "15:30",
      duration: 50,
      title: "A conversation that flows",
      status: "upcoming",
    },
    {
      id: "l5",
      studentId: "s6",
      teacherId: "t3",
      date: today,
      time: "19:00",
      duration: 50,
      title: "Leading a presentation",
      status: "upcoming",
    },
    {
      id: "l6",
      studentId: "s1",
      teacherId: "t1",
      date: shiftDate(today, 1),
      time: "09:00",
      duration: 50,
      title: "Presenting your ideas",
      status: "upcoming",
    },
    {
      id: "l7",
      studentId: "s5",
      teacherId: "t4",
      date: shiftDate(today, 1),
      time: "14:00",
      duration: 50,
      title: "At the airport",
      status: "upcoming",
    },
    {
      id: "l8",
      studentId: "s2",
      teacherId: "t2",
      date: shiftDate(today, 2),
      time: "10:00",
      duration: 50,
      title: "Writing Task 2 · Opinion",
      status: "upcoming",
    },
    {
      id: "l9",
      studentId: "s4",
      teacherId: "t3",
      date: shiftDate(today, -2),
      time: "15:30",
      duration: 50,
      title: "Everyday conversations",
      status: "completed",
      feedback: "Chủ động đặt câu hỏi và duy trì hội thoại.",
    },
  ];
  return {
    version: 1,
    students,
    teachers,
    lessons,
    assessments: [
      {
        id: "a1",
        studentId: "s1",
        lessonId: "historical-1",
        date: shiftDate(today, -7),
        score: 6,
        summary:
          "Đã tự giới thiệu rõ ràng và sử dụng đúng các mẫu câu công việc.",
        homework: "Ghi âm phần giới thiệu bản thân trong 90 giây.",
      },
      {
        id: "a2",
        studentId: "s1",
        lessonId: "historical-2",
        date: shiftDate(today, -3),
        score: 7,
        summary:
          "Tăng độ tự tin khi nói. Cần chú ý trọng âm và tốc độ trả lời.",
        homework: "Luyện 5 câu hỏi thường gặp trong cuộc họp.",
      },
    ],
    completedTasks: [],
    academy: "Fluento Academy",
    notifications: true,
  };
}
export const roadmapSteps = [
  {
    title: "Xây nền tảng vững chắc",
    desc: "Củng cố từ vựng, phát âm và cấu trúc câu.",
    lessons: 6,
  },
  {
    title: "Giao tiếp trong tình huống thực tế",
    desc: "Luyện phản xạ với các chủ đề gắn với mục tiêu.",
    lessons: 8,
  },
  {
    title: "Diễn đạt tự tin & tự nhiên",
    desc: "Thực hành hội thoại, trình bày và xử lý tình huống.",
    lessons: 6,
  },
  {
    title: "Đánh giá & chinh phục mục tiêu",
    desc: "Ôn tập, đánh giá cuối chặng và định hướng tiếp theo.",
    lessons: 4,
  },
];
