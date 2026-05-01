import { db } from "@/lib/db";

type IncomeRow = {
  id: string | number;
  title: string;
  amount: string | number;
  category: string | null;
  income_date: string | Date;
  income_time: string | null;
  source: string | null;
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
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function normalizeIncome(row: IncomeRow) {
  return {
    id: String(row.id),
    title: row.title,
    amount: toNumber(row.amount),
    category: row.category || "",
    incomeDate: normalizeDate(row.income_date),
    incomeTime: row.income_time || "",
    source: row.source || "",
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
      result = await db.query<IncomeRow>(
        `SELECT id,title,amount,category,income_date,income_time,source,notes,created_at,updated_at
         FROM income
         WHERE income_date >= $1::date AND income_date < ($1::date + INTERVAL '1 month')
         ORDER BY income_date DESC, income_time DESC NULLS LAST, created_at DESC`,
        [startDate],
      );
    } else {
      result = await db.query<IncomeRow>(
        `SELECT id,title,amount,category,income_date,income_time,source,notes,created_at,updated_at
         FROM income
         ORDER BY income_date DESC, income_time DESC NULLS LAST, created_at DESC
         LIMIT 200`,
      );
    }

    return Response.json(result.rows.map(normalizeIncome));
  } catch (error) {
    console.error("GET INCOME ERROR:", error);
    return Response.json(
      { error: true, message: "Nu am putut incarca veniturile.", details: error instanceof Error ? error.message : "Unknown error" },
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
    const incomeDate = String(body.incomeDate || "").trim();
    const incomeTime = String(body.incomeTime || "").trim();
    const source = String(body.source || "").trim();
    const notes = String(body.notes || "").trim();

    if (!title) return Response.json({ error: true, message: "Titlul venitului lipseste." }, { status: 400 });
    if (amount <= 0) return Response.json({ error: true, message: "Suma trebuie sa fie mai mare decat 0." }, { status: 400 });
    if (!incomeDate) return Response.json({ error: true, message: "Data venitului lipseste." }, { status: 400 });

    const result = await db.query<IncomeRow>(
      `INSERT INTO income (title,amount,category,income_date,income_time,source,notes)
       VALUES ($1,$2,$3,$4,NULLIF($5, '')::time,$6,$7)
       RETURNING id,title,amount,category,income_date,income_time,source,notes,created_at,updated_at`,
      [title, amount, category, incomeDate, incomeTime, source, notes],
    );

    return Response.json({ success: true, income: normalizeIncome(result.rows[0]) });
  } catch (error) {
    console.error("POST INCOME ERROR:", error);
    return Response.json(
      { error: true, message: "Nu am putut salva venitul.", details: error instanceof Error ? error.message : "Unknown error" },
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
    const incomeDate = String(body.incomeDate || "").trim();
    const incomeTime = String(body.incomeTime || "").trim();
    const source = String(body.source || "").trim();
    const notes = String(body.notes || "").trim();

    if (!id) return Response.json({ error: true, message: "ID lipsa." }, { status: 400 });
    if (!title) return Response.json({ error: true, message: "Titlul venitului lipseste." }, { status: 400 });
    if (amount <= 0) return Response.json({ error: true, message: "Suma trebuie sa fie mai mare decat 0." }, { status: 400 });
    if (!incomeDate) return Response.json({ error: true, message: "Data venitului lipseste." }, { status: 400 });

    const result = await db.query<IncomeRow>(
      `UPDATE income
       SET title=$2, amount=$3, category=$4, income_date=$5, income_time=NULLIF($6, '')::time, source=$7, notes=$8, updated_at=NOW()
       WHERE id=$1
       RETURNING id,title,amount,category,income_date,income_time,source,notes,created_at,updated_at`,
      [id, title, amount, category, incomeDate, incomeTime, source, notes],
    );

    if (result.rowCount === 0) return Response.json({ error: true, message: "Venitul nu exista." }, { status: 404 });
    return Response.json({ success: true, income: normalizeIncome(result.rows[0]) });
  } catch (error) {
    console.error("PATCH INCOME ERROR:", error);
    return Response.json(
      { error: true, message: "Nu am putut actualiza venitul.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const id = String(body?.id || "").trim();
    if (!id) return Response.json({ error: true, message: "ID lipsa." }, { status: 400 });

    const result = await db.query<IncomeRow>(
      `DELETE FROM income WHERE id=$1
       RETURNING id,title,amount,category,income_date,income_time,source,notes,created_at,updated_at`,
      [id],
    );

    if (result.rowCount === 0) return Response.json({ error: true, message: "Venitul nu exista." }, { status: 404 });
    return Response.json({ success: true, income: normalizeIncome(result.rows[0]) });
  } catch (error) {
    console.error("DELETE INCOME ERROR:", error);
    return Response.json(
      { error: true, message: "Nu am putut sterge venitul.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
