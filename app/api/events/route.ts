import { db } from "@/lib/db";

type EventRow = {
  id: string | number;
  title: string;
  details: string | null;
  type: string | null;
  event_at: string | Date;
  all_day: boolean | null;
  status: string | null;
  amount: string | number | null;
  actual_amount: string | number | null;
  payment_status: string | null;
  address: string | null;
  custom_color: string | null;
  repeat_type: string | null;
  repeat_interval: number | null;
  repeat_unit: string | null;
  custom_repeat_config: unknown;
  completed_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date | null;
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeEvent(row: EventRow) {
  return {
    id: String(row.id),
    title: row.title,
    details: row.details || "",
    type: row.type || "event",
    event_at: row.event_at,
    all_day: Boolean(row.all_day),
    status: row.status || "pending",
    amount: toNumber(row.amount),
    actual_amount: toNumber(row.actual_amount),
    payment_status: row.payment_status || "none",
    address: row.address || "",
    custom_color: row.custom_color || "",
    repeat_type: row.repeat_type || "none",
    repeat_interval: row.repeat_interval,
    repeat_unit: row.repeat_unit,
    custom_repeat_config: row.custom_repeat_config,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function getPaymentStatus(type: string, amount: number | null, status: string) {
  if (type === "pay") {
    return status === "completed" ? "paid" : "unpaid";
  }

  if (type === "event" && amount !== null) {
    return status === "completed" ? "paid" : "unpaid";
  }

  return "none";
}

export async function GET() {
  try {
    const result = await db.query<EventRow>(`
      SELECT
        id,
        title,
        details,
        type,
        event_at,
        all_day,
        status,
        amount,
        actual_amount,
        payment_status,
        address,
        custom_color,
        repeat_type,
        repeat_interval,
        repeat_unit,
        custom_repeat_config,
        completed_at,
        created_at,
        updated_at
      FROM events
      ORDER BY event_at ASC, created_at DESC
    `);

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
    const details = String(body.details || "").trim();
    const type = String(body.type || "event").trim();
    const eventAt = String(body.eventAt || "").trim();
    const allDay = Boolean(body.allDay);
    const amount = toNumber(body.amount);
    const address = String(body.address || "").trim();
    const customColor = String(body.customColor || "").trim();
    const repeatType = String(body.repeatType || "none").trim();
    const customRepeatConfig =
      repeatType === "custom" ? body.customRepeatConfig || null : null;

    const repeatInterval =
      repeatType === "custom" ? toNumber(body.repeatInterval) || 1 : null;

    const repeatUnit =
      repeatType === "custom" ? String(body.repeatUnit || "week") : null;

    if (!title || !eventAt) {
      return Response.json(
        {
          error: true,
          message: "Titlul sau data/ora lipsesc.",
        },
        { status: 400 },
      );
    }

    const status = "pending";
    const paymentStatus = getPaymentStatus(type, amount, status);

    const result = await db.query<EventRow>(
      `
        INSERT INTO events (
          title,
          details,
          type,
          event_at,
          all_day,
          status,
          amount,
          actual_amount,
          payment_status,
          address,
          custom_color,
          repeat_type,
          repeat_interval,
          repeat_unit,
          custom_repeat_config
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING
          id,
          title,
          details,
          type,
          event_at,
          all_day,
          status,
          amount,
          actual_amount,
          payment_status,
          address,
          custom_color,
          repeat_type,
          repeat_interval,
          repeat_unit,
          custom_repeat_config,
          completed_at,
          created_at,
          updated_at
      `,
      [
        title,
        details || null,
        type,
        eventAt,
        allDay,
        status,
        amount,
        paymentStatus,
        address || null,
        customColor || null,
        repeatType,
        repeatInterval,
        repeatUnit,
        customRepeatConfig ? JSON.stringify(customRepeatConfig) : null,
      ],
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();
    const actualAmount = toNumber(body.actualAmount);

    if (!id || !["pending", "completed"].includes(status)) {
      return Response.json(
        {
          error: true,
          message: "Date invalide pentru actualizare.",
        },
        { status: 400 },
      );
    }

    const existing = await db.query<EventRow>(
      `
        SELECT
          id,
          title,
          details,
          type,
          event_at,
          all_day,
          status,
          amount,
          actual_amount,
          payment_status,
          address,
          custom_color,
          repeat_type,
          repeat_interval,
          repeat_unit,
          custom_repeat_config,
          completed_at,
          created_at,
          updated_at
        FROM events
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    if (existing.rowCount === 0) {
      return Response.json(
        {
          error: true,
          message: "Evenimentul nu exista.",
        },
        { status: 404 },
      );
    }

    const current = existing.rows[0];
    const type = current.type || "event";
    const amount = toNumber(current.amount);
    const nextPaymentStatus = getPaymentStatus(type, amount, status);

    const result = await db.query<EventRow>(
      `
        UPDATE events
        SET
          status = $2,
          actual_amount = CASE
            WHEN $2 = 'completed' AND $3::numeric IS NOT NULL THEN $3::numeric
            WHEN $2 = 'pending' THEN NULL
            ELSE actual_amount
          END,
          payment_status = $4,
          completed_at = CASE
            WHEN $2 = 'completed' THEN COALESCE(completed_at, NOW())
            ELSE NULL
          END
        WHERE id = $1
        RETURNING
          id,
          title,
          details,
          type,
          event_at,
          all_day,
          status,
          amount,
          actual_amount,
          payment_status,
          address,
          custom_color,
          repeat_type,
          repeat_interval,
          repeat_unit,
          custom_repeat_config,
          completed_at,
          created_at,
          updated_at
      `,
      [id, status, actualAmount, nextPaymentStatus],
    );

    return Response.json({
      success: true,
      event: normalizeEvent(result.rows[0]),
    });
  } catch (error) {
    console.error("PATCH EVENT ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut actualiza evenimentul.",
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
