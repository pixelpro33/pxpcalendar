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
    <div className="pxp-overlay is-small" onClick={onClose}>
      <section className="pxp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pxp-sheet-grabber" />

        <div className="pxp-sheet-content">
          <div className="pxp-modal-title">Choose color</div>

          <div className="pxp-colors-grid">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                className={`pxp-color-button ${value === color ? "is-active" : ""}`}
                onClick={() => setValue(color)}
                type="button"
                style={{ background: color }}
                aria-label={`Choose ${color}`}
              />
            ))}
          </div>

          <input
            className="pxp-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Custom HSL / HEX / RGBA"
          />

          <div
            className="pxp-color-preview-large"
            style={{ background: value || "rgba(255,255,255,0.05)" }}
          />

          <button
            className="pxp-action neutral"
            onClick={onClose}
            type="button"
            style={{ width: "100%", background: "var(--blue)" }}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
