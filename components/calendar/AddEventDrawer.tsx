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
  categories,
  mode = "add",
}: {
  open: boolean;
  draft: DraftEvent;
  setDraft: (next: DraftEvent) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenRepeat: () => void;
  onOpenColor: () => void;
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

            <button
              className="pxp-action-card"
              onClick={onOpenRepeat}
              type="button"
            >
              <div className="pxp-field-title">Repeat</div>
              <div style={{ fontWeight: 800 }}>{draft.repeat}</div>
            </button>

            <button
              className="pxp-action-card"
              onClick={onOpenColor}
              type="button"
            >
              <div className="pxp-field-title">Custom color</div>

              <div className="pxp-color-preview-row">
                <span
                  className="pxp-color-preview"
                  style={{
                    background: draft.customColor || "rgba(255,255,255,0.08)",
                  }}
                />
                <span style={{ opacity: 0.75 }}>
                  {draft.customColor || "Default color"}
                </span>
              </div>
            </button>

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
