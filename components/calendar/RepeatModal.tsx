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
    <div className="pxp-overlay is-small" onClick={onClose}>
      <section className="pxp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-sheet-grabber" />

        <div className="pxp-sheet-content">
          <div className="pxp-modal-title">Repeat</div>

          <div className="pxp-options-grid">
            {presetOptions.map((option) => (
              <button
                key={option.value}
                className={`pxp-option-button ${repeat === option.value ? "is-active" : ""}`}
                onClick={() => setRepeat(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          {repeat === "custom" && (
            <div className="pxp-field-card" style={{ marginTop: 14 }}>
              <div className="pxp-field-title">Custom rule</div>

              <div className="pxp-custom-repeat-grid">
                <input
                  className="pxp-input"
                  type="number"
                  min={1}
                  value={customRepeat.interval}
                  onChange={(e) =>
                    setCustomRepeat({
                      ...customRepeat,
                      interval: Math.max(1, Number(e.target.value || 1)),
                    })
                  }
                />

                <select
                  className="pxp-select"
                  value={customRepeat.unit}
                  onChange={(e) =>
                    setCustomRepeat({
                      ...customRepeat,
                      unit: e.target.value as RepeatUnit,
                    })
                  }
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {customRepeat.unit === "month" && (
                <select
                  className="pxp-select"
                  value={customRepeat.monthlyMode || "same_day"}
                  onChange={(e) =>
                    setCustomRepeat({
                      ...customRepeat,
                      monthlyMode: e.target.value as "same_day",
                    })
                  }
                  style={{ marginTop: 9 }}
                >
                  <option value="same_day">On same day every month</option>
                </select>
              )}

              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>
                Preview: every {customRepeat.interval} {customRepeat.unit}
                {customRepeat.interval > 1 ? "s" : ""}
              </div>
            </div>
          )}

          <button
            className="pxp-action neutral"
            onClick={onClose}
            type="button"
            style={{ width: "100%", marginTop: 14, background: "var(--blue)" }}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
