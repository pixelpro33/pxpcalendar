import type { ExpenseItem } from "./ExpensesPanel";
import { CalendarItem } from "./types";

export type DashboardViewMode = "chart" | "list";

type CategoryRow = {
  category: string;
  scheduledPaid: number;
  spontaneous: number;
  remaining: number;
  total: number;
  count: number;
  payCount: number;
  expenseCount: number;
  previousScheduledPaid: number;
  previousSpontaneous: number;
  previousRemaining: number;
  previousTotal: number;
};

type DashboardTopItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  kind: "pay" | "expense";
};

type Props = {
  currentItems: CalendarItem[];
  previousItems: CalendarItem[];
  currentExpenses: ExpenseItem[];
  previousExpenses: ExpenseItem[];
  viewMode: DashboardViewMode;
};

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#64748b",
];

function isMoneyItem(item: CalendarItem) {
  return item.type === "pay" || typeof item.amount === "number";
}

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

function getExpenseAmount(expense: ExpenseItem) {
  return Number(expense.amount || 0);
}

function formatLei(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

function formatSignedLei(value: number) {
  if (value === 0) return "0 lei";

  const sign = value > 0 ? "+" : "-";
  return `${sign}${formatLei(value)} lei`;
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getChangePercent(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function getShortChangeLabel(current: number, previous: number) {
  const diff = current - previous;
  const percent = getChangePercent(current, previous);

  if (previous === 0 && current > 0) {
    return `+${formatLei(current)} lei`;
  }

  if (diff === 0) {
    return "0 lei";
  }

  if (percent === null) {
    return formatSignedLei(diff);
  }

  return `${formatSignedLei(diff)} / ${percent > 0 ? "+" : ""}${percent}%`;
}

function getChangeLabel(current: number, previous: number) {
  const diff = current - previous;
  const percent = getChangePercent(current, previous);

  if (previous === 0 && current > 0) {
    return `+${formatLei(current)} lei fata de luna trecuta`;
  }

  if (diff === 0) {
    return "La fel ca luna trecuta";
  }

  if (percent === null) {
    return `${formatSignedLei(diff)} fata de luna trecuta`;
  }

  return `${formatSignedLei(diff)} (${percent > 0 ? "+" : ""}${percent}%) fata de luna trecuta`;
}

function getChangeClass(current: number, previous: number) {
  const diff = current - previous;

  if (diff > 0) return "is-up";
  if (diff < 0) return "is-down";
  return "is-flat";
}

function buildRows({
  currentItems,
  previousItems,
  currentExpenses,
  previousExpenses,
}: {
  currentItems: CalendarItem[];
  previousItems: CalendarItem[];
  currentExpenses: ExpenseItem[];
  previousExpenses: ExpenseItem[];
}): CategoryRow[] {
  const rowsMap = new Map<string, CategoryRow>();

  function ensureRow(category: string) {
    const current = rowsMap.get(category);

    if (current) return current;

    const row: CategoryRow = {
      category,
      scheduledPaid: 0,
      spontaneous: 0,
      remaining: 0,
      total: 0,
      count: 0,
      payCount: 0,
      expenseCount: 0,
      previousScheduledPaid: 0,
      previousSpontaneous: 0,
      previousRemaining: 0,
      previousTotal: 0,
    };

    rowsMap.set(category, row);
    return row;
  }

  currentItems.filter(isMoneyItem).forEach((item) => {
    const category = item.category || "Fara categorie";
    const paid = getPaidAmount(item);
    const remaining = getRemainingAmount(item);

    const row = ensureRow(category);
    row.scheduledPaid += paid;
    row.remaining += remaining;
    row.total += paid + remaining;
    row.count += 1;
    row.payCount += 1;
  });

  currentExpenses.forEach((expense) => {
    const category = expense.category || "Fara categorie";
    const amount = getExpenseAmount(expense);

    const row = ensureRow(category);
    row.spontaneous += amount;
    row.total += amount;
    row.count += 1;
    row.expenseCount += 1;
  });

  previousItems.filter(isMoneyItem).forEach((item) => {
    const category = item.category || "Fara categorie";
    const paid = getPaidAmount(item);
    const remaining = getRemainingAmount(item);

    const row = ensureRow(category);
    row.previousScheduledPaid += paid;
    row.previousRemaining += remaining;
    row.previousTotal += paid + remaining;
  });

  previousExpenses.forEach((expense) => {
    const category = expense.category || "Fara categorie";
    const amount = getExpenseAmount(expense);

    const row = ensureRow(category);
    row.previousSpontaneous += amount;
    row.previousTotal += amount;
  });

  return Array.from(rowsMap.values()).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return b.previousTotal - a.previousTotal;
  });
}

function buildDonutGradient(rows: CategoryRow[], total: number) {
  if (total <= 0 || rows.length === 0) {
    return "conic-gradient(rgba(255,255,255,0.08) 0deg 360deg)";
  }

  let start = 0;

  const segments = rows.map((row, index) => {
    const size = (row.total / total) * 360;
    const end = start + size;
    const color = CHART_COLORS[index % CHART_COLORS.length];
    const segment = `${color} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function SummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div className={`pxp-dashboard-card ${tone ? `is-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function DashboardSummary({
  realSpent,
  totalRemaining,
  estimatedMonth,
  previousRealSpent,
  previousRemaining,
  previousEstimatedMonth,
}: {
  realSpent: number;
  totalRemaining: number;
  estimatedMonth: number;
  previousRealSpent: number;
  previousRemaining: number;
  previousEstimatedMonth: number;
}) {
  const realSpentChangeClass = getChangeClass(realSpent, previousRealSpent);
  const estimatedChangeClass = getChangeClass(
    estimatedMonth,
    previousEstimatedMonth,
  );

  return (
    <div className="pxp-dashboard-summary">
      <SummaryCard
        label="Iesiri reale"
        value={`${formatLei(realSpent)} lei`}
        helper={getShortChangeLabel(realSpent, previousRealSpent)}
        tone={
          realSpentChangeClass === "is-up"
            ? "up"
            : realSpentChangeClass === "is-down"
              ? "down"
              : "flat"
        }
      />

      <SummaryCard
        label="Ramas de plata"
        value={`${formatLei(totalRemaining)} lei`}
        helper={`Luna trecuta: ${formatLei(previousRemaining)} lei`}
      />

      <SummaryCard
        label="Estimare luna"
        value={`${formatLei(estimatedMonth)} lei`}
        helper={getShortChangeLabel(estimatedMonth, previousEstimatedMonth)}
        tone={
          estimatedChangeClass === "is-up"
            ? "up"
            : estimatedChangeClass === "is-down"
              ? "down"
              : "flat"
        }
      />
    </div>
  );
}

function ChartView({
  rows,
  estimatedMonth,
  scheduledPaid,
  spontaneousSpent,
  totalRemaining,
  realSpent,
  previousRealSpent,
}: {
  rows: CategoryRow[];
  estimatedMonth: number;
  scheduledPaid: number;
  spontaneousSpent: number;
  totalRemaining: number;
  realSpent: number;
  previousRealSpent: number;
}) {
  const visibleRows = rows.slice(0, 6);
  const realSpentChangeClass = getChangeClass(realSpent, previousRealSpent);

  return (
    <div className="pxp-dashboard-chart-shell">
      <div className="pxp-dashboard-chart-head">
        <div>
          <div className="pxp-dashboard-kicker">Categorii</div>
          <h3 className="pxp-dashboard-subtitle">Distribuire luna</h3>
        </div>

        <div className="pxp-dashboard-list-total">
          {rows.length} {rows.length === 1 ? "categorie" : "categorii"}
        </div>
      </div>

      <div className="pxp-dashboard-chart-grid">
        <div className="pxp-dashboard-chart-visual">
          <div
            className="pxp-dashboard-donut-compact"
            style={{ background: buildDonutGradient(rows, estimatedMonth) }}
          >
            <div className="pxp-dashboard-donut-compact-inner">
              <span>Estimat</span>
              <strong>{formatLei(estimatedMonth)}</strong>
              <small>lei</small>
            </div>
          </div>

          <div className="pxp-dashboard-chart-mini-cards">
            <div className="pxp-dashboard-chart-mini-card">
              <span>Plati achitate</span>
              <strong>{formatLei(scheduledPaid)} lei</strong>
            </div>

            <div className="pxp-dashboard-chart-mini-card">
              <span>Spontan</span>
              <strong>{formatLei(spontaneousSpent)} lei</strong>
            </div>

            <div className="pxp-dashboard-chart-mini-card">
              <span>Ramas</span>
              <strong>{formatLei(totalRemaining)} lei</strong>
            </div>
          </div>
        </div>

        <div className="pxp-dashboard-chart-legend-box">
          {visibleRows.map((row, index) => {
            const percent = getPercent(row.total, estimatedMonth);
            const color = CHART_COLORS[index % CHART_COLORS.length];

            return (
              <div
                key={row.category}
                className="pxp-dashboard-chart-legend-item"
              >
                <div className="pxp-dashboard-chart-legend-left">
                  <i
                    className="pxp-dashboard-chart-legend-dot"
                    style={{ background: color }}
                  />
                  <div className="pxp-dashboard-chart-legend-text">
                    <strong>{row.category}</strong>
                    <span>{formatLei(row.total)} lei</span>
                  </div>
                </div>

                <b>{percent}%</b>
              </div>
            );
          })}

          <div className={`pxp-dashboard-chart-change ${realSpentChangeClass}`}>
            {getChangeLabel(realSpent, previousRealSpent)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListView({
  rows,
  estimatedMonth,
}: {
  rows: CategoryRow[];
  estimatedMonth: number;
}) {
  return (
    <div className="pxp-dashboard-list-panel">
      <div className="pxp-dashboard-list-head">
        <div>
          <div className="pxp-dashboard-kicker">Categorii</div>
          <h3 className="pxp-dashboard-subtitle">Lista combinata</h3>
        </div>

        <div className="pxp-dashboard-list-total">
          {rows.length} {rows.length === 1 ? "categorie" : "categorii"}
        </div>
      </div>

      <div className="pxp-dashboard-clean-list">
        {rows.map((row, index) => {
          const percent = getPercent(row.total, estimatedMonth);
          const realSpent = row.scheduledPaid + row.spontaneous;
          const realPercent = getPercent(realSpent, row.total);
          const previousRealSpent =
            row.previousScheduledPaid + row.previousSpontaneous;
          const changeClass = getChangeClass(realSpent, previousRealSpent);
          const color = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <article key={row.category} className="pxp-dashboard-clean-row">
              <div className="pxp-dashboard-clean-main">
                <div
                  className="pxp-dashboard-clean-dot"
                  style={{ background: color }}
                />

                <div className="pxp-dashboard-clean-text">
                  <div className="pxp-dashboard-clean-title">
                    {row.category}
                  </div>
                  <div className="pxp-dashboard-clean-meta">
                    {row.payCount} {row.payCount === 1 ? "plata" : "plati"} ·{" "}
                    {row.expenseCount}{" "}
                    {row.expenseCount === 1 ? "expense" : "expenses"} ·{" "}
                    {percent}% din total
                  </div>
                </div>

                <div className="pxp-dashboard-clean-value">
                  <strong>{formatLei(row.total)} lei</strong>
                  <span>{realPercent}% deja iesit</span>
                </div>
              </div>

              <div className="pxp-dashboard-clean-bar">
                <span style={{ width: `${percent}%`, background: color }} />
              </div>

              <div className="pxp-dashboard-clean-footer">
                <span>Plati: {formatLei(row.scheduledPaid)} lei</span>
                <span>Spontan: {formatLei(row.spontaneous)} lei</span>
                <span>Ramas: {formatLei(row.remaining)} lei</span>
              </div>

              <div className={`pxp-dashboard-clean-change ${changeClass}`}>
                {getChangeLabel(realSpent, previousRealSpent)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function buildTopItems({
  currentItems,
  currentExpenses,
}: {
  currentItems: CalendarItem[];
  currentExpenses: ExpenseItem[];
}): DashboardTopItem[] {
  const payItems: DashboardTopItem[] = currentItems
    .filter(isMoneyItem)
    .map((item) => ({
      id: `pay-${item.id}`,
      title: item.title,
      category: item.category || "Fara categorie",
      amount: getPaidAmount(item) + getRemainingAmount(item),
      kind: "pay",
    }));

  const expenseItems: DashboardTopItem[] = currentExpenses.map((expense) => ({
    id: `expense-${expense.id}`,
    title: expense.title,
    category: expense.category || "Fara categorie",
    amount: getExpenseAmount(expense),
    kind: "expense",
  }));

  return [...payItems, ...expenseItems]
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function TopItems({
  currentItems,
  currentExpenses,
}: {
  currentItems: CalendarItem[];
  currentExpenses: ExpenseItem[];
}) {
  const topItems = buildTopItems({ currentItems, currentExpenses });

  if (topItems.length === 0) return null;

  return (
    <div className="pxp-dashboard-list-panel">
      <div className="pxp-dashboard-list-head">
        <div>
          <div className="pxp-dashboard-kicker">Top luna</div>
          <h3 className="pxp-dashboard-subtitle">Cele mai mari iesiri</h3>
        </div>
      </div>

      <div className="pxp-dashboard-top-items">
        {topItems.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <div key={item.id} className="pxp-dashboard-top-item">
              <div className="pxp-dashboard-top-left">
                <i style={{ background: color }} />
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.kind === "pay" ? "Plata" : "Expense"} ·{" "}
                    {item.category}
                  </span>
                </div>
              </div>

              <b>{formatLei(item.amount)} lei</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MonthlyDashboard({
  currentItems,
  previousItems,
  currentExpenses,
  previousExpenses,
  viewMode,
}: Props) {
  const moneyItems = currentItems.filter(isMoneyItem);
  const previousMoneyItems = previousItems.filter(isMoneyItem);

  const rows = buildRows({
    currentItems,
    previousItems,
    currentExpenses,
    previousExpenses,
  });

  const scheduledPaid = rows.reduce((sum, row) => sum + row.scheduledPaid, 0);
  const spontaneousSpent = rows.reduce((sum, row) => sum + row.spontaneous, 0);
  const totalRemaining = rows.reduce((sum, row) => sum + row.remaining, 0);
  const realSpent = scheduledPaid + spontaneousSpent;
  const estimatedMonth = realSpent + totalRemaining;

  const previousScheduledPaid = rows.reduce(
    (sum, row) => sum + row.previousScheduledPaid,
    0,
  );
  const previousSpontaneousSpent = rows.reduce(
    (sum, row) => sum + row.previousSpontaneous,
    0,
  );
  const previousRemaining = rows.reduce(
    (sum, row) => sum + row.previousRemaining,
    0,
  );
  const previousRealSpent = previousScheduledPaid + previousSpontaneousSpent;
  const previousEstimatedMonth = previousRealSpent + previousRemaining;

  const entryCount = moneyItems.length + currentExpenses.length;
  const previousEntryCount =
    previousMoneyItems.length + previousExpenses.length;

  if (entryCount === 0 && previousEntryCount === 0) {
    return (
      <section className="pxp-dashboard">
        <div className="pxp-dashboard-head">
          <div>
            <div className="pxp-dashboard-kicker">Dashboard lunar</div>
            <h2 className="pxp-dashboard-title">Nu exista date financiare</h2>
          </div>
        </div>

        <div className="pxp-dashboard-empty">
          Adauga o plata sau o cheltuiala pentru a vedea statistici, categorii
          si comparatii fata de luna trecuta.
        </div>
      </section>
    );
  }

  return (
    <section className="pxp-dashboard">
      <div className="pxp-dashboard-head">
        <div>
          <div className="pxp-dashboard-kicker">Dashboard lunar</div>
          <h2 className="pxp-dashboard-title">
            {viewMode === "chart" ? "Grafic financiar" : "Lista financiara"}
          </h2>
        </div>

        <div className="pxp-dashboard-count">
          {entryCount} {entryCount === 1 ? "intrare" : "intrari"}
        </div>
      </div>

      <DashboardSummary
        realSpent={realSpent}
        totalRemaining={totalRemaining}
        estimatedMonth={estimatedMonth}
        previousRealSpent={previousRealSpent}
        previousRemaining={previousRemaining}
        previousEstimatedMonth={previousEstimatedMonth}
      />

      {viewMode === "chart" ? (
        <ChartView
          rows={rows}
          estimatedMonth={estimatedMonth}
          scheduledPaid={scheduledPaid}
          spontaneousSpent={spontaneousSpent}
          totalRemaining={totalRemaining}
          realSpent={realSpent}
          previousRealSpent={previousRealSpent}
        />
      ) : (
        <>
          <ListView rows={rows} estimatedMonth={estimatedMonth} />
          <TopItems
            currentItems={moneyItems}
            currentExpenses={currentExpenses}
          />
        </>
      )}
    </section>
  );
}
