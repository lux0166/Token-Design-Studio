import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  lessonLabels,
  statusLabels,
  type Lesson,
  type Student,
} from "@/lib/data";

export function PersonAvatar({
  initials,
  color = "violet",
  small = false,
}: {
  initials: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <Avatar
      className={cn("person-avatar", `tone-${color}`, small && "avatar-small")}
    >
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
export function StudentStatus({ status }: { status: Student["status"] }) {
  return (
    <Badge
      variant="secondary"
      className={cn("status-badge", `student-${status}`)}
    >
      <span className="status-dot" />
      {statusLabels[status]}
    </Badge>
  );
}
export function LessonStatus({ status }: { status: Lesson["status"] }) {
  return (
    <Badge
      variant="secondary"
      className={cn("status-badge", `lesson-${status}`)}
    >
      {status === "live" && <span className="status-dot" />}
      {lessonLabels[status]}
    </Badge>
  );
}
export function Level({ level }: { level: string }) {
  return (
    <Badge variant="outline" className="level-badge">
      {level}
    </Badge>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("panel", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
export function TextAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button variant="link" size="sm" onClick={onClick}>
      {children}
      <ArrowRight data-icon="inline-end" />
    </Button>
  );
}
export function ProgressLine({
  value,
  withLabel = false,
}: {
  value: number;
  withLabel?: boolean;
}) {
  return (
    <div className="progress-line">
      <Progress value={value} aria-label={`Tiến độ ${value}%`} />
      {withLabel && <span>{value}%</span>}
    </div>
  );
}
export function Empty({
  title = "Chưa có dữ liệu phù hợp",
  description = "Thử đổi bộ lọc hoặc chọn một ngày khác.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>
        <BookOpen />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "Tìm kiếm…",
  label = "Tìm kiếm",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="search-field">
      <Search />
      <Input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Pager({
  total,
  page,
  perPage,
  onPage,
}: {
  total: number;
  page: number;
  perPage: number;
  onPage: (n: number) => void;
}) {
  return (
    <div className="pager">
      <span>
        {total
          ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)}`
          : "0"}{" "}
        trên {total} kết quả
      </span>
      <div>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>{page}</span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang sau"
          disabled={page * perPage >= total}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
