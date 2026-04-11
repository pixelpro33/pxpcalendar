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
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1).filter((day) => {
    if (!hideEmptyDays) return true;
    return (groupedByDay.get(day) || []).length > 0;
  });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {days.map((day) => {
        const dayItems = groupedByDay.get(day) || [];
        const dateLabel = `${pad(day)} ${selectedMonthLabel} ${selectedYear}`;

        return (
          <div
            key={day}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              padding: 16,
              boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18 }}>{dateLabel}</div>
              <div style={{ opacity: 0.5, fontSize: 13 }}>
                {dayItems.length} item{dayItems.length === 1 ? "" : "s"}
              </div>
            </div>

            {dayItems.length === 0 ? (
              <div style={{ opacity: 0.35, fontSize: 14 }}>Fara evenimente</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {dayItems.map((item) => (
                  <EventChip
                    key={item.id}
                    item={item}
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}