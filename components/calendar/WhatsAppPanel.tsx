"use client";

import { useEffect, useState } from "react";

type WhatsAppSettings = {
  enabled: boolean;
  timezone: string;
  sendAt: string;
  sendEmptyMessage: boolean;
  includeTasks: boolean;
  includeEvents: boolean;
  includePayments: boolean;
  includeBirthdays: boolean;
  includeOnlyPending: boolean;
  includeLocation: boolean;
  includeAmounts: boolean;
  birthdayReminderDays: number[];
  messageTitle: string;
  tomorrowLabel: string;
  emptyMessage: string;
  testPrefix: string;
};

type PreviewData = {
  message: string;
  hasItems: boolean;
  tomorrow: string;
  today: string;
  counts: {
    total: number;
    tasks: number;
    events: number;
    payments: number;
    birthdays: number;
  };
};

const DEFAULT_SETTINGS: WhatsAppSettings = {
  enabled: true,
  timezone: "Europe/Bucharest",
  sendAt: "22:00",
  sendEmptyMessage: false,
  includeTasks: true,
  includeEvents: true,
  includePayments: true,
  includeBirthdays: true,
  includeOnlyPending: true,
  includeLocation: true,
  includeAmounts: true,
  birthdayReminderDays: [7, 5, 3, 1],
  messageTitle: "PXP Calendar",
  tomorrowLabel: "Ai evenimente maine",
  emptyMessage: "Nu ai evenimente pentru maine.",
  testPrefix: "TEST",
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="pxp-wa-toggle-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        className={`pxp-toggle ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className="pxp-toggle-dot" />
      </button>
    </div>
  );
}

export default function WhatsAppPanel() {
  const [settings, setSettings] = useState<WhatsAppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/settings/whatsapp", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Nu am putut incarca setarile.");
        }

        if (!cancelled) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Nu am putut incarca setarile.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof WhatsAppSettings>(
    key: K,
    value: WhatsAppSettings[K],
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateBirthdayDays(value: string) {
    const days = value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item) && item > 0);

    update("birthdayReminderDays", days);
  }

  async function saveSettings() {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/settings/whatsapp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut salva setarile.");
      }

      setSettings(data.settings);
      setSuccess("Setarile WhatsApp au fost salvate.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nu am putut salva setarile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function buildPreview() {
    try {
      setIsPreviewing(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          send: false,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut genera preview.");
      }

      setPreview(data);
      setPreviewOpen(true);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Nu am putut genera preview.",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function sendTest() {
    try {
      setIsSending(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          send: true,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Nu am putut trimite testul.");
      }

      setPreview(data);
      setPreviewOpen(true);
      setSuccess("Mesajul de test a fost trimis pe WhatsApp.");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Nu am putut trimite testul.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="pxp-settings">
      <div className="pxp-settings-head">
        <div>
          <div className="pxp-dashboard-kicker">WhatsApp</div>
          <h2 className="pxp-dashboard-title">Reminder automat</h2>
        </div>
      </div>

      {isLoading && (
        <div className="pxp-inline-state">Se incarca setarile...</div>
      )}
      {error && <div className="pxp-inline-error">{error}</div>}
      {success && <div className="pxp-inline-state">{success}</div>}

      <div className="pxp-wa-grid">
        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <h3>Control general</h3>
            <p>
              Cron-ul Vercel ruleaza la 19:00 UTC, aproximativ 22:00 Romania.
              Setarea de ora ramane pentru referinta si pentru viitor.
            </p>
          </div>

          <div className="pxp-wa-form">
            <ToggleRow
              label="WhatsApp activ"
              description="Daca este dezactivat, cron-ul nu trimite mesaje."
              checked={settings.enabled}
              onChange={(value) => update("enabled", value)}
            />

            <ToggleRow
              label="Trimite mesaj gol"
              description="Trimite mesaj chiar daca nu exista evenimente."
              checked={settings.sendEmptyMessage}
              onChange={(value) => update("sendEmptyMessage", value)}
            />

            <ToggleRow
              label="Doar pending"
              description="Exclude evenimentele completed."
              checked={settings.includeOnlyPending}
              onChange={(value) => update("includeOnlyPending", value)}
            />

            <div className="pxp-field-card">
              <div className="pxp-field-title">Ora reminder</div>
              <input
                className="pxp-input"
                type="time"
                value={settings.sendAt}
                onChange={(event) => update("sendAt", event.target.value)}
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Timezone</div>
              <input
                className="pxp-input"
                value={settings.timezone}
                onChange={(event) => update("timezone", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <h3>Ce intra in mesaj</h3>
            <p>Alegi exact ce tipuri de date apar in reminder.</p>
          </div>

          <div className="pxp-wa-form">
            <ToggleRow
              label="Taskuri"
              description="Include taskurile de maine."
              checked={settings.includeTasks}
              onChange={(value) => update("includeTasks", value)}
            />

            <ToggleRow
              label="Evenimente"
              description="Include evenimentele de maine."
              checked={settings.includeEvents}
              onChange={(value) => update("includeEvents", value)}
            />

            <ToggleRow
              label="Plati"
              description="Include platile si sumele."
              checked={settings.includePayments}
              onChange={(value) => update("includePayments", value)}
            />

            <ToggleRow
              label="Birthdays"
              description="Include reminder pentru zile de nastere."
              checked={settings.includeBirthdays}
              onChange={(value) => update("includeBirthdays", value)}
            />

            <ToggleRow
              label="Locatie"
              description="Include adresa sau link-ul de locatie."
              checked={settings.includeLocation}
              onChange={(value) => update("includeLocation", value)}
            />

            <ToggleRow
              label="Sume"
              description="Include valoarea in lei pentru plati/evenimente."
              checked={settings.includeAmounts}
              onChange={(value) => update("includeAmounts", value)}
            />
          </div>
        </div>

        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <h3>Text mesaj</h3>
            <p>Customizezi titlul si textele folosite in mesaj.</p>
          </div>

          <div className="pxp-wa-form">
            <div className="pxp-field-card">
              <div className="pxp-field-title">Titlu mesaj</div>
              <input
                className="pxp-input"
                value={settings.messageTitle}
                onChange={(event) => update("messageTitle", event.target.value)}
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Text evenimente maine</div>
              <input
                className="pxp-input"
                value={settings.tomorrowLabel}
                onChange={(event) =>
                  update("tomorrowLabel", event.target.value)
                }
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Mesaj fara evenimente</div>
              <input
                className="pxp-input"
                value={settings.emptyMessage}
                onChange={(event) => update("emptyMessage", event.target.value)}
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Prefix test</div>
              <input
                className="pxp-input"
                value={settings.testPrefix}
                onChange={(event) => update("testPrefix", event.target.value)}
              />
            </div>

            <div className="pxp-field-card">
              <div className="pxp-field-title">Birthday reminder days</div>
              <input
                className="pxp-input"
                value={settings.birthdayReminderDays.join(", ")}
                onChange={(event) => updateBirthdayDays(event.target.value)}
                placeholder="7, 5, 3, 1"
              />
            </div>
          </div>
        </div>

        <div className="pxp-settings-card">
          <div className="pxp-settings-card-head">
            <h3>Test & Preview</h3>
            <p>
              Preview-ul arata exact mesajul generat. Butonul de test trimite
              acelasi mesaj pe WhatsApp.
            </p>
          </div>

          <div className="pxp-wa-actions">
            <button
              className="pxp-settings-button primary"
              type="button"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Se salveaza..." : "Salveaza setari"}
            </button>

            <button
              className="pxp-settings-button"
              type="button"
              onClick={buildPreview}
              disabled={isPreviewing}
            >
              {isPreviewing ? "Se genereaza..." : "Preview mesaj"}
            </button>

            <button
              className="pxp-settings-button danger"
              type="button"
              onClick={sendTest}
              disabled={isSending}
            >
              {isSending ? "Se trimite..." : "Trimite test WhatsApp"}
            </button>
          </div>
        </div>
      </div>

      {previewOpen && preview && (
        <div
          className="pxp-wa-preview-overlay"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="pxp-wa-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pxp-wa-preview-head">
              <div>
                <div className="pxp-dashboard-kicker">Preview</div>
                <h3>Mesaj WhatsApp</h3>
              </div>

              <button
                type="button"
                className="pxp-mobile-menu-close"
                onClick={() => setPreviewOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="pxp-wa-preview-meta">
              <span>Total: {preview.counts.total}</span>
              <span>Taskuri: {preview.counts.tasks}</span>
              <span>Evenimente: {preview.counts.events}</span>
              <span>Plati: {preview.counts.payments}</span>
              <span>Birthdays: {preview.counts.birthdays}</span>
            </div>

            <pre className="pxp-wa-preview-text">{preview.message}</pre>

            <div className="pxp-wa-actions">
              <button
                className="pxp-settings-button danger"
                type="button"
                onClick={sendTest}
                disabled={isSending}
              >
                {isSending ? "Se trimite..." : "Trimite acest mesaj"}
              </button>

              <button
                className="pxp-settings-button"
                type="button"
                onClick={() => setPreviewOpen(false)}
              >
                Inchide
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
