"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddEvent: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
};

export default function AddQuickMenu({
  open,
  onClose,
  onAddEvent,
  onAddExpense,
  onAddIncome,
}: Props) {
  if (!open) return null;

  return (
    <div className="pxp-add-menu-overlay" onClick={onClose}>
      <aside
        className="pxp-add-menu-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pxp-add-menu-head">
          <div>
            <div className="pxp-mobile-menu-kicker">Add</div>
            <div className="pxp-mobile-menu-title">Adauga</div>
          </div>

          <button
            type="button"
            className="pxp-mobile-menu-close"
            onClick={onClose}
            aria-label="Close add menu"
          >
            ✕
          </button>
        </div>

        <div className="pxp-mobile-menu-list">
          <button
            type="button"
            className="pxp-mobile-menu-item"
            onClick={onAddEvent}
          >
            <span className="pxp-mobile-menu-item-icon">📅</span>

            <span className="pxp-mobile-menu-item-text">
              Add event
              <small>Taskuri, plati, birthdays si evenimente cu data</small>
            </span>
          </button>

          <button
            type="button"
            className="pxp-mobile-menu-item"
            onClick={onAddExpense}
          >
            <span className="pxp-mobile-menu-item-icon">💸</span>

            <span className="pxp-mobile-menu-item-text">
              Add expense
              <small>Benzina, mancare, parcare, cumparaturi</small>
            </span>
          </button>

          <button
            type="button"
            className="pxp-mobile-menu-item"
            onClick={onAddIncome}
          >
            <span className="pxp-mobile-menu-item-icon">💰</span>

            <span className="pxp-mobile-menu-item-text">
              Add income
              <small>Salariu, dividende, incasari, rambursari</small>
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
