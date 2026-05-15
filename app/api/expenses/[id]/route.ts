import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, category, amount, date, notes } = body;

    await pool.query(
      `UPDATE expenses
       SET description = $1, category = $2, amount = $3, date = $4, notes = $5
       WHERE id::text = $6`,
      [description, category, amount, date, notes || null, id],
    );

    const result = await pool.query(
      "SELECT * FROM expenses_v WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(expenseViewRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM expenses WHERE id::text = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function expenseViewRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    description: String(row.description),
    category: String(row.category),
    amount: Number(row.amount),
    date: String(row.date),
    notes: row.notes ? String(row.notes) : undefined,
    createdBy: row.createdBy ? String(row.createdBy) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}
