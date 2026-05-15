import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { expenseFromRow } from "@/lib/db-mappers";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses_v ORDER BY date DESC, created_at DESC"
    );
    return NextResponse.json(
      result.rows.map((r: Record<string, unknown>) => expenseFromRow(r)),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, category, amount, date, notes, createdBy } = body as {
      description: string;
      category: string;
      amount: number;
      date: string;
      notes?: string;
      createdBy?: string;
    };

    const result = await pool.query(
      `INSERT INTO expenses (description, category, amount, date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [description, category, amount, date, notes || null, createdBy || null],
    );

    // Re-query via view for consistent shape
    const viewResult = await pool.query(
      "SELECT * FROM expenses_v WHERE id = $1",
      [String(result.rows[0].id)],
    );

    return NextResponse.json(expenseFromRow(viewResult.rows[0]), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
