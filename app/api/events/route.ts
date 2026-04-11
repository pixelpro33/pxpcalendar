import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      "SELECT id, title, event_date, created_at FROM events ORDER BY event_date ASC, created_at DESC"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    return Response.json({ error: true }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const date = String(body.date || "").trim();

    if (!title || !date) {
      return Response.json(
        { error: "Missing title or date" },
        { status: 400 }
      );
    }

    await db.query(
      "INSERT INTO events (title, event_date) VALUES ($1, $2)",
      [title, date]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST EVENTS ERROR:", error);
    return Response.json({ error: true }, { status: 500 });
  }
}