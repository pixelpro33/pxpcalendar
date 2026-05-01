import { CalendarItem } from "./types";

export type DashboardViewMode = "chart" | "list";

type CategoryRow = {
  category: string;
  paid: number;
  remaining: number;
  total: number;
  count: number;
  previousPaid: number;
  previousRemaining: number;
  previousTotal: number;
};

type Props = {
  currentItems: CalendarItem[];
  previousItems: CalendarItem[];
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

function buildRows(
  currentItems: CalendarItem[],
  previousItems: CalendarItem[],
): CategoryRow[] {
  const rowsMap = new Map<string, CategoryRow>();

  function ensureRow(category: string) {
    const current = rowsMap.get(category);

    if (current) return current;

    const row: CategoryRow = {
      category,
      paid: 0,
      remaining: 0,
      total: 0,
      count: 0,
      previousPaid: 0,
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
    row.paid += paid;
    row.remaining += remaining;
    row.total += paid + remaining;
    row.count += 1;
  });

  previousItems.filter(isMoneyItem).forEach((item) => {
    const category = item.category || "Fara categorie";
    const paid = getPaidAmount(item);
    const remaining = getRemainingAmount(item);

    const row = ensureRow(category);
    row.previousPaid += paid;
    row.previousRemaining += remaining;
    row.previousTotal += paid + remaining;
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
  totalPaid,
  totalRemaining,
  totalMonth,
  previousPaid,
  previousRemaining,
  previousMonthTotal,
}: {
  totalPaid: number;
  totalRemaining: number;
  totalMonth: number;
  previousPaid: number;
  previousRemaining: number;
  previousMonthTotal: number;
}) {
  const paidChangeClass = getChangeClass(totalPaid, previousPaid);
  const plannedChangeClass = getChangeClass(totalMonth, previousMonthTotal);

  return (
    <div className="pxp-dashboard-summary">
      <SummaryCard
        label="Cheltuit"
        value={`${formatLei(totalPaid)} lei`}
        helper={getShortChangeLabel(totalPaid, previousPaid)}
        tone={
          paidChangeClass === "is-up"
            ? "up"
            : paidChangeClass === "is-down"
              ? "down"
              : "flat"
        }
      />

      <SummaryCard
        label="Ramas"
        value={`${formatLei(totalRemaining)} lei`}
        helper={`Luna trecuta: ${formatLei(previousRemaining)} lei`}
      />

      <SummaryCard
        label="Total luna"
        value={`${formatLei(totalMonth)} lei`}
        helper={getShortChangeLabel(totalMonth, previousMonthTotal)}
        tone={
          plannedChangeClass === "is-up"
            ? "up"
            : plannedChangeClass === "is-down"
              ? "down"
              : "flat"
        }
      />
    </div>
  );
}

function ChartView({
  rows,
  totalMonth,
  totalPaid,
  totalRemaining,
  previousPaid,
}: {
  rows: CategoryRow[];
  totalMonth: number;
  totalPaid: number;
  totalRemaining: number;
  previousPaid: number;
}) {
  const paidChangeClass = getChangeClass(totalPaid, previousPaid);

  return (
    <>
      <div className="pxp-dashboard-chart-panel">
        <div
          className="pxp-dashboard-donut"
          style={{ background: buildDonutGradient(rows, totalMonth) }}
        >
          <div className="pxp-dashboard-donut-inner">
            <span>Total</span>
            <strong>{formatLei(totalMonth)}</strong>
            <small>lei</small>
          </div>
        </div>

        <div className="pxp-dashboard-chart-side">
          <div className="pxp-dashboard-chart-mini">
            <div>
              <span>Platit</span>
              <strong>{formatLei(totalPaid)} lei</strong>
            </div>

            <div>
              <span>Ramas</span>
              <strong>{formatLei(totalRemaining)} lei</strong>
            </div>
          </div>

          <div className={`pxp-category-change ${paidChangeClass}`}>
            {getChangeLabel(totalPaid, previousPaid)}
          </div>

          <div className="pxp-dashboard-chart-legend">
            {rows.map((row, index) => {
              const percent = getPercent(row.total, totalMonth);
              const color = CHART_COLORS[index % CHART_COLORS.length];

              return (
                <div key={row.category} className="pxp-chart-legend-row">
                  <i style={{ background: color }} />
                  <span>{row.category}</span>
                  <b>{percent}%</b>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function ListView({
  rows,
  totalMonth,
}: {
  rows: CategoryRow[];
  totalMonth: number;
}) {
  return (
    <div className="pxp-category-list">
      {rows.map((row) => {
        const percent = getPercent(row.total, totalMonth);
        const changeClass = getChangeClass(row.paid, row.previousPaid);

        return (
          <div key={row.category} className="pxp-category-row">
            <div className="pxp-category-top">
              <div>
                <div className="pxp-category-name">{row.category}</div>
                <div className="pxp-category-meta">
                  {row.count} {row.count === 1 ? "intrare" : "intrari"} •{" "}
                  {percent}% din luna
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

            <div className={`pxp-category-change ${changeClass}`}>
              {getChangeLabel(row.paid, row.previousPaid)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopItems({ items }: { items: CalendarItem[] }) {
  const topItems = [...items]
    .sort((a, b) => {
      const aValue = getPaidAmount(a) + getRemainingAmount(a);
      const bValue = getPaidAmount(b) + getRemainingAmount(b);
      return bValue - aValue;
    })
    .slice(0, 5);

  if (topItems.length === 0) return null;

  return (
    <div className="pxp-dashboard-top-list">
      <div className="pxp-dashboard-view-row">
        <div>
          <div className="pxp-dashboard-kicker">Top luna</div>
          <h3 className="pxp-dashboard-subtitle">Cele mai mari intrari</h3>
        </div>
      </div>

      <div className="pxp-dashboard-top-items">
        {topItems.map((item) => {
          const value = getPaidAmount(item) + getRemainingAmount(item);

          return (
            <div key={item.id} className="pxp-dashboard-top-item">
              <div>
                <strong>{item.title}</strong>
                <span>{item.category || "Fara categorie"}</span>
              </div>

              <b>{formatLei(value)} lei</b>
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
  viewMode,
}: Props) {
  const moneyItems = currentItems.filter(isMoneyItem);
  const previousMoneyItems = previousItems.filter(isMoneyItem);
  const rows = buildRows(currentItems, previousItems);

  const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0);
  const totalRemaining = rows.reduce((sum, row) => sum + row.remaining, 0);
  const totalMonth = totalPaid + totalRemaining;

  const previousPaid = rows.reduce((sum, row) => sum + row.previousPaid, 0);
  const previousRemaining = rows.reduce(
    (sum, row) => sum + row.previousRemaining,
    0,
  );
  const previousMonthTotal = previousPaid + previousRemaining;

  if (moneyItems.length === 0 && previousMoneyItems.length === 0) {
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
            {viewMode === "chart" ? "Grafic cheltuieli" : "Lista cheltuieli"}
          </h2>
        </div>

        <div className="pxp-dashboard-count">
          {moneyItems.length} {moneyItems.length === 1 ? "plata" : "plati"}
        </div>
      </div>

      <DashboardSummary
        totalPaid={totalPaid}
        totalRemaining={totalRemaining}
        totalMonth={totalMonth}
        previousPaid={previousPaid}
        previousRemaining={previousRemaining}
        previousMonthTotal={previousMonthTotal}
      />

      {viewMode === "chart" ? (
        <ChartView
          rows={rows}
          totalMonth={totalMonth}
          totalPaid={totalPaid}
          totalRemaining={totalRemaining}
          previousPaid={previousPaid}
        />
      ) : (
        <>
          <ListView rows={rows} totalMonth={totalMonth} />
          <TopItems items={moneyItems} />
        </>
      )}
    </section>
  );
}
