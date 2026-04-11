"use client";

import { useEffect, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  created_at?: string;
};

type Props = {
  version: string;
};

export default function HomeClient({ version }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
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

  async function addEvent() {
    if (!title.trim() || !date) return;

    try {
      setLoading(true);

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          date,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add event");
      }

      setTitle("");
      setDate("");
      await loadEvents();
    } catch (error) {
      console.error("ADD EVENT ERROR:", error);
      alert("Nu am putut salva evenimentul.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        padding: "20px",
        fontFamily: "system-ui",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: 10,
          marginBottom: 20,
          fontSize: 13,
          opacity: 0.85,
        }}
      >
        Versiune: <b>{version}</b>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: 4 }}>
        pxpcalendar 📅
      </h1>

      <p style={{ opacity: 0.6, marginTop: 0 }}>
        Evenimente + reminder WhatsApp
      </p>

      <div style={{ marginTop: 20 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titlu eveniment"
          style={{
            padding: 10,
            borderRadius: 10,
            border: "none",
            width: "100%",
            marginBottom: 10,
          }}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "none",
            width: "100%",
            marginBottom: 10,
          }}
        />

        <button
          onClick={addEvent}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#25D366",
            color: "white",
            border: "none",
            width: "100%",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Se salveaza..." : "Adauga eveniment"}
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        {events.length === 0 && (
          <p style={{ opacity: 0.5 }}>Nu ai evenimente</p>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            style={{
              background: "#111",
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 500 }}>{event.title}</div>
            <div style={{ opacity: 0.6, fontSize: 13 }}>
              {event.event_date}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}