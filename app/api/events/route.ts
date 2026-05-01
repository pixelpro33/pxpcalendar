import { db } from "@/lib/db";

type EventRow = {
  id: string | number;
  title: string;
  event_at: string | Date;
  created_at: string | Date;
};

function normalizeEvent(row: EventRow) {
  return {
    id: String(row.id),
    title: row.title,
    event_at: row.event_at,
    created_at: row.created_at,
  };
}

export async function GET() {
  try {
    const result = await db.query<EventRow>(
      "SELECT id, title, event_at, created_at FROM events ORDER BY event_at ASC, created_at DESC",
    );

    return Response.json(result.rows.map(normalizeEvent));
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut incarca evenimentele.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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
        { status: 400 },
      );
    }

    const result = await db.query<EventRow>(
      `
        INSERT INTO events (title, event_at)
        VALUES ($1, $2)
        RETURNING id, title, event_at, created_at
      `,
      [title, eventAt],
    );

    return Response.json({
      success: true,
      event: normalizeEvent(result.rows[0]),
    });
  } catch (error) {
    console.error("POST EVENTS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut salva evenimentul.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = String(url.searchParams.get("id") || "").trim();

    if (!id) {
      const body = await req.json().catch(() => null);
      id = String(body?.id || "").trim();
    }

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 },
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
      { status: 500 },
    );
  }
}
