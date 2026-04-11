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
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 12,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
            opacity: 0.55,
            marginBottom: 6,
            lineHeight: 1.2,
          }}
        >
          Platit deja
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {paid} lei
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 12,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
            opacity: 0.55,
            marginBottom: 6,
            lineHeight: 1.2,
          }}
        >
          Mai ai de platit
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {remaining} lei
        </div>
      </div>
    </div>
  );
}
