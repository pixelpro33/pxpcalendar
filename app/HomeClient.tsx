"use client";

import { useEffect, useState } from "react";

type EventItem = {
  title: string;
  date: string;
};

type Props = {
  version: string;
};

export default function HomeClient({ version }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  async function sendWhatsApp() {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ? JSON.stringify(data.error) : "WhatsApp send failed");
    }

    return data;
  }

  async function addEvent() {
    if (!title.trim() || !date) return;

    const newEvent = {
      title: title.trim(),
      date,
    };

    setEvents((prev) => [...prev, newEvent]);
    setTitle("");
    setDate("");

    try {
      setSending(true);
      await sendWhatsApp();
      alert("Eveniment adaugat si mesajul WhatsApp a fost trimis.");
    } catch (error) {
      console.error(error);
      alert("Evenimentul a fost adaugat, dar mesajul WhatsApp nu a fost trimis.");
    } finally {
      setSending(false);
    }
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
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

      <p style={{ opacity: 0.6, marginTop: 0 }}>Evenimente + WhatsApp</p>

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
          type="datetime-local"
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
          disabled={sending}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#25D366",
            color: "white",
            border: "none",
            width: "100%",
            opacity: sending ? 0.7 : 1,
            cursor: sending ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {sending ? "Se trimite..." : "Adauga + WhatsApp"}
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        {events.length === 0 && (
          <p style={{ opacity: 0.5 }}>Nu ai evenimente</p>
        )}

        {events.map((event, index) => (
          <div
            key={index}
            style={{
              background: "#111",
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{event.title}</div>
              <div style={{ opacity: 0.6, fontSize: 13 }}>
                {new Date(event.date).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => removeEvent(index)}
              style={{
                background: "#dc2626",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}