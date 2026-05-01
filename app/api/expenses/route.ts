import { db } from "@/lib/db";

type ExpenseRow = {
  id: string | number;
  title: string;
  amount: string | number;
  category: string | null;
  expense_date: string | Date;
  expense_time: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string | Date;
  updated_at: string | Date | null;
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizeExpense(row: ExpenseRow) {
  return {
    id: String(row.id),
    title: row.title,
    amount: toNumber(row.amount),
    category: row.category || "",
    expenseDate: normalizeDate(row.expense_date),
    expenseTime: row.expense_time || "",
    paymentMethod: row.payment_method || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month"));

    let result;

    if (Number.isFinite(year) && Number.isFinite(month)) {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      result = await db.query<ExpenseRow>(
        `
          SELECT
            id,
            title,
            amount,
            category,
            expense_date,
            expense_time,
            payment_method,
            notes,
            created_at,
            updated_at
          FROM expenses
          WHERE expense_date >= $1::date
            AND expense_date < ($1::date + INTERVAL '1 month')
          ORDER BY expense_date DESC, expense_time DESC NULLS LAST, created_at DESC
        `,
        [startDate],
      );
    } else {
      result = await db.query<ExpenseRow>(`
        SELECT
          id,
          title,
          amount,
          category,
          expense_date,
          expense_time,
          payment_method,
          notes,
          created_at,
          updated_at
        FROM expenses
        ORDER BY expense_date DESC, expense_time DESC NULLS LAST, created_at DESC
        LIMIT 200
      `);
    }

    return Response.json(result.rows.map(normalizeExpense));
  } catch (error) {
    console.error("GET EXPENSES ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut incarca cheltuielile.",
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
    const amount = toNumber(body.amount);
    const category = String(body.category || "").trim();
    const expenseDate = String(body.expenseDate || "").trim();
    const expenseTime = String(body.expenseTime || "").trim();
    const paymentMethod = String(body.paymentMethod || "").trim();
    const notes = String(body.notes || "").trim();

    if (!title) {
      return Response.json(
        {
          error: true,
          message: "Titlul cheltuielii lipseste.",
        },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return Response.json(
        {
          error: true,
          message: "Suma trebuie sa fie mai mare decat 0.",
        },
        { status: 400 },
      );
    }

    if (!expenseDate) {
      return Response.json(
        {
          error: true,
          message: "Data cheltuielii lipseste.",
        },
        { status: 400 },
      );
    }

    const result = await db.query<ExpenseRow>(
      `
        INSERT INTO expenses (
          title,
          amount,
          category,
          expense_date,
          expense_time,
          payment_method,
          notes
        )
        VALUES ($1, $2, $3, $4, NULLIF($5, '')::time, $6, $7)
        RETURNING
          id,
          title,
          amount,
          category,
          expense_date,
          expense_time,
          payment_method,
          notes,
          created_at,
          updated_at
      `,
      [title, amount, category, expenseDate, expenseTime, paymentMethod, notes],
    );

    return Response.json({
      success: true,
      expense: normalizeExpense(result.rows[0]),
    });
  } catch (error) {
    console.error("POST EXPENSE ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut salva cheltuiala.",
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
    const title = String(body.title || "").trim();
    const amount = toNumber(body.amount);
    const category = String(body.category || "").trim();
    const expenseDate = String(body.expenseDate || "").trim();
    const expenseTime = String(body.expenseTime || "").trim();
    const paymentMethod = String(body.paymentMethod || "").trim();
    const notes = String(body.notes || "").trim();

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 },
      );
    }

    if (!title) {
      return Response.json(
        {
          error: true,
          message: "Titlul cheltuielii lipseste.",
        },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return Response.json(
        {
          error: true,
          message: "Suma trebuie sa fie mai mare decat 0.",
        },
        { status: 400 },
      );
    }

    if (!expenseDate) {
      return Response.json(
        {
          error: true,
          message: "Data cheltuielii lipseste.",
        },
        { status: 400 },
      );
    }

    const result = await db.query<ExpenseRow>(
      `
        UPDATE expenses
        SET
          title = $2,
          amount = $3,
          category = $4,
          expense_date = $5,
          expense_time = NULLIF($6, '')::time,
          payment_method = $7,
          notes = $8,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          title,
          amount,
          category,
          expense_date,
          expense_time,
          payment_method,
          notes,
          created_at,
          updated_at
      `,
      [
        id,
        title,
        amount,
        category,
        expenseDate,
        expenseTime,
        paymentMethod,
        notes,
      ],
    );

    if (result.rowCount === 0) {
      return Response.json(
        {
          error: true,
          message: "Cheltuiala nu exista.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      expense: normalizeExpense(result.rows[0]),
    });
  } catch (error) {
    console.error("PATCH EXPENSE ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut actualiza cheltuiala.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const id = String(body?.id || "").trim();

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 },
      );
    }

    const result = await db.query<ExpenseRow>(
      `
        DELETE FROM expenses
        WHERE id = $1
        RETURNING
          id,
          title,
          amount,
          category,
          expense_date,
          expense_time,
          payment_method,
          notes,
          created_at,
          updated_at
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return Response.json(
        {
          error: true,
          message: "Cheltuiala nu exista.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      expense: normalizeExpense(result.rows[0]),
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut sterge cheltuiala.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
