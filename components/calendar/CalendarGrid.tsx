import EventChip from "./EventChip";
import { CalendarItem } from "./types";

type Props = {
  daysInMonth: number;
  groupedByDay: Map<number, CalendarItem[]>;
  selectedYear: number;
  selectedMonth: number;
  onSelectItem: (item: CalendarItem) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMondayFirstOffset(year: number, monthIndex: number) {
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function isCurrentDay(year: number, monthIndex: number, day: number) {
  const today = new Date();

  return (
    year === today.getFullYear() &&
    monthIndex === today.getMonth() &&
    day === today.getDate()
  );
}

export default function CalendarGrid({
  daysInMonth,
  groupedByDay,
  selectedYear,
  selectedMonth,
  onSelectItem,
}: Props) {
  const offset = getMondayFirstOffset(selectedYear, selectedMonth);
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 ? day : null;
  });

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <section className="calendar-grid-wrap">
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, index) => {
          if (!day) {
            return (
              <div key={`empty-${index}`} className="calendar-day empty" />
            );
          }

          const isToday = isCurrentDay(selectedYear, selectedMonth, day);
          const items = groupedByDay.get(day) || [];
          const visibleItems = items.slice(0, 3);
          const hiddenCount = Math.max(items.length - visibleItems.length, 0);

          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? "is-today" : ""}`}
            >
              <div className="calendar-day-head">
                <div
                  className={`calendar-day-number ${isToday ? "is-today" : ""}`}
                >
                  {day}
                </div>
              </div>

              <div className="calendar-day-events">
                {visibleItems.map((item) => (
                  <EventChip
                    key={item.id}
                    item={item}
                    variant="grid"
                    onClick={onSelectItem}
                  />
                ))}

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    className="calendar-more"
                    onClick={() => onSelectItem(items[3])}
                  >
                    +{hiddenCount}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
