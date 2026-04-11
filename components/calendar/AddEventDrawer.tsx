import { TYPE_CONFIG } from "./mockData";
import { DraftEvent, EventType } from "./types";
import { shouldShowAmount } from "./utils";

export default function AddEventDrawer({
  open,
  draft,
  setDraft,
  onClose,
  onSave,
  onOpenRepeat,
  onOpenColor,
}: {
  open: boolean;
  draft: DraftEvent;
  setDraft: (next: DraftEvent) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenRepeat: () => void;
  onOpenColor: () => void;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.58)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "95vh",
          overflowY: "auto",
          background: "#111218",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -30px 80px rgba(0,0,0,0.45)",
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
            display: "flex",
            justifyContent: "space-between",
            padding: 18,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "sticky",
            top: 0,
            background: "#111218",
            zIndex: 2,
          }}
        >
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#93c5fd",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            style={{
              border: "none",
              background: "transparent",
              color: "#93c5fd",
              fontSize: 16,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Save
          </button>
        </div>

        <div style={{ padding: 22 }}>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Add title"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 44,
              lineHeight: 1.05,
              outline: "none",
              marginBottom: 18,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const active = draft.type === type;

              return (
                <button
                  key={type}
                  onClick={() => setDraft({ ...draft, type })}
                  style={{
                    border: `1px solid ${
                      active ? cfg.border : "rgba(255,255,255,0.12)"
                    }`,
                    background: active ? cfg.bg : "rgba(255,255,255,0.04)",
                    color: active ? cfg.color : "white",
                    borderRadius: 14,
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.55,
                  marginBottom: 8,
                }}
              >
                Details
              </div>
              <textarea
                value={draft.details}
                onChange={(e) => setDraft({ ...draft, details: e.target.value })}
                placeholder="Add details"
                rows={3}
                style={{
                  width: "100%",
                  resize: "vertical",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 650, marginBottom: 4 }}>All day</div>
                <div style={{ opacity: 0.6, fontSize: 14 }}>
                  Daca e o zi intreaga, fara ora fixa
                </div>
              </div>

              <button
                onClick={() => setDraft({ ...draft, allDay: !draft.allDay })}
                style={{
                  width: 66,
                  height: 36,
                  borderRadius: 999,
                  border: "none",
                  background: draft.allDay ? "#2563eb" : "rgba(255,255,255,0.12)",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    left: draft.allDay ? 34 : 4,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "white",
                    transition: "all 0.18s ease",
                  }}
                />
              </button>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.55,
                  marginBottom: 8,
                }}
              >
                Date & time
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: draft.allDay ? "1fr" : "1fr",
                  gap: 10,
                }}
              >
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    color: "white",
                    padding: 14,
                    fontSize: 15,
                    outline: "none",
                  }}
                />

                {!draft.allDay && (
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      color: "white",
                      padding: 14,
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                )}
              </div>
            </div>

            <button
              onClick={onOpenRepeat}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
                cursor: "pointer",
                color: "white",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.55,
                  marginBottom: 6,
                }}
              >
                Repeat
              </div>
              <div style={{ fontSize: 15 }}>
                {draft.repeat === "custom"
                  ? `Custom: every ${draft.customRepeat.interval} ${draft.customRepeat.unit}${
                      draft.customRepeat.interval > 1 ? "s" : ""
                    }`
                  : draft.repeat}
              </div>
            </button>

            {shouldShowAmount(draft.type) && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    opacity: 0.55,
                    marginBottom: 8,
                  }}
                >
                  Suma (lei)
                </div>
                <input
                  type="number"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  placeholder="Ex: 220"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    color: "white",
                    padding: 14,
                    fontSize: 15,
                    outline: "none",
                  }}
                />
              </div>
            )}

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.55,
                  marginBottom: 8,
                }}
              >
                Adresa
              </div>
              <input
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                placeholder="Optional"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  color: "white",
                  padding: 14,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={onOpenColor}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
                cursor: "pointer",
                color: "white",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.55,
                  marginBottom: 8,
                }}
              >
                Custom color
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background: draft.customColor || "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <div>{draft.customColor || "Choose default or custom color"}</div>
              </div>
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