import EventChip from "./EventChip";
import { CalendarItem } from "./types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CalendarList({
  daysInMonth,
  groupedByDay,
  selectedMonthLabel,
  selectedYear,
  hideEmptyDays,
  onSelectItem,
}: {
  daysInMonth: number;
  groupedByDay: Map<number, CalendarItem[]>;
  selectedMonthLabel: string;
  selectedYear: number;
  hideEmptyDays: boolean;
  onSelectItem: (item: CalendarItem) => void;
}) {
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1).filter(
    (day) => {
      if (!hideEmptyDays) return true;
      return (groupedByDay.get(day) || []).length > 0;
    },
  );

  return (
    <section className="pxp-list" aria-label="Calendar list">
      {days.map((day) => {
        const dayItems = groupedByDay.get(day) || [];
        const dateLabel = `${pad(day)} ${selectedMonthLabel} ${selectedYear}`;

        return (
          <article className="pxp-list-day pxp-day-card" key={day}>
            <div className="pxp-list-head">
              <div className="pxp-list-date">{dateLabel}</div>
              <div className="pxp-day-count">
                {dayItems.length} item{dayItems.length === 1 ? "" : "s"}
              </div>
            </div>

            {dayItems.length === 0 ? (
              <div className="pxp-empty-text">Fara evenimente</div>
            ) : (
              <div className="pxp-day-events">
                {dayItems.map((item) => (
                  <EventChip
                    key={item.id}
                    item={item}
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
