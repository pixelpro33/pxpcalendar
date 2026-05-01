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
        <div className="pxp-stat-value">{paid} lei</div>

        <div className="pxp-stat-side">
          <span className="pxp-stat-icon">✅</span>
          <span className="pxp-stat-label">Platit</span>
        </div>
      </div>

      <div className="pxp-stat-card">
        <div className="pxp-stat-value">{remaining} lei</div>

        <div className="pxp-stat-side">
          <span className="pxp-stat-icon">⏳</span>
          <span className="pxp-stat-label">Ramas</span>
        </div>
      </div>
    </section>
  );
}
