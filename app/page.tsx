"use client";

import { useState } from "react";

export default function Home() {
  const [events, setEvents] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function addEvent() {
    if (!input) return;
    setEvents([...events, input]);
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
      <h1 style={{ fontSize: "28px", fontWeight: 600 }}>
        pxpcalendar 📅
      </h1>

      <p style={{ opacity: 0.6 }}>Dashboard</p>

      {/* INPUT */}
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

      {/* LISTA */}
      <div style={{ marginTop: 30 }}>
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