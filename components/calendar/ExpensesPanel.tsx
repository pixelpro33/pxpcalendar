"use client";

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  expenseTime: string;
  paymentMethod: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string | null;
};

type Props = {
  expenses: ExpenseItem[];
  previousExpenses: ExpenseItem[];
  onEdit: (expense: ExpenseItem) => void;
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

function getTotal(expenses: ExpenseItem[]) {
  return expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
}

function getPercentChange(current: number, previous: number) {
  if (previous <= 0 && current <= 0) return 0;
  if (previous <= 0) return 100;

  return Math.round(((current - previous) / previous) * 100);
}

function groupByCategory(expenses: ExpenseItem[]) {
  const map = new Map<string, number>();

  expenses.forEach((expense) => {
    const key = expense.category || "Fara categorie";
    map.set(key, (map.get(key) || 0) + Number(expense.amount || 0));
  });

  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export default function ExpensesPanel({
  expenses,
  previousExpenses,
  onEdit,
  onDelete,
}: Props) {
  const total = getTotal(expenses);
  const previousTotal = getTotal(previousExpenses);
  const diff = total - previousTotal;
  const percent = getPercentChange(total, previousTotal);
  const categories = groupByCategory(expenses);
  const recent = [...expenses].slice(0, 12);

  return (
    <section className="pxp-expenses-panel">
      <div className="pxp-expenses-head">
        <div>
          <div className="pxp-dashboard-kicker">Expenses</div>
          <h3>Cheltuieli spontane</h3>
        </div>

        <div className="pxp-expenses-total">{formatLei(total)} lei</div>
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
            diff > 0 ? "is-up" : diff < 0 ? "is-down" : "is-flat"
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
                  <span>{percentage}% din cheltuieli</span>
                </div>

                <b>{formatLei(category.total)} lei</b>
              </div>
            );
          })}
        </div>
      )}

      <div className="pxp-expenses-list-head">
        <h4>Ultimele cheltuieli</h4>
        <span>{expenses.length} total</span>
      </div>

      {recent.length === 0 ? (
        <div className="pxp-dashboard-empty">
          Nu ai cheltuieli spontane in luna selectata.
        </div>
      ) : (
        <div className="pxp-expenses-list">
          {recent.map((expense) => (
            <div key={expense.id} className="pxp-expense-row">
              <div className="pxp-expense-main">
                <strong>{expense.title}</strong>
                <span>
                  {formatDate(expense.expenseDate)}
                  {expense.expenseTime ? ` · ${expense.expenseTime}` : ""}
                  {expense.category ? ` · ${expense.category}` : ""}
                  {expense.paymentMethod ? ` · ${expense.paymentMethod}` : ""}
                </span>
              </div>

              <div className="pxp-expense-side">
                <b>{formatLei(expense.amount)} lei</b>

                <div>
                  <button type="button" onClick={() => onEdit(expense)}>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(expense.id)}
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
