import { db } from "@/lib/db";

type CategoryRow = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
};

function normalizeCategory(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET() {
  try {
    const result = await db.query<CategoryRow>(`
      SELECT
        id,
        name,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM payment_categories
      ORDER BY is_active DESC, sort_order ASC, name ASC
    `);

    return Response.json(result.rows.map(normalizeCategory));
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut incarca categoriile.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return Response.json(
        {
          error: true,
          message: "Numele categoriei lipseste.",
        },
        { status: 400 },
      );
    }

    const maxOrder = await db.query<{ next_order: number }>(`
      SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_order
      FROM payment_categories
    `);

    const sortOrder = maxOrder.rows[0]?.next_order || 10;

    const result = await db.query<CategoryRow>(
      `
        INSERT INTO payment_categories (name, is_active, sort_order)
        VALUES ($1, true, $2)
        ON CONFLICT (name)
        DO UPDATE SET
          is_active = true,
          updated_at = NOW()
        RETURNING
          id,
          name,
          is_active,
          sort_order,
          created_at,
          updated_at
      `,
      [name, sortOrder],
    );

    return Response.json({
      success: true,
      category: normalizeCategory(result.rows[0]),
    });
  } catch (error) {
    console.error("POST CATEGORY ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut salva categoria.",
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
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasActive = Object.prototype.hasOwnProperty.call(body, "isActive");

    const name = hasName ? String(body.name || "").trim() : null;
    const isActive = hasActive ? Boolean(body.isActive) : null;

    if (!id) {
      return Response.json(
        {
          error: true,
          message: "ID lipsa.",
        },
        { status: 400 },
      );
    }

    if (hasName && !name) {
      return Response.json(
        {
          error: true,
          message: "Numele categoriei nu poate fi gol.",
        },
        { status: 400 },
      );
    }

    if (!hasName && !hasActive) {
      return Response.json(
        {
          error: true,
          message: "Nu exista modificari de salvat.",
        },
        { status: 400 },
      );
    }

    const result = await db.query<CategoryRow>(
      `
        UPDATE payment_categories
        SET
          name = COALESCE($2, name),
          is_active = COALESCE($3, is_active)
        WHERE id = $1
        RETURNING
          id,
          name,
          is_active,
          sort_order,
          created_at,
          updated_at
      `,
      [id, name, isActive],
    );

    if (result.rowCount === 0) {
      return Response.json(
        {
          error: true,
          message: "Categoria nu exista.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      category: normalizeCategory(result.rows[0]),
    });
  } catch (error) {
    console.error("PATCH CATEGORY ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut actualiza categoria.",
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

    const result = await db.query<CategoryRow>(
      `
        UPDATE payment_categories
        SET is_active = false
        WHERE id = $1
        RETURNING
          id,
          name,
          is_active,
          sort_order,
          created_at,
          updated_at
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return Response.json(
        {
          error: true,
          message: "Categoria nu exista.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      category: normalizeCategory(result.rows[0]),
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut dezactiva categoria.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
