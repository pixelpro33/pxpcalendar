import { CalendarItem } from "./types";
import { TYPE_CONFIG } from "./mockData";
import { formatEventDate, getDaysRemaining, getRepeatLabel } from "./utils";

function getBaseId(item: CalendarItem) {
  return item.baseId || item.id;
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="pxp-event-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function EventDetailsModal({
  item,
  onClose,
  onToggleComplete,
  onDelete,
  onEdit,
}: {
  item: CalendarItem | null;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: CalendarItem) => void;
}) {
  if (!item) return null;

  const cfg = TYPE_CONFIG[item.type];
  const baseId = getBaseId(item);

  return (
    <div className="pxp-event-drawer-overlay" onClick={onClose}>
      <aside className="pxp-event-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-event-drawer-bar">
          <div className="pxp-event-drawer-kicker">Detalii</div>

          <button
            className="pxp-event-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="pxp-event-drawer-content">
          <div className="pxp-event-hero">
            <div
              className="pxp-event-type-pill"
              style={{
                background: cfg.bg,
                borderColor: cfg.border,
                color: cfg.color,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>

            <h2
              className="pxp-event-title"
              style={{
                opacity: item.completed ? 0.55 : 1,
                textDecoration: item.completed ? "line-through" : "none",
              }}
            >
              {item.title}
            </h2>

            <div className="pxp-event-subtitle">
              {getDaysRemaining(item)}
              {item.isOccurrence ? " • repetare" : ""}
            </div>
          </div>

          <div className="pxp-event-status-row">
            <div className={item.completed ? "is-completed" : "is-pending"}>
              <span>{item.completed ? "✅" : "⏳"}</span>
              <strong>{item.completed ? "Completed" : "Pending"}</strong>
            </div>

            <div>
              <span>🔁</span>
              <strong>{getRepeatLabel(item)}</strong>
            </div>
          </div>

          <div className="pxp-event-lines">
            <DetailLine label="Data" value={formatEventDate(item)} />
            <DetailLine label="All day" value={item.allDay ? "Da" : "Nu"} />

            {item.paymentStatus && item.paymentStatus !== "none" && (
              <DetailLine label="Payment" value={item.paymentStatus} />
            )}

            {typeof item.amount === "number" && (
              <DetailLine label="Suma" value={`${item.amount} lei`} />
            )}

            {typeof item.actualAmount === "number" && (
              <DetailLine label="Platit" value={`${item.actualAmount} lei`} />
            )}

            {item.category && (
              <DetailLine label="Categorie" value={item.category} />
            )}

            {item.address && (
              <DetailLine label="Locatie" value={item.address} />
            )}
          </div>

          {item.details && (
            <div className="pxp-event-note">
              <span>Detalii</span>
              <p>{item.details}</p>
            </div>
          )}
        </div>

        <div className="pxp-event-drawer-actions">
          <button
            className={`pxp-event-action ${
              item.completed ? "warning" : "success"
            }`}
            onClick={() => onToggleComplete(baseId)}
            type="button"
          >
            {item.completed ? "Mark pending" : "Mark completed"}
          </button>

          <button
            className="pxp-event-action neutral"
            onClick={() => onEdit(item)}
            type="button"
          >
            Edit
          </button>

          <button
            className="pxp-event-action danger"
            onClick={() => onDelete(baseId)}
            type="button"
          >
            Delete
          </button>
        </div>
      </aside>
    </div>
  );
}
