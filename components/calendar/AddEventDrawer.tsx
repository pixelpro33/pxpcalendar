import { TYPE_CONFIG } from "./mockData";
import { DraftEvent, EventType, RepeatType } from "./types";
import { shouldShowAmount } from "./utils";

const REPEAT_OPTIONS: Array<{
  value: RepeatType;
  label: string;
}> = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "yearly", label: "Every year" },
  { value: "custom", label: "Custom" },
];

export default function AddEventDrawer({
  open,
  draft,
  setDraft,
  onClose,
  onSave,
  categories,
  mode = "add",
}: {
  open: boolean;
  draft: DraftEvent;
  setDraft: (next: DraftEvent) => void;
  onClose: () => void;
  onSave: () => void;
  categories: string[];
  mode?: "add" | "edit";
}) {
  if (!open) return null;

  const titlePlaceholder = mode === "edit" ? "Edit title" : "Add title";
  const saveLabel = mode === "edit" ? "Update" : "Save";

  const categoryOptions =
    draft.category && !categories.includes(draft.category)
      ? [draft.category, ...categories]
      : categories;

  return (
    <div className="pxp-side-overlay" onClick={onClose}>
      <aside className="pxp-side-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-side-bar">
          <button className="pxp-link-button" onClick={onClose} type="button">
            Cancel
          </button>

          <div className="pxp-side-bar-title">
            {mode === "edit" ? "Edit event" : "Add event"}
          </div>

          <button className="pxp-link-button" onClick={onSave} type="button">
            {saveLabel}
          </button>
        </div>

        <div className="pxp-side-content">
          <input
            className="pxp-sheet-title-input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder={titlePlaceholder}
          />

          <div className="pxp-type-grid">
            {(Object.keys(TYPE_CONFIG) as EventType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const active = draft.type === type;

              return (
                <button
                  key={type}
                  className="pxp-type-button"
                  onClick={() => setDraft({ ...draft, type })}
                  type="button"
                  style={{
                    borderColor: active ? cfg.border : "var(--border-strong)",
                    background: active ? cfg.bg : "rgba(255,255,255,0.045)",
                    color: active ? cfg.color : "white",
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>

          <div className="pxp-form-grid">
            <div className="pxp-field-card">
              <div className="pxp-field-title">Details</div>

              <textarea
                className="pxp-textarea"
                value={draft.details}
                onChange={(e) =>
                  setDraft({ ...draft, details: e.target.value })
                }
                placeholder="Add details"
                rows={3}
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-row-between">
                <div>
                  <div style={{ fontWeight: 750, marginBottom: 4 }}>
                    All day
                  </div>
                  <div style={{ opacity: 0.62, fontSize: 14 }}>
                    Daca e o zi intreaga, fara ora fixa
                  </div>
                </div>

                <button
                  className={`pxp-toggle ${draft.allDay ? "is-on" : ""}`}
                  onClick={() => setDraft({ ...draft, allDay: !draft.allDay })}
                  type="button"
                  aria-label="Toggle all day"
                >
                  <span className="pxp-toggle-dot" />
                </button>
              </div>
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Date & time</div>

              <div className="pxp-date-time-grid">
                <input
                  className="pxp-input"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />

                {!draft.allDay && (
                  <input
                    className="pxp-input"
                    type="time"
                    value={draft.time}
                    onChange={(e) =>
                      setDraft({ ...draft, time: e.target.value })
                    }
                  />
                )}
              </div>
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Repeat</div>

              <select
                className="pxp-select"
                value={draft.repeat}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    repeat: e.target.value as RepeatType,
                  })
                }
              >
                {REPEAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {draft.repeat === "custom" && (
                <div className="pxp-custom-repeat-inline">
                  <input
                    className="pxp-input"
                    type="number"
                    min={1}
                    value={draft.customRepeat.interval}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        customRepeat: {
                          ...draft.customRepeat,
                          interval: Math.max(1, Number(e.target.value || 1)),
                        },
                      })
                    }
                  />

                  <select
                    className="pxp-select"
                    value={draft.customRepeat.unit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        customRepeat: {
                          ...draft.customRepeat,
                          unit: e.target
                            .value as DraftEvent["customRepeat"]["unit"],
                        },
                      })
                    }
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Custom color</div>

              <div className="pxp-color-inline">
                <input
                  className="pxp-color-input"
                  type="color"
                  value={draft.customColor || "#3b82f6"}
                  onChange={(e) =>
                    setDraft({ ...draft, customColor: e.target.value })
                  }
                />

                <input
                  className="pxp-input"
                  value={draft.customColor}
                  onChange={(e) =>
                    setDraft({ ...draft, customColor: e.target.value })
                  }
                  placeholder="#3b82f6"
                />

                {draft.customColor && (
                  <button
                    className="pxp-clear-color-button"
                    type="button"
                    onClick={() => setDraft({ ...draft, customColor: "" })}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Address / location</div>

              <input
                className="pxp-input"
                value={draft.address}
                onChange={(e) =>
                  setDraft({ ...draft, address: e.target.value })
                }
                placeholder="Optional address or map link"
              />
            </div>

            {shouldShowAmount(draft.type) && (
              <div className="pxp-field-card">
                <div className="pxp-field-title">
                  {draft.type === "pay" ? "Amount required" : "Amount optional"}
                </div>

                <input
                  className="pxp-input"
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: e.target.value })
                  }
                  inputMode="decimal"
                  placeholder="Ex: 100"
                />
              </div>
            )}

            {draft.type === "pay" && (
              <div className="pxp-field-card">
                <div className="pxp-field-title">Category</div>

                <select
                  className="pxp-select"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  <option value="">Fara categorie</option>

                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
