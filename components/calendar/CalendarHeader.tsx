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
}: {
  version: string;
  selectedYear: number;
  setSelectedYear: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (value: number) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  years: number[];
}) {
  return (
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: 1.2,
            }}
          >
            pxpcalendar
          </div>

          <div
            style={{
              opacity: 0.6,
              marginTop: 4,
              fontSize: 12,
              lineHeight: 1.2,
            }}
          >
            iOS dark UI preview · v{version}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 12,
              outline: "none",
              height: 32,
            }}
          >
            {years.map((year) => (
              <option key={year} value={year} style={{ color: "black" }}>
                {year}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 2,
              gap: 2,
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "6px 10px",
                background: viewMode === "grid" ? "#1d4ed8" : "transparent",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                lineHeight: 1.2,
                height: 28,
              }}
            >
              Grid
            </button>

            <button
              onClick={() => setViewMode("list")}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "6px 10px",
                background: viewMode === "list" ? "#1d4ed8" : "transparent",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                lineHeight: 1.2,
                height: 28,
              }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {MONTHS.map((month, index) => {
          const active = index === selectedMonth;

          return (
            <button
              key={month}
              onClick={() => setSelectedMonth(index)}
              style={{
                border: active
                  ? "1px solid rgba(96,165,250,0.6)"
                  : "1px solid rgba(255,255,255,0.09)",
                background: active
                  ? "rgba(59,130,246,0.22)"
                  : "rgba(255,255,255,0.04)",
                color: active ? "#dbeafe" : "rgba(255,255,255,0.88)",
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 600,
                minWidth: 56,
                fontSize: 12,
                lineHeight: 1.2,
                height: 30,
              }}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
}
