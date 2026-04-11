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
      onClick={onClick}
      style={{
        ...style,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 0,
        padding: compact ? "4px 6px" : "8px 10px",
        fontSize: 12,
        lineHeight: 1.2,
        cursor: "pointer",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        backgroundClip: "padding-box",
        margin: 0,
      }}
    >
      <span style={{ flexShrink: 0, fontSize: 12 }}>{typeCfg.icon}</span>

      {!item.allDay && item.time && (
        <span style={{ opacity: 0.85, flexShrink: 0, fontSize: 12 }}>
          {item.time}
        </span>
      )}

      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
          flex: 1,
          fontSize: 12,
        }}
      >
        {item.title}
      </span>

      {!compact && (
        <span
          style={{
            opacity: 0.7,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {getDaysRemaining(item)}
        </span>
      )}
    </button>
  );
}
