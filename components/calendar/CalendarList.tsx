import EventChip from "./EventChip";
import { CalendarItem } from "./types";

type Props = {
  daysInMonth: number;
  groupedByDay: Map<number, CalendarItem[]>;
  selectedMonthLabel: string;
  selectedYear: number;
  hideEmptyDays: boolean;
  onSelectItem: (item: CalendarItem) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isCurrentDay(year: number, monthLabel: string, day: number) {
  const today = new Date();
  const monthIndex = Number(monthLabel) - 1;

  return (
    year === today.getFullYear() &&
    monthIndex === today.getMonth() &&
    day === today.getDate()
  );
}

export default function CalendarList({
  daysInMonth,
  groupedByDay,
  selectedMonthLabel,
  selectedYear,
  hideEmptyDays,
  onSelectItem,
}: Props) {
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <section className="calendar-list">
      {days.map((day) => {
        const items = groupedByDay.get(day) || [];

        if (hideEmptyDays && items.length === 0) {
          return null;
        }

        const date = new Date(`${selectedYear}-${selectedMonthLabel}-${day}`);
        const isToday = isCurrentDay(selectedYear, selectedMonthLabel, day);

        return (
          <div
            key={day}
            className={`calendar-list-row ${isToday ? "is-today" : ""}`}
          >
            <div className="calendar-list-date">
              <span className="calendar-list-weekday">
                {WEEKDAYS[date.getDay()]}
              </span>
              <span className="calendar-list-day">{day}</span>
            </div>

            <div className="calendar-list-separator" aria-hidden="true" />

            <div className="calendar-list-events">
              {items.length > 0 ? (
                items.map((item) => (
                  <EventChip
                    key={item.id}
                    item={item}
                    variant="list"
                    onClick={onSelectItem}
                  />
                ))
              ) : (
                <div className="calendar-list-empty">No events</div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
