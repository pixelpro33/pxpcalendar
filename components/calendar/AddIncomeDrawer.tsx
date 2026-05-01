"use client";

export type IncomeDraft = {
  title: string;
  amount: string;
  category: string;
  incomeDate: string;
  incomeTime: string;
  source: string;
  notes: string;
};

type Props = {
  open: boolean;
  draft: IncomeDraft;
  setDraft: (draft: IncomeDraft) => void;
  categories: string[];
  onClose: () => void;
  onSave: () => void;
};

const SOURCES = ["", "Card", "Cash", "Transfer", "Firma", "Altceva"];

export function buildIncomeDraft(date = new Date()): IncomeDraft {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return {
    title: "",
    amount: "",
    category: "",
    incomeDate: `${year}-${month}-${day}`,
    incomeTime: `${hour}:${minute}`,
    source: "Transfer",
    notes: "",
  };
}

export default function AddIncomeDrawer({
  open,
  draft,
  setDraft,
  categories,
  onClose,
  onSave,
}: Props) {
  if (!open) return null;

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

          <div className="pxp-side-bar-title">Add income</div>

          <button className="pxp-link-button" onClick={onSave} type="button">
            Save
          </button>
        </div>

        <div className="pxp-side-content">
          <input
            className="pxp-sheet-title-input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Salariu, dividende, incasari..."
          />

          <div className="pxp-form-grid">
            <div className="pxp-field-card">
              <div className="pxp-field-title">Suma</div>

              <input
                className="pxp-input"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                inputMode="decimal"
                placeholder="Ex: 2500"
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Categorie</div>

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

            <div className="pxp-field-card">
              <div className="pxp-field-title">Data si ora</div>

              <div className="pxp-date-time-grid">
                <input
                  className="pxp-input"
                  type="date"
                  value={draft.incomeDate}
                  onChange={(e) =>
                    setDraft({ ...draft, incomeDate: e.target.value })
                  }
                />

                <input
                  className="pxp-input"
                  type="time"
                  value={draft.incomeTime}
                  onChange={(e) =>
                    setDraft({ ...draft, incomeTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Sursa / metoda</div>

              <select
                className="pxp-select"
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              >
                {SOURCES.map((source) => (
                  <option key={source || "empty"} value={source}>
                    {source || "Nespecificat"}
                  </option>
                ))}
              </select>
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Note</div>

              <textarea
                className="pxp-textarea"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Optional"
                rows={3}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
