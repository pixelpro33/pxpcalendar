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
        borderRadius: 24,
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
              padding: "14px 12px",
              fontSize: 13,
              opacity: 0.65,
              textAlign: "center",
              fontWeight: 600,
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
                minHeight: 150,
                borderRight:
                  day % 7 !== 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  opacity: 0.92,
                  marginBottom: 4,
                }}
              >
                {day}
              </div>

              {dayItems.slice(0, 3).map((item) => (
                <EventChip
                  key={item.id}
                  item={item}
                  compact
                  onClick={() => onSelectItem(item)}
                />
              ))}

              {dayItems.length > 3 && (
                <button
                  onClick={() => onSelectItem(dayItems[0])}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    textAlign: "left",
                    padding: "2px 4px",
                    cursor: "pointer",
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