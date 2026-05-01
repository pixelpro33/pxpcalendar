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
        <div className="pxp-stat-label">Platit deja</div>
        <div className="pxp-stat-value">{paid} lei</div>
      </div>

      <div className="pxp-stat-card">
        <div className="pxp-stat-label">Mai ai de platit</div>
        <div className="pxp-stat-value">{remaining} lei</div>
      </div>
    </section>
  );
}
