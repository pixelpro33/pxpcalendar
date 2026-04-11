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
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              padding: "8px 4px",
              fontSize: 12,
              opacity: 0.65,
              textAlign: "center",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        }}
      >
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayItems = groupedByDay.get(day) || [];

          return (
            <div
              key={day}
              style={{
                minHeight: 100,
                borderRight:
                  day % 7 !== 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  opacity: 0.92,
                  padding: "8px 8px 6px",
                  lineHeight: 1.2,
                }}
              >
                {day}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 1,
                  width: "100%",
                }}
              >
                {dayItems.slice(0, 3).map((item) => (
                  <EventChip
                    key={item.id}
                    item={item}
                    compact
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>

              {dayItems.length > 3 && (
                <button
                  onClick={() => onSelectItem(dayItems[0])}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    textAlign: "left",
                    padding: "4px 8px",
                    cursor: "pointer",
                    lineHeight: 1.2,
                  }}
                >
                  +{dayItems.length - 3} more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
