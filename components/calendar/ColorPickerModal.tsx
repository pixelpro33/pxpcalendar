import { DEFAULT_COLORS } from "./mockData";

export default function ColorPickerModal({
  open,
  value,
  setValue,
  onClose,
}: {
  open: boolean;
  value: string;
  setValue: (value: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.56)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#101117",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 18,
          boxShadow: "0 -20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 5,
            borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 12px",
          }}
        />

        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>
          Choose color
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {DEFAULT_COLORS.map((color) => {
            const active = value === color;
            return (
              <button
                key={color}
                onClick={() => setValue(color)}
                style={{
                  height: 58,
                  borderRadius: 16,
                  border: active
                    ? "2px solid rgba(255,255,255,0.9)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: color,
                  cursor: "pointer",
                }}
              />
            );
          })}
        </div>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Custom HSL / HEX / RGBA"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            color: "white",
            padding: 14,
            fontSize: 15,
            outline: "none",
            marginBottom: 12,
          }}
        />

        <div
          style={{
            height: 56,
            borderRadius: 16,
            background: value || "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        />

        <button
          onClick={onClose}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 14,
            padding: "14px 16px",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}