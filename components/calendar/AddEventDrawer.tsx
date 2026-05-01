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
    <div className="pxp-overlay" onClick={onClose}>
      <section className="pxp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-sheet-grabber" />

        <div className="pxp-sheet-bar">
          <button className="pxp-link-button" onClick={onClose} type="button">
            Cancel
          </button>

          <button className="pxp-link-button" onClick={onSave} type="button">
            Save
          </button>
        </div>

        <div className="pxp-sheet-content">
          <input
            className="pxp-sheet-title-input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Add title"
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
                    borderColor: active ? cfg.border : undefined,
                    background: active ? cfg.bg : undefined,
                    color: active ? cfg.color : undefined,
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
                onChange={(e) => setDraft({ ...draft, details: e.target.value })}
                placeholder="Add details"
                rows={3}
              />
            </div>

            <div className="pxp-field-card pxp-row-between">
              <div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>All day</div>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.35 }}>
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
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                  />
                )}
              </div>
            </div>

            <button className="pxp-action-card" onClick={onOpenRepeat} type="button">
              <div className="pxp-field-title">Repeat</div>
              <div>
                {draft.repeat === "custom"
                  ? `Custom: every ${draft.customRepeat.interval} ${draft.customRepeat.unit}${
                      draft.customRepeat.interval > 1 ? "s" : ""
                    }`
                  : draft.repeat}
              </div>
            </button>

            {shouldShowAmount(draft.type) && (
              <div className="pxp-field-card">
                <div className="pxp-field-title">
                  {draft.type === "pay" ? "Suma obligatorie (lei)" : "Suma optionala (lei)"}
                </div>
                <input
                  className="pxp-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  placeholder="Ex: 220"
                />
              </div>
            )}

            <div className="pxp-field-card">
              <div className="pxp-field-title">Adresa</div>
              <input
                className="pxp-input"
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <button className="pxp-action-card" onClick={onOpenColor} type="button">
              <div className="pxp-field-title">Custom color</div>
              <div className="pxp-color-preview-row">
                <div
                  className="pxp-color-preview"
                  style={{ background: draft.customColor || undefined }}
                />
                <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {draft.customColor || "Choose default or custom color"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
