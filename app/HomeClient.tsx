"use client";

import { useEffect, useState } from "react";

type Props = {
  version: string;
};

export default function HomeClient({ version }: Props) {
  const [events, setEvents] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  function addEvent() {
    const value = input.trim();
    if (!value) return;
    setEvents((prev) => [...prev, value]);
    setInput("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        padding: "20px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 12,
          marginBottom: 20,
          fontSize: 13,
          opacity: 0.85,
        }}
      >
        Versiune: <b>{version}</b>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: 600 }}>
        pxpcalendar 📅
      </h1>

      <p style={{ opacity: 0.6 }}>Dashboard</p>

      <div style={{ marginTop: 30 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Adauga eveniment..."
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            width: "70%",
            marginRight: 10,
          }}
        />

        <button
          onClick={addEvent}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#4f46e5",
            color: "white",
            border: "none",
          }}
        >
          Adauga
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
            }}
          >
            📅 {event}
          </div>
        ))}
      </div>
    </main>
  );
}