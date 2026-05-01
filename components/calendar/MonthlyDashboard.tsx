"use client";

import { useMemo, useState } from "react";
import { CalendarItem } from "./types";

type DashboardViewMode = "cards" | "list";

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
};

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

export default function MonthlyDashboard({
  currentItems,
  previousItems,
}: Props) {
  const [viewMode, setViewMode] = useState<DashboardViewMode>("cards");

  const moneyItems = currentItems.filter(isMoneyItem);
  const previousMoneyItems = previousItems.filter(isMoneyItem);

  const rows = useMemo(
    () => buildRows(currentItems, previousItems),
    [currentItems, previousItems],
  );

  const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0);
  const totalRemaining = rows.reduce((sum, row) => sum + row.remaining, 0);
  const totalMonth = totalPaid + totalRemaining;

  const previousPaid = rows.reduce((sum, row) => sum + row.previousPaid, 0);
  const previousRemaining = rows.reduce(
    (sum, row) => sum + row.previousRemaining,
    0,
  );
  const previousMonthTotal = previousPaid + previousRemaining;

  const paidChangeClass = getChangeClass(totalPaid, previousPaid);
  const plannedChangeClass = getChangeClass(totalMonth, previousMonthTotal);

  const topItems = [...moneyItems]
    .sort((a, b) => {
      const aValue = getPaidAmount(a) + getRemainingAmount(a);
      const bValue = getPaidAmount(b) + getRemainingAmount(b);
      return bValue - aValue;
    })
    .slice(0, 5);

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
          <h2 className="pxp-dashboard-title">Rezumat financiar</h2>
        </div>

        <div className="pxp-dashboard-count">
          {moneyItems.length} {moneyItems.length === 1 ? "plata" : "plati"}
        </div>
      </div>

      <div className="pxp-dashboard-summary">
        <SummaryCard
          label="Cheltuit"
          value={`${formatLei(totalPaid)} lei`}
          helper={getChangeLabel(totalPaid, previousPaid)}
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
          label="Total planificat"
          value={`${formatLei(totalMonth)} lei`}
          helper={getChangeLabel(totalMonth, previousMonthTotal)}
          tone={
            plannedChangeClass === "is-up"
              ? "up"
              : plannedChangeClass === "is-down"
                ? "down"
                : "flat"
          }
        />
      </div>

      <div className="pxp-dashboard-comparison">
        <div>
          <span>Luna curenta</span>
          <strong>{formatLei(totalPaid)} lei cheltuiti</strong>
        </div>

        <div>
          <span>Luna trecuta</span>
          <strong>{formatLei(previousPaid)} lei cheltuiti</strong>
        </div>

        <div className={paidChangeClass}>
          <span>Diferenta</span>
          <strong>{getChangeLabel(totalPaid, previousPaid)}</strong>
        </div>
      </div>

      <div className="pxp-dashboard-view-row">
        <div>
          <div className="pxp-dashboard-kicker">Categorii</div>
          <h3 className="pxp-dashboard-subtitle">Distribuire cheltuieli</h3>
        </div>

        <div className="pxp-dashboard-view-switch">
          <button
            type="button"
            className={viewMode === "cards" ? "is-active" : ""}
            onClick={() => setViewMode("cards")}
          >
            Carduri
          </button>

          <button
            type="button"
            className={viewMode === "list" ? "is-active" : ""}
            onClick={() => setViewMode("list")}
          >
            Lista
          </button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="pxp-dashboard-category-cards">
          {rows.map((row) => {
            const percent = getPercent(row.total, totalMonth);
            const paidPercent = getPercent(row.paid, row.total);
            const changeClass = getChangeClass(row.paid, row.previousPaid);

            return (
              <article
                key={row.category}
                className="pxp-dashboard-category-card"
              >
                <div className="pxp-category-card-top">
                  <div>
                    <div className="pxp-category-name">{row.category}</div>
                    <div className="pxp-category-meta">
                      {row.count} {row.count === 1 ? "intrare" : "intrari"} •{" "}
                      {percent}% din luna
                    </div>
                  </div>

                  <div className="pxp-category-percent">{percent}%</div>
                </div>

                <div className="pxp-category-card-total">
                  {formatLei(row.total)} lei
                </div>

                <div className="pxp-category-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>

                <div className="pxp-category-split">
                  <span>Platit: {formatLei(row.paid)} lei</span>
                  <span>{paidPercent}% platit</span>
                </div>

                <div className={`pxp-category-change ${changeClass}`}>
                  {getChangeLabel(row.paid, row.previousPaid)}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
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
      )}

      {topItems.length > 0 && (
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
      )}
    </section>
  );
}
