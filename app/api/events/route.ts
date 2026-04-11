import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query(
      "SELECT id, title, event_at, created_at FROM events ORDER BY event_at ASC, created_at DESC"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut incarca evenimentele.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = String(body.title || "").trim();
    const eventAt = String(body.eventAt || "").trim();

    if (!title || !eventAt) {
      return Response.json(
        {
          error: true,
          message: "Titlul sau data/ora lipsesc.",
        },
        { status: 400 }
      );
    }

    await db.query(
      "INSERT INTO events (title, event_at) VALUES ($1, $2)",
      [title, eventAt]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST EVENTS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut salva evenimentul.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM events WHERE id = $1", [id]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut sterge evenimentul.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}