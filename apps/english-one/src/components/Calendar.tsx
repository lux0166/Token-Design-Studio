import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dateKey, formatDate, type Lesson } from "@/lib/data";

export function MiniCalendar({
  selected,
  onSelect,
  lessons,
}: {
  selected: string;
  onSelect: (date: string) => void;
  lessons: Lesson[];
}) {
  const [month, setMonth] = useState(() => new Date(`${selected}T12:00:00`));
  useEffect(() => {
    setMonth(new Date(`${selected}T12:00:00`));
  }, [selected]);
  const year = month.getFullYear(),
    index = month.getMonth();
  const offset = (new Date(year, index, 1).getDay() + 6) % 7;
  const last = new Date(year, index + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((offset + last) / 7) * 7 },
    (_, i) => new Date(year, index, i - offset + 1, 12),
  );
  const selectedCount = lessons.filter(
    (l) => l.date === selected && l.status !== "cancelled",
  ).length;
  return (
    <div className="mini-calendar">
      <div className="calendar-title">
        <h3>
          Tháng {index + 1}, {year}
        </h3>
        <div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tháng trước"
            onClick={() => setMonth(new Date(year, index - 1, 15))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tháng sau"
            onClick={() => setMonth(new Date(year, index + 1, 15))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="calendar-grid">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <span className="week-label" key={d}>
            {d}
          </span>
        ))}
        {cells.map((date) => {
          const key = dateKey(date),
            hasLesson = lessons.some(
              (l) => l.date === key && l.status !== "cancelled",
            );
          return (
            <button
              key={key}
              aria-label={`Chọn ngày ${key}`}
              aria-pressed={selected === key}
              className={cn(
                "calendar-day",
                date.getMonth() !== index && "outside",
                selected === key && "selected",
                key === dateKey() && "is-today",
              )}
              onClick={() => onSelect(key)}
            >
              {date.getDate()}
              {hasLesson && <i />}
            </button>
          );
        })}
      </div>
      <div className="calendar-footer">
        <strong>{selectedCount} buổi học</strong>
        <span>
          ngày {formatDate(selected, { day: "2-digit", month: "2-digit" })}
        </span>
        <span className="calendar-event-label">
          <i />
          Đã lên lịch
        </span>
      </div>
    </div>
  );
}
