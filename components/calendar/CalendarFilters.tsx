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
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 12,
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
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
              fontWeight: 600,
              fontSize: 12,
              lineHeight: 1.2,
              minHeight: 30,
            }}
          >
            <span style={{ fontSize: 12 }}>{cfg.icon}</span>
            <span style={{ fontSize: 12 }}>{cfg.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => setHideEmptyDays(!hideEmptyDays)}
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: hideEmptyDays
            ? "rgba(59,130,246,0.22)"
            : "rgba(255,255,255,0.04)",
          color: "white",
          borderRadius: 10,
          padding: "6px 10px",
          cursor: "pointer",
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: 1.2,
          minHeight: 30,
        }}
      >
        <span style={{ fontSize: 12 }}>Hide empty days</span>
      </button>
    </div>
  );
}
