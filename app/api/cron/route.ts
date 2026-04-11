import { sql } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const dateStr = tomorrow.toISOString().split("T")[0];

    const { rows } = await sql`
      SELECT * FROM events WHERE event_date = ${dateStr}
    `;

    if (rows.length === 0) {
      return Response.json({ message: "no events" });
    }

    const list = rows.map((e: any) => `• ${e.title}`).join("\n");
    const message = `Ai evenimente maine:\n${list}`;

    const response = await fetch(
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
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" },
          },
        }),
      }
    );

    const data = await response.json();

    return Response.json({
      sent: true,
      events: rows.length,
      whatsapp: data,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: true }, { status: 500 });
  }
}