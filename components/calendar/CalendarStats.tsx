export default function CalendarStats({
  paid,
  remaining,
}: {
  paid: number;
  remaining: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            opacity: 0.55,
            marginBottom: 8,
          }}
        >
          Platit deja
        </div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{paid} lei</div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            opacity: 0.55,
            marginBottom: 8,
          }}
        >
          Mai ai de platit
        </div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{remaining} lei</div>
      </div>
    </div>
  );
}