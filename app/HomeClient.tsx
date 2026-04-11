"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  event_at: string;
  created_at?: string;
};

type Props = {
  version: string;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function HomeClient({ version }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  async function loadEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error("LOAD EVENTS RESPONSE:", data);
        setEvents([]);
      }
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);
      setEvents([]);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const tomorrowPreview = useMemo(() => {
    const now = new Date();
    const bucharestNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
    );

    const tomorrow = new Date(bucharestNow);
    tomorrow.setDate(bucharestNow.getDate() + 1);

    const tomorrowDate = formatShortDate(tomorrow.toISOString());

    return `Reminderul WhatsApp se trimite cu o zi inainte, seara, in jurul orei 22:00 pentru evenimentele din ${tomorrowDate}.`;
  }, []);

  async function addEvent() {
    if (!title.trim() || !eventAt) {
      alert("Completeaza titlul si data/ora.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("");

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          eventAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ADD EVENT RESPONSE:", data);
        alert(
          data?.details
            ? `${data.message}\n\n${data.details}`
            : data?.message || "Nu am putut salva evenimentul."
        );
        return;
      }

      setTitle("");
      setEventAt("");
      setStatusMessage(
        "Eveniment salvat. Vei primi mesaj WhatsApp cu o zi inainte, in jurul orei 22:00."
      );

      await loadEvents();
    } catch (error) {
      console.error("ADD EVENT ERROR:", error);
      alert("Nu am putut salva evenimentul.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm("Sigur vrei sa stergi acest eveniment?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setStatusMessage("");

      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("DELETE EVENT RESPONSE:", data);
        alert(
          data?.details
            ? `${data.message}\n\n${data.details}`
            : data?.message || "Nu am putut sterge evenimentul."
        );
        return;
      }

      setStatusMessage("Eveniment sters cu succes.");
      await loadEvents();
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);
      alert("Nu am putut sterge evenimentul.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(37,211,102,0.12), transparent 35%), #09090b",
        color: "white",
        padding: "18px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              pxpcalendar 📅
            </div>
            <div
              style={{
                opacity: 0.65,
                marginTop: 4,
                fontSize: 14,
              }}
            >
              Evenimente + reminder WhatsApp
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "10px 12px",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            Versiune: <b>{version}</b>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Reminder automat WhatsApp 🔔
          </div>
          <div style={{ opacity: 0.75, fontSize: 14 }}>
            {tomorrowPreview}
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              background: "rgba(37,211,102,0.12)",
              border: "1px solid rgba(37,211,102,0.35)",
              color: "white",
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {statusMessage}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 16,
            marginBottom: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              fontWeight: 650,
              marginBottom: 12,
              fontSize: 17,
            }}
          >
            Adauga eveniment
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titlu eveniment"
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              width: "100%",
              marginBottom: 10,
              outline: "none",
              fontSize: 15,
            }}
          />

          <input
            type="datetime-local"
            value={eventAt}
            onChange={(e) => setEventAt(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              width: "100%",
              marginBottom: 12,
              outline: "none",
              fontSize: 15,
            }}
          />

          <button
            onClick={addEvent}
            disabled={loading}
            style={{
              padding: 14,
              borderRadius: 14,
              background: "#25D366",
              color: "#08110b",
              border: "none",
              width: "100%",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {loading ? "Se salveaza..." : "Adauga eveniment"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 650, fontSize: 18 }}>
            Evenimentele tale
          </div>
          <div style={{ opacity: 0.6, fontSize: 14 }}>
            Total: <b>{events.length}</b>
          </div>
        </div>

        {events.length === 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 18,
              opacity: 0.7,
            }}
          >
            Nu ai evenimente momentan.
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 650,
                    fontSize: 16,
                    marginBottom: 6,
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{
                    opacity: 0.7,
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                >
                  {formatEventDate(event.event_at)}
                </div>
              </div>

              <button
                onClick={() => deleteEvent(event.id)}
                disabled={deletingId === event.id}
                style={{
                  background: "rgba(220,38,38,0.18)",
                  border: "1px solid rgba(220,38,38,0.35)",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: deletingId === event.id ? "not-allowed" : "pointer",
                  opacity: deletingId === event.id ? 0.6 : 1,
                  fontWeight: 600,
                  minWidth: 86,
                }}
              >
                {deletingId === event.id ? "Sterg..." : "Sterge"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}