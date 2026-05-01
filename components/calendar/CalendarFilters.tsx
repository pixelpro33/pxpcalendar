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
    <div className="pxp-filters" aria-label="Calendar filters">
      {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
        const cfg = TYPE_CONFIG[type];
        const active = filters[type];

        return (
          <button
            key={type}
            className="pxp-pill"
            onClick={() => onToggle(type)}
            type="button"
            style={{
              borderColor: active ? cfg.border : undefined,
              background: active ? cfg.bg : undefined,
              color: active ? cfg.color : undefined,
            }}
          >
            {cfg.icon} {cfg.label}
          </button>
        );
      })}

      <button
        className={`pxp-pill ${hideEmptyDays ? "is-active" : ""}`}
        onClick={() => setHideEmptyDays(!hideEmptyDays)}
        type="button"
      >
        Hide empty days
      </button>
    </div>
  );
}
