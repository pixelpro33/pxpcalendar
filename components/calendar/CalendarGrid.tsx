import EventChip from "./EventChip";
import { WEEKDAY_LABELS } from "./mockData";
import { CalendarItem } from "./types";

export default function CalendarGrid({
  daysInMonth,
  groupedByDay,
  onSelectItem,
}: {
  daysInMonth: number;
  groupedByDay: Map<number, CalendarItem[]>;
  onSelectItem: (item: CalendarItem) => void;
}) {
  return (
    <section className="pxp-grid-panel pxp-panel" aria-label="Calendar grid">
      <div className="pxp-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div className="pxp-weekday" key={label}>
            {label}
          </div>
        ))}
      </div>

      <div className="pxp-calendar-grid">
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayItems = groupedByDay.get(day) || [];

          return (
            <article className="pxp-calendar-day pxp-day-card" key={day}>
              <div className="pxp-day-head">
                <div className="pxp-day-number">{day}</div>
                <div className="pxp-day-count">
                  {dayItems.length} item{dayItems.length === 1 ? "" : "s"}
                </div>
              </div>

              {dayItems.length === 0 ? (
                <div className="pxp-empty-text">Fara evenimente</div>
              ) : (
                <div className="pxp-day-events">
                  {dayItems.slice(0, 3).map((item) => (
                    <EventChip
                      key={item.id}
                      item={item}
                      compact
                      onClick={() => onSelectItem(item)}
                    />
                  ))}
                </div>
              )}

              {dayItems.length > 3 && (
                <button
                  className="pxp-more-button"
                  onClick={() => onSelectItem(dayItems[0])}
                  type="button"
                >
                  +{dayItems.length - 3} more
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
