import { CalendarItem } from "./types";
import { TYPE_CONFIG } from "./mockData";

type Props = {
  item: CalendarItem;
  variant?: "grid" | "list";
  onClick: (item: CalendarItem) => void;
};

export default function EventChip({ item, variant = "grid", onClick }: Props) {
  const config = TYPE_CONFIG[item.type];

  const amount =
    typeof item.amount === "number" && item.amount > 0
      ? ` - ${item.amount} lei`
      : "";

  const title = `${item.title}${amount}`;

  const style = {
    background: item.customColor || config.bg,
    borderColor: item.customColor || config.border,
    color: config.color,
  };

  return (
    <button
      type="button"
      className={`event-chip event-chip-${variant} ${
        item.completed ? "is-completed" : ""
      }`}
      style={style}
      onClick={() => onClick(item)}
      title={title}
    >
      <span className="event-chip-icon">{config.icon}</span>
      <span className="event-chip-title">{title}</span>
    </button>
  );
}
