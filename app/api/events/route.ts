import { db } from "@/lib/db";

type OccurrenceRow = {
  event_id: string | number;
  occurrence_date: string | Date;
  status: string;
  payment_status: string;
  actual_amount: string | number | null;
  completed_at: string | Date | null;
};

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
  occurrences?: OccurrenceRow[];
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toDateOnly(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeOccurrence(row: OccurrenceRow) {
  const status = row.status || "pending";

  return {
    occurrence_date: toDateOnly(row.occurrence_date),
    status,
    completed: status === "completed",
    payment_status: row.payment_status || "none",
    actual_amount: toNumber(row.actual_amount),
    completed_at: row.completed_at,
  };
}

function normalizeEvent(row: EventRow) {
  const occurrences: Record<
    string,
    ReturnType<typeof normalizeOccurrence>
  > = {};

  (row.occurrences || []).forEach((occurrence) => {
    const normalized = normalizeOccurrence(occurrence);
    occurrences[normalized.occurrence_date] = normalized;
  });

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
    occurrences,
  };
}

function getPaymentStatus(
  type: string,
  amount: number | null,
  status: string,
  actualAmount: number | null = null,
) {
  if (type === "pay") {
    return status === "completed" ? "paid" : "unpaid";
  }

  if (type === "event" && (amount !== null || actualAmount !== null)) {
    return status === "completed" ? "paid" : "unpaid";
  }

  return "none";
}

const EVENT_SELECT = `
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
`;

export async function GET() {
  try {
    const eventsResult = await db.query<EventRow>(`
      ${EVENT_SELECT}
      ORDER BY event_at ASC, created_at DESC
    `);

    const ids = eventsResult.rows.map((row) => String(row.id));

    if (ids.length === 0) {
      return Response.json([]);
    }

    let occurrencesByEvent = new Map<string, OccurrenceRow[]>();

    try {
      const occurrencesResult = await db.query<OccurrenceRow>(
        `
          SELECT
            event_id,
            occurrence_date,
            status,
            payment_status,
            actual_amount,
            completed_at
          FROM event_occurrences
          WHERE event_id::text = ANY($1::text[])
          ORDER BY occurrence_date ASC
        `,
        [ids],
      );

      occurrencesResult.rows.forEach((occurrence) => {
        const eventId = String(occurrence.event_id);
        const list = occurrencesByEvent.get(eventId) || [];
        list.push(occurrence);
        occurrencesByEvent.set(eventId, list);
      });
    } catch (occurrenceError) {
      console.error("GET OCCURRENCES ERROR:", occurrenceError);
      occurrencesByEvent = new Map<string, OccurrenceRow[]>();
    }

    const rowsWithOccurrences = eventsResult.rows.map((row) => ({
      ...row,
      occurrences: occurrencesByEvent.get(String(row.id)) || [],
    }));

    return Response.json(rowsWithOccurrences.map(normalizeEvent));
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
      event: normalizeEvent({ ...result.rows[0], occurrences: [] }),
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
    const action = String(body.action || "status").trim();

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 },
      );
    }

    if (action === "update") {
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

      const current = await db.query<EventRow>(
        `
          ${EVENT_SELECT}
          WHERE id = $1
          LIMIT 1
        `,
        [id],
      );

      if (current.rowCount === 0) {
        return Response.json(
          {
            error: true,
            message: "Evenimentul nu exista.",
          },
          { status: 404 },
        );
      }

      const currentStatus = current.rows[0].status || "pending";
      const paymentStatus = getPaymentStatus(type, amount, currentStatus);

      const result = await db.query<EventRow>(
        `
          UPDATE events
          SET
            title = $2,
            details = $3,
            type = $4,
            event_at = $5,
            all_day = $6,
            amount = $7,
            payment_status = $8,
            address = $9,
            custom_color = $10,
            repeat_type = $11,
            repeat_interval = $12,
            repeat_unit = $13,
            custom_repeat_config = $14
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
        [
          id,
          title,
          details || null,
          type,
          eventAt,
          allDay,
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
        event: normalizeEvent({ ...result.rows[0], occurrences: [] }),
      });
    }

    const occurrenceDate = String(body.occurrenceDate || "").trim();
    const status = String(body.status || "").trim();
    const actualAmount = toNumber(body.actualAmount);

    if (!["pending", "completed"].includes(status)) {
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
        ${EVENT_SELECT}
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
    const nextPaymentStatus = getPaymentStatus(
      type,
      amount,
      status,
      actualAmount,
    );

    if (occurrenceDate) {
      const occurrenceResult = await db.query<OccurrenceRow>(
        `
          INSERT INTO event_occurrences (
            event_id,
            occurrence_date,
            status,
            payment_status,
            actual_amount,
            completed_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            CASE
              WHEN $3 = 'completed' AND $5::numeric IS NOT NULL THEN $5::numeric
              ELSE NULL
            END,
            CASE
              WHEN $3 = 'completed' THEN NOW()
              ELSE NULL
            END
          )
          ON CONFLICT (event_id, occurrence_date)
          DO UPDATE SET
            status = EXCLUDED.status,
            payment_status = EXCLUDED.payment_status,
            actual_amount = CASE
              WHEN EXCLUDED.status = 'completed' AND $5::numeric IS NOT NULL THEN $5::numeric
              WHEN EXCLUDED.status = 'pending' THEN NULL
              ELSE event_occurrences.actual_amount
            END,
            completed_at = CASE
              WHEN EXCLUDED.status = 'completed' THEN COALESCE(event_occurrences.completed_at, NOW())
              ELSE NULL
            END
          RETURNING
            event_id,
            occurrence_date,
            status,
            payment_status,
            actual_amount,
            completed_at
        `,
        [id, occurrenceDate, status, nextPaymentStatus, actualAmount],
      );

      return Response.json({
        success: true,
        occurrence: normalizeOccurrence(occurrenceResult.rows[0]),
      });
    }

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
      event: normalizeEvent({ ...result.rows[0], occurrences: [] }),
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
