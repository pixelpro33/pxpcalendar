"use client";

export type IncomeItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  incomeDate: string;
  incomeTime: string;
  source: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string | null;
};

type Props = {
  income: IncomeItem[];
  previousIncome: IncomeItem[];
  onEdit: (income: IncomeItem) => void;
  onDelete: (id: string) => void;
};

function formatLei(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getTotal(items: IncomeItem[]) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getPercentChange(current: number, previous: number) {
  if (previous <= 0 && current <= 0) return 0;
  if (previous <= 0) return 100;

  return Math.round(((current - previous) / previous) * 100);
}

function groupByCategory(items: IncomeItem[]) {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const key = item.category || "Fara categorie";
    map.set(key, (map.get(key) || 0) + Number(item.amount || 0));
  });

  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export default function IncomePanel({
  income,
  previousIncome,
  onEdit,
  onDelete,
}: Props) {
  const total = getTotal(income);
  const previousTotal = getTotal(previousIncome);
  const diff = total - previousTotal;
  const percent = getPercentChange(total, previousTotal);
  const categories = groupByCategory(income);
  const recent = [...income].slice(0, 12);

  return (
    <section className="pxp-expenses-panel">
      <div className="pxp-expenses-head">
        <div>
          <div className="pxp-dashboard-kicker">Income</div>
          <h3>Venituri</h3>
        </div>

        <div className="pxp-expenses-total income">{formatLei(total)} lei</div>
      </div>

      <div className="pxp-expenses-summary">
        <div className="pxp-expenses-summary-card">
          <span>Luna curenta</span>
          <strong>{formatLei(total)} lei</strong>
        </div>

        <div className="pxp-expenses-summary-card">
          <span>Luna trecuta</span>
          <strong>{formatLei(previousTotal)} lei</strong>
        </div>

        <div
          className={`pxp-expenses-summary-card ${
            diff > 0 ? "is-down" : diff < 0 ? "is-up" : "is-flat"
          }`}
        >
          <span>Diferenta</span>
          <strong>
            {diff > 0 ? "+" : ""}
            {formatLei(diff)} lei
          </strong>
          <small>
            {percent > 0 ? "+" : ""}
            {percent}%
          </small>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="pxp-expenses-categories">
          {categories.map((category) => {
            const percentage =
              total > 0 ? Math.round((category.total / total) * 100) : 0;

            return (
              <div key={category.name} className="pxp-expense-category-row">
                <div>
                  <strong>{category.name}</strong>
                  <span>{percentage}% din venituri</span>
                </div>

                <b>{formatLei(category.total)} lei</b>
              </div>
            );
          })}
        </div>
      )}

      <div className="pxp-expenses-list-head">
        <h4>Ultimele venituri</h4>
        <span>{income.length} total</span>
      </div>

      {recent.length === 0 ? (
        <div className="pxp-dashboard-empty">
          Nu ai venituri in luna selectata.
        </div>
      ) : (
        <div className="pxp-expenses-list">
          {recent.map((item) => (
            <div key={item.id} className="pxp-expense-row">
              <div className="pxp-expense-main">
                <strong>{item.title}</strong>
                <span>
                  {formatDate(item.incomeDate)}
                  {item.incomeTime ? ` · ${item.incomeTime}` : ""}
                  {item.category ? ` · ${item.category}` : ""}
                  {item.source ? ` · ${item.source}` : ""}
                </span>
              </div>

              <div className="pxp-expense-side">
                <b>{formatLei(item.amount)} lei</b>

                <div>
                  <button type="button" onClick={() => onEdit(item)}>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
