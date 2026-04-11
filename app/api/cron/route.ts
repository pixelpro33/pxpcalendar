import { db } from "@/lib/db";

function formatRomanianDateTime(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export async function GET() {
  try {
    const hasToken = !!process.env.WHATSAPP_TOKEN;
    const hasPhoneId = !!process.env.WHATSAPP_PHONE_ID;
    const hasTo = !!process.env.WHATSAPP_TO;

    if (!hasToken || !hasPhoneId || !hasTo) {
      return Response.json(
        {
          error: true,
          message: "Missing WhatsApp env vars",
          debug: {
            hasToken,
            hasPhoneId,
            hasTo,
          },
        },
        { status: 500 }
      );
    }

    const now = new Date();

    const bucharestNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
    );

    const tomorrowStart = new Date(bucharestNow);
    tomorrowStart.setDate(bucharestNow.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const result = await db.query(
      `
      SELECT id, title, event_at
      FROM events
      WHERE event_at >= $1
        AND event_at <= $2
      ORDER BY event_at ASC
      `,
      [tomorrowStart.toISOString(), tomorrowEnd.toISOString()]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return Response.json({ message: "no events tomorrow" });
    }

    const list = rows
      .map((event: { title: string; event_at: string }) => {
        return `• ${event.title} - ${formatRomanianDateTime(event.event_at)}`;
      })
      .join("\n");

    const message = `Ai evenimente maine:\n${list}`;

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: process.env.WHATSAPP_TO,
          type: "text",
          text: {
            body: message,
          },
        }),
      }
    );

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      return Response.json(
        {
          error: true,
          message: "WhatsApp send failed.",
          details: whatsappData,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      count: rows.length,
      message,
      whatsapp: whatsappData,
    });
  } catch (error) {
    console.error("CRON ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Cron failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}