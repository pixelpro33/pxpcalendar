import { CalendarItem } from "./types";

type CategoryRow = {
  category: string;
  paid: number;
  remaining: number;
  total: number;
  count: number;
};

type Props = {
  items: CalendarItem[];
};

function getPaidAmount(item: CalendarItem) {
  if (!item.completed) return 0;

  if (typeof item.actualAmount === "number") {
    return item.actualAmount;
  }

  if (typeof item.amount === "number") {
    return item.amount;
  }

  return 0;
}

function getRemainingAmount(item: CalendarItem) {
  if (item.completed) return 0;

  if (item.type === "pay" || item.type === "event") {
    return item.amount || 0;
  }

  return 0;
}

function formatLei(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MonthlyDashboard({ items }: Props) {
  const moneyItems = items.filter(
    (item) => item.type === "pay" || typeof item.amount === "number",
  );

  const rowsMap = new Map<string, CategoryRow>();

  moneyItems.forEach((item) => {
    const category = item.category || "Fara categorie";
    const paid = getPaidAmount(item);
    const remaining = getRemainingAmount(item);
    const total = paid + remaining;

    const current = rowsMap.get(category) || {
      category,
      paid: 0,
      remaining: 0,
      total: 0,
      count: 0,
    };

    current.paid += paid;
    current.remaining += remaining;
    current.total += total;
    current.count += 1;

    rowsMap.set(category, current);
  });

  const rows = Array.from(rowsMap.values()).sort((a, b) => b.total - a.total);

  const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0);
  const totalRemaining = rows.reduce((sum, row) => sum + row.remaining, 0);
  const totalMonth = totalPaid + totalRemaining;

  if (moneyItems.length === 0) {
    return (
      <section className="pxp-dashboard">
        <div className="pxp-dashboard-head">
          <div>
            <div className="pxp-dashboard-kicker">Dashboard lunar</div>
            <h2 className="pxp-dashboard-title">Nu exista plati luna asta</h2>
          </div>
        </div>

        <div className="pxp-dashboard-empty">
          Adauga o plata sau o cheltuiala pentru a vedea statistici pe
          categorii.
        </div>
      </section>
    );
  }

  return (
    <section className="pxp-dashboard">
      <div className="pxp-dashboard-head">
        <div>
          <div className="pxp-dashboard-kicker">Dashboard lunar</div>
          <h2 className="pxp-dashboard-title">Rezumat pe categorii</h2>
        </div>

        <div className="pxp-dashboard-count">
          {moneyItems.length} {moneyItems.length === 1 ? "plata" : "plati"}
        </div>
      </div>

      <div className="pxp-dashboard-summary">
        <div className="pxp-dashboard-card">
          <span>Platit</span>
          <strong>{formatLei(totalPaid)} lei</strong>
        </div>

        <div className="pxp-dashboard-card">
          <span>Ramas</span>
          <strong>{formatLei(totalRemaining)} lei</strong>
        </div>

        <div className="pxp-dashboard-card">
          <span>Total luna</span>
          <strong>{formatLei(totalMonth)} lei</strong>
        </div>
      </div>

      <div className="pxp-category-list">
        {rows.map((row) => {
          const percent =
            totalMonth > 0 ? Math.round((row.total / totalMonth) * 100) : 0;

          return (
            <div key={row.category} className="pxp-category-row">
              <div className="pxp-category-top">
                <div>
                  <div className="pxp-category-name">{row.category}</div>
                  <div className="pxp-category-meta">
                    {row.count} {row.count === 1 ? "intrare" : "intrari"} •{" "}
                    {percent}%
                  </div>
                </div>

                <div className="pxp-category-total">
                  {formatLei(row.total)} lei
                </div>
              </div>

              <div className="pxp-category-bar">
                <span style={{ width: `${percent}%` }} />
              </div>

              <div className="pxp-category-bottom">
                <span>Platit: {formatLei(row.paid)} lei</span>
                <span>Ramas: {formatLei(row.remaining)} lei</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
