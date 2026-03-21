import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type EventRow = {
  id: string | number;
  name: string;
  type: string;
  date: string;
  amount: number;
  created_at: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, date, amount } = body as {
      name: string;
      type: string;
      date: string;
      amount: number;
    };

    const existingRes = await pool.query(
      "SELECT id, amount FROM events WHERE id::text = $1 LIMIT 1",
      [id],
    );
    const existing = existingRes.rows[0] as { id: unknown; amount: number } | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const updateRes = await pool.query(
      `UPDATE events SET name = $1, type = $2, date = $3, amount = $4
       WHERE id::text = $5
       RETURNING id, name, type, date, amount, created_at`,
      [name, type, date, amount, id],
    );
    const updatedEvent = updateRes.rows[0] as EventRow;

    if (amount !== Number(existing.amount)) {
      await pool.query(
        `UPDATE event_attendances SET fine_amount = $1
         WHERE event_id::text = $2 AND fine_generated = true AND fine_paid = false`,
        [amount, id],
      );
    }

    return NextResponse.json({
      id: String(updatedEvent.id),
      name: updatedEvent.name,
      type: updatedEvent.type,
      date: updatedEvent.date,
      amount: updatedEvent.amount,
      createdAt: updatedEvent.created_at,
    });
  } catch (error) {
    console.error("[PUT /api/events/[id]]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM events WHERE id::text = $1", [id]);
    return NextResponse.json(
      { message: "Evento eliminado correctamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/events/[id]]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
