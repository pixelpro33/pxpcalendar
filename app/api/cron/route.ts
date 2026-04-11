import { sql } from "@/lib/db";

export async function GET() {
  try {
    // calculam MAINE
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const dateStr = tomorrow.toISOString().split("T")[0];

    // luam evenimentele de maine
    const { rows } = await sql`
      SELECT * FROM events WHERE event_date = ${dateStr}
    `;

    if (rows.length === 0) {
      return Response.json({ message: "no events" });
    }

    // format mesaj
    const list = rows.map((e) => `• ${e.title}`).join("\n");

    const message = `Ai evenimente maine:\n${list}`;

    // trimitem WhatsApp
    await fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.WHATSAPP_TO,
        type: "text",
        text: { body: message },
      }),
    });

    return Response.json({ sent: true });
  } catch (e) {
    return Response.json({ error: true });
  }
}