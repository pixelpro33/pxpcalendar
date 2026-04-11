import { TYPE_CONFIG } from "./mockData";
import { EventType, FiltersState } from "./types";

export default function CalendarFilters({
  filters,
  onToggle,
  hideEmptyDays,
  setHideEmptyDays,
}: {
  filters: FiltersState;
  onToggle: (type: EventType) => void;
  hideEmptyDays: boolean;
  setHideEmptyDays: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
        const cfg = TYPE_CONFIG[type];
        const active = filters[type];

        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            style={{
              border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.08)"}`,
              background: active ? cfg.bg : "rgba(255,255,255,0.04)",
              color: active ? cfg.color : "rgba(255,255,255,0.7)",
              borderRadius: 999,
              padding: "9px 13px",
              cursor: "pointer",
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => setHideEmptyDays(!hideEmptyDays)}
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: hideEmptyDays ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.04)",
          color: "white",
          borderRadius: 999,
          padding: "9px 13px",
          cursor: "pointer",
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <span>Hide empty days</span>
      </button>
    </div>
  );
}