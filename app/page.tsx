"use client";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "white",
      padding: "20px",
      fontFamily: "system-ui"
    }}>
      
      <h1 style={{ fontSize: "28px", fontWeight: "600" }}>
        pxpcalendar 📅
      </h1>

      <p style={{ opacity: 0.6, marginTop: 4 }}>
        Dashboard
      </p>

      <div style={{ marginTop: 30 }}>
        
        <div style={{
          background: "#111",
          padding: 20,
          borderRadius: 16,
          marginBottom: 15
        }}>
          💸 Bani disponibili: <b>0 lei</b>
        </div>

        <div style={{
          background: "#111",
          padding: 20,
          borderRadius: 16,
          marginBottom: 15
        }}>
          📅 Evenimente: <b>0</b>
        </div>

        <div style={{
          background: "#111",
          padding: 20,
          borderRadius: 16
        }}>
          🔔 Notificări: OFF
        </div>

      </div>

    </main>
  );
}