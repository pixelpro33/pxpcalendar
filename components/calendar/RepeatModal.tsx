import { CustomRepeatConfig, RepeatType, RepeatUnit } from "./types";

export default function RepeatModal({
  open,
  repeat,
  setRepeat,
  customRepeat,
  setCustomRepeat,
  onClose,
}: {
  open: boolean;
  repeat: RepeatType;
  setRepeat: (value: RepeatType) => void;
  customRepeat: CustomRepeatConfig;
  setCustomRepeat: (value: CustomRepeatConfig) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const presetOptions: { value: RepeatType; label: string }[] = [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Every day" },
    { value: "weekly", label: "Every week" },
    { value: "monthly", label: "Every month" },
    { value: "yearly", label: "Every year" },
    { value: "custom", label: "Custom" },
  ];

  const units: RepeatUnit[] = ["day", "week", "month", "year"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.56)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#101117",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 18,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 5,
            borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 12px",
          }}
        />

        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>
          Repeat
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {presetOptions.map((option) => {
            const active = repeat === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setRepeat(option.value)}
                style={{
                  border: `1px solid ${
                    active ? "rgba(96,165,250,0.45)" : "rgba(255,255,255,0.08)"
                  }`,
                  background: active ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.03)",
                  color: "white",
                  borderRadius: 16,
                  padding: "14px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 15,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {repeat === "custom" && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
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
                marginBottom: 10,
              }}
            >
              Custom rule
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 10,
              }}
            >
              <input
                type="number"
                min={1}
                value={customRepeat.interval}
                onChange={(e) =>
                  setCustomRepeat({
                    ...customRepeat,
                    interval: Math.max(1, Number(e.target.value || 1)),
                  })
                }
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

              <select
                value={customRepeat.unit}
                onChange={(e) =>
                  setCustomRepeat({
                    ...customRepeat,
                    unit: e.target.value as RepeatUnit,
                  })
                }
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
              >
                {units.map((unit) => (
                  <option key={unit} value={unit} style={{ color: "black" }}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {customRepeat.unit === "month" && (
              <div style={{ marginTop: 10 }}>
                <select
                  value={customRepeat.monthlyMode || "same_day"}
                  onChange={(e) =>
                    setCustomRepeat({
                      ...customRepeat,
                      monthlyMode: e.target.value as "same_day",
                    })
                  }
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
                >
                  <option value="same_day" style={{ color: "black" }}>
                    On same day every month
                  </option>
                </select>
              </div>
            )}

            <div style={{ marginTop: 12, opacity: 0.7, fontSize: 14 }}>
              Preview: every {customRepeat.interval} {customRepeat.unit}
              {customRepeat.interval > 1 ? "s" : ""}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 14,
              padding: "14px 16px",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}