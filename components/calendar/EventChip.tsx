import { CalendarItem } from "./types";
import { TYPE_CONFIG } from "./mockData";
import { getDaysRemaining, getEventChipStyle } from "./utils";

export default function EventChip({
  item,
  onClick,
  compact = false,
}: {
  item: CalendarItem;
  onClick: () => void;
  compact?: boolean;
}) {
  const typeCfg = TYPE_CONFIG[item.type];
  const style = getEventChipStyle(item);

  return (
    <button
      className={`pxp-chip ${compact ? "is-compact" : ""}`}
      onClick={onClick}
      type="button"
      style={style}
      title={item.title}
    >
      <span className="pxp-chip-main">
        <span className="pxp-chip-icon">{typeCfg.icon}</span>

        {!item.allDay && item.time && (
          <span className="pxp-chip-time">{item.time}</span>
        )}

        <span className="pxp-chip-title">{item.title}</span>
      </span>

      {!compact && <span className="pxp-chip-days">{getDaysRemaining(item)}</span>}
    </button>
  );
}
