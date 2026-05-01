function formatLei(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CalendarStats({
  paid,
  remaining,
}: {
  paid: number;
  remaining: number;
}) {
  return (
    <section className="pxp-stats" aria-label="Payment summary">
      <div className="pxp-stat-card">
        <div className="pxp-stat-main">
          <strong>{formatLei(paid)} lei</strong>
        </div>

        <div className="pxp-stat-side">
          <span>✅</span>
          <small>Platit</small>
        </div>
      </div>

      <div className="pxp-stat-card">
        <div className="pxp-stat-main">
          <strong>{formatLei(remaining)} lei</strong>
        </div>

        <div className="pxp-stat-side">
          <span>⏳</span>
          <small>Ramas</small>
        </div>
      </div>
    </section>
  );
}
