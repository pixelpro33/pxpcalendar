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

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // NOTIFICATION
  function scheduleNotification(title: string, date: string) {
    if (Notification.permission !== "granted") return;

    const eventTime = new Date(date).getTime();
    const now = Date.now();
    const delay = eventTime - now;

    if (delay <= 0) return;

    setTimeout(() => {
      new Notification("Reminder 📅", {
        body: title,
      });
    }, delay);
  }

  function addEvent() {
    if (!title || !date) return;

    const newEvent = { title, date };

    setEvents((prev) => [...prev, newEvent]);

    scheduleNotification(title, date);

    setTitle("");
    setDate("");
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
      }}
    >
      {/* VERSION */}
      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: 10,
          marginBottom: 20,
          fontSize: 13,
          opacity: 0.8,
        }}
      >
        Versiune: <b>{version}</b>
      </div>

      <h1 style={{ fontSize: "28px", fontWeight: 600 }}>
        pxpcalendar 📅
      </h1>

      <p style={{ opacity: 0.6 }}>Evenimente</p>

      {/* NOTIFICATION BUTTON */}
      <button
        onClick={() => Notification.requestPermission()}
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          background: "#22c55e",
          border: "none",
          color: "white",
        }}
      >
        Activeaza notificari 🔔
      </button>

      {/* FORM */}
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
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#4f46e5",
            color: "white",
            border: "none",
            width: "100%",
          }}
        >
          Adauga eveniment
        </button>
      </div>

      {/* LISTA */}
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
                background: "red",
                border: "none",
                color: "white",
                padding: "6px 10px",
                borderRadius: 8,
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