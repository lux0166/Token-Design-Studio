import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  House,
  Menu,
  MessageCircle,
  PanelLeftClose,
  Search,
  Settings2,
  Users,
  Wallet,
  Sparkles,
  LogOut,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type Page, type Role } from "@/lib/data";
import { PersonAvatar, SearchField } from "./common";
import { useState } from "react";

export const navigation = [
  { page: "dashboard", label: "Tổng quan", icon: House },
  { page: "students", label: "Học viên", icon: Users },
  { page: "teachers", label: "Giáo viên", icon: GraduationCap },
  { page: "schedule", label: "Lịch học", icon: CalendarDays },
  { page: "roadmaps", label: "Lộ trình học", icon: ChartNoAxesCombined },
  { page: "tuition", label: "Học phí", icon: Wallet },
  { page: "resources", label: "Tài liệu", icon: BookOpen },
  { page: "settings", label: "Cài đặt", icon: Settings2 },
] as const;
interface ShellProps {
  page: Page;
  onPage: (page: Page) => void;
  role: Role;
  onRole: (role: Role) => void;
  academy: string;
  query: string;
  onQuery: (s: string) => void;
  onNotifications: () => void;
  pendingReviews: number;
  children: ReactNode;
}
function Brand() {
  return (
    <div className="brand">
      <span>
        <MessageCircle fill="currentColor" />
        <i>•••</i>
      </span>
      <div>
        Fluento<small>ENGLISH, MADE PERSONAL</small>
      </div>
    </div>
  );
}
function Navigation({
  page,
  onPage,
  role,
  onRole,
  academy,
}: Pick<ShellProps, "page" | "onPage" | "role" | "onRole" | "academy">) {
  return (
    <div className="side-inner">
      <Brand />
      <div className="workspace-switch">
        <span>
          <GraduationCap />
        </span>
        <strong>{academy}</strong>
        <ChevronDown />
      </div>
      <div className="nav-label">KHÔNG GIAN LÀM VIỆC</div>
      <nav aria-label="Điều hướng chính">
        {navigation.map((item, i) => (
          <div key={item.page}>
            {i === 6 && <Separator className="nav-separator" />}
            <Button
              variant={page === item.page ? "secondary" : "ghost"}
              className="nav-link"
              aria-current={page === item.page ? "page" : undefined}
              onClick={() => onPage(item.page)}
            >
              <item.icon data-icon="inline-start" />
              <span>{item.label}</span>
              {page === item.page && <span className="nav-current-dot" />}
            </Button>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-message">
          <span className="mini-spark">
            <Sparkles />
          </span>
          <p>
            Mỗi học viên,
            <br />
            một hành trình.
          </p>
          <div className="mini-path">
            <i />
            <i />
            <i />
          </div>
          <span className="mini-label">Learning, your way.</span>
        </div>
        <Separator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="account-button">
              <PersonAvatar initials={role === "admin" ? "LN" : "SW"} />
              <div>
                <strong>
                  {role === "admin" ? "Linh Nguyễn" : "Sarah Wilson"}
                </strong>
                <span>{role === "admin" ? "Quản trị viên" : "Giáo viên"}</span>
              </div>
              <ChevronDown />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="account-menu"
          >
            <DropdownMenuLabel>
              Chuyển góc nhìn · bản trải nghiệm
            </DropdownMenuLabel>
            <DropdownMenuLabel>
              <span className="menu-note">
                Dùng cùng dữ liệu, không phải đăng nhập.
              </span>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onRole("admin")}>
                <Users />
                Quản trị trung tâm{role === "admin" && <Check />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRole("teacher")}>
                <GraduationCap />
                Giáo viên Sarah{role === "teacher" && <Check />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPage("settings")}>
                <Settings2 />
                Cài đặt trung tâm
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
export function Shell(props: ShellProps) {
  const [open, setOpen] = useState(false);
  const title = navigation.find((n) => n.page === props.page)?.label;
  const changePage = (page: Page) => {
    props.onPage(page);
    setOpen(false);
  };
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Navigation {...props} onPage={changePage} />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="mobile-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Điều hướng Fluento</SheetTitle>
          </SheetHeader>
          <Navigation {...props} onPage={changePage} />
        </SheetContent>
      </Sheet>
      <div className="main-shell">
        <header className="topbar">
          <div className="top-breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Mở điều hướng"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <House className="breadcrumb-home" />
            <ChevronRight />
            <span>{props.academy}</span>
            <ChevronRight />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <SearchField
              value={props.query}
              onChange={props.onQuery}
              placeholder="Tìm học viên, giáo viên…"
              label="Tìm kiếm toàn cục"
            />
            <Badge variant="outline" className="demo-badge">
              Dữ liệu mẫu
            </Badge>
            <button
              className="notification-button"
              aria-label="Xem thông báo"
              onClick={props.onNotifications}
            >
              <Bell />
              {props.pendingReviews > 0 && <span />}
            </button>
            <PersonAvatar
              initials={props.role === "admin" ? "LN" : "SW"}
              small
            />
          </div>
        </header>
        <main className="workspace">{props.children}</main>
        <footer className="app-footer">
          <span>
            Fluento Academy <i /> Mỗi bước tiến đều được ghi nhận.
          </span>
          <span>Bản trải nghiệm · Lưu trên trình duyệt</span>
        </footer>
      </div>
    </div>
  );
}
