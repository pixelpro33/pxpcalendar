import type { ReactNode } from "react";
import { CalendarItem } from "./types";
import { TYPE_CONFIG } from "./mockData";
import { formatEventDate, getDaysRemaining, getRepeatLabel } from "./utils";

function DetailCard({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`pxp-detail-card ${wide ? "is-wide" : ""}`}>
      <div className="pxp-section-label">{label}</div>
      <div className="pxp-detail-value">{children}</div>
    </div>
  );
}

function getBaseId(item: CalendarItem) {
  return item.baseId || item.id;
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
    <div className="pxp-overlay" onClick={onClose}>
      <section className="pxp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-sheet-grabber" />

        <div className="pxp-detail-head">
          <div style={{ minWidth: 0 }}>
            <div
              className="pxp-type-badge"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>

            <div
              className="pxp-detail-title"
              style={{
                opacity: item.completed ? 0.55 : 1,
                textDecoration: item.completed ? "line-through" : "none",
              }}
            >
              {item.title}
            </div>

            <div className="pxp-detail-subtitle">
              {getDaysRemaining(item)}
              {item.isOccurrence ? " • repetare" : ""}
            </div>
          </div>

          <button
            className="pxp-icon-button"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="pxp-details-grid">
          <DetailCard label="Data">{formatEventDate(item)}</DetailCard>

          <DetailCard label="Status">
            {item.completed ? "Completed" : "Pending"}
          </DetailCard>

          <DetailCard label="All day">{item.allDay ? "Da" : "Nu"}</DetailCard>

          <DetailCard label="Repeat">{getRepeatLabel(item)}</DetailCard>

          {item.paymentStatus && item.paymentStatus !== "none" && (
            <DetailCard label="Payment status">{item.paymentStatus}</DetailCard>
          )}

          {typeof item.amount === "number" && (
            <DetailCard label="Suma">{item.amount} lei</DetailCard>
          )}

          {typeof item.actualAmount === "number" && (
            <DetailCard label="Suma platita">
              {item.actualAmount} lei
            </DetailCard>
          )}

          {item.address && (
            <DetailCard label="Adresa">{item.address}</DetailCard>
          )}

          {item.details && (
            <DetailCard label="Detalii" wide>
              {item.details}
            </DetailCard>
          )}

          <div className="pxp-actions-grid">
            <button
              className={`pxp-action ${item.completed ? "warning" : "success"}`}
              onClick={() => onToggleComplete(baseId)}
              type="button"
            >
              {item.completed ? "Mark pending" : "Mark completed"}
            </button>

            <button
              className="pxp-action neutral"
              onClick={() => onEdit(item)}
              type="button"
            >
              Edit
            </button>

            <button
              className="pxp-action danger"
              onClick={() => onDelete(baseId)}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
