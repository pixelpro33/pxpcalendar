import { CalendarItem } from "./types";
import { TYPE_CONFIG } from "./mockData";
import { formatEventDate, getDaysRemaining, getRepeatLabel } from "./utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        opacity: 0.55,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function EventDetailsModal({
  item,
  onClose,
  onToggleComplete,
  onDelete,
}: {
  item: CalendarItem | null;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!item) return null;

  const cfg = TYPE_CONFIG[item.type];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 40,
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#101117",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.45)",
          animation: "slideUp 180ms ease-out",
        }}
      >
        <div
          style={{
            width: 52,
            height: 5,
            borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            margin: "10px auto 6px",
          }}
        />

        <div
          style={{
            padding: 18,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 999,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.05,
                opacity: item.completed ? 0.55 : 1,
                textDecoration: item.completed ? "line-through" : "none",
              }}
            >
              {item.title}
            </div>

            <div style={{ opacity: 0.65, marginTop: 8 }}>
              {getDaysRemaining(item)}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "0 18px 20px",
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <SectionTitle>Data</SectionTitle>
              <div>{formatEventDate(item)}</div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <SectionTitle>Status</SectionTitle>
              <div>{item.completed ? "Completed" : "Pending"}</div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <SectionTitle>All day</SectionTitle>
              <div>{item.allDay ? "Da" : "Nu"}</div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <SectionTitle>Repeat</SectionTitle>
              <div>{getRepeatLabel(item)}</div>
            </div>

            {typeof item.amount === "number" && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <SectionTitle>Suma</SectionTitle>
                <div>{item.amount} lei</div>
              </div>
            )}

            {item.address && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <SectionTitle>Adresa</SectionTitle>
                <div>{item.address}</div>
              </div>
            )}
          </div>

          {item.details && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <SectionTitle>Detalii</SectionTitle>
              <div style={{ lineHeight: 1.6, opacity: 0.9 }}>{item.details}</div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <button
              onClick={() => onToggleComplete(item.id)}
              style={{
                border: "none",
                borderRadius: 14,
                padding: "14px 16px",
                background: item.completed ? "#f59e0b" : "#22c55e",
                color: "#08110b",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {item.completed ? "Mark pending" : "Mark completed"}
            </button>

            <button
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "14px 16px",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(item.id)}
              style={{
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: 14,
                padding: "14px 16px",
                background: "rgba(239,68,68,0.16)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}