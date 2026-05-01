import AppNavigation, { AppSection } from "./AppNavigation";
import { MONTHS } from "./mockData";
import { ViewMode } from "./types";
import { DashboardViewMode } from "./MonthlyDashboard";

export default function CalendarHeader({
  version: _version,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  viewMode,
  setViewMode,
  dashboardViewMode,
  setDashboardViewMode,
  years,
  activeSection,
  setActiveSection,
  onOpenAddMenu,
}: {
  version: string;
  selectedYear: number;
  setSelectedYear: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (value: number) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  dashboardViewMode: DashboardViewMode;
  setDashboardViewMode: (value: DashboardViewMode) => void;
  years: number[];
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  onOpenAddMenu: () => void;
}) {
  const showDateControls =
    activeSection === "calendar" || activeSection === "dashboard";

  return (
    <header className="pxp-header">
      <div className="pxp-header-title-row">
        <button
          type="button"
          className="pxp-header-action-button plus"
          onClick={onOpenAddMenu}
          aria-label="Open add menu"
        >
          +
        </button>

        <div className="pxp-header-menu-slot">
          <AppNavigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            variant="mobile"
          />
        </div>
      </div>

      {showDateControls && (
        <>
          <div className="pxp-header-top">
            <div className="pxp-header-spacer" />

            <div className="pxp-header-actions">
              <select
                className="pxp-select"
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(Number(event.target.value))
                }
                aria-label="Select year"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {activeSection === "calendar" && (
                <div className="pxp-segment" aria-label="Calendar view mode">
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
              )}

              {activeSection === "dashboard" && (
                <div className="pxp-segment" aria-label="Dashboard view mode">
                  <button
                    className={`pxp-segment-button ${
                      dashboardViewMode === "chart" ? "is-active" : ""
                    }`}
                    onClick={() => setDashboardViewMode("chart")}
                    type="button"
                  >
                    Chart
                  </button>

                  <button
                    className={`pxp-segment-button ${
                      dashboardViewMode === "list" ? "is-active" : ""
                    }`}
                    onClick={() => setDashboardViewMode("list")}
                    type="button"
                  >
                    List
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="pxp-months" aria-label="Months">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                className={`pxp-pill ${
                  index === selectedMonth ? "is-active" : ""
                }`}
                onClick={() => setSelectedMonth(index)}
                type="button"
              >
                {month}
              </button>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
