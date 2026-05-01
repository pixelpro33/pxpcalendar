import AppNavigation, { AppSection } from "./AppNavigation";
import { MONTHS } from "./mockData";
import { ViewMode } from "./types";

export default function CalendarHeader({
  version,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  viewMode,
  setViewMode,
  years,
  activeSection,
  setActiveSection,
}: {
  version: string;
  selectedYear: number;
  setSelectedYear: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (value: number) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  years: number[];
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
}) {
  return (
    <header className="pxp-header">
      <div className="pxp-header-title-row">
        <div>
          <div className="pxp-title">pxpcalendar</div>
          <div className="pxp-subtitle">iOS dark UI preview · v{version}</div>
        </div>

        <div className="pxp-header-menu-slot">
          <AppNavigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            variant="mobile"
          />
        </div>
      </div>

      <div className="pxp-header-top">
        <div className="pxp-header-spacer" />

        <div className="pxp-header-actions">
          <select
            className="pxp-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <div className="pxp-segment" aria-label="View mode">
            <button
              className={`pxp-segment-button ${
                viewMode === "grid" ? "is-active" : ""
              }`}
              onClick={() => setViewMode("grid")}
              type="button"
            >
              Grid
            </button>

            <button
              className={`pxp-segment-button ${
                viewMode === "list" ? "is-active" : ""
              }`}
              onClick={() => setViewMode("list")}
              type="button"
            >
              List
            </button>
          </div>
        </div>
      </div>

      <nav className="pxp-months" aria-label="Months">
        {MONTHS.map((month, index) => (
          <button
            key={month}
            className={`pxp-pill ${index === selectedMonth ? "is-active" : ""}`}
            onClick={() => setSelectedMonth(index)}
            type="button"
          >
            {month}
          </button>
        ))}
      </nav>
    </header>
  );
}
