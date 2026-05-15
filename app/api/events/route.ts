import { NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔹 Tipo de datos de la BD
type EventRow = {
  id: string;
  name: string;
  type: string;
  date: string;
  amount: number;
  created_at: string;
};

// 🔹 GET: listar eventos
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, name, type, date, amount, created_at FROM events ORDER BY date DESC"
    );

    const events = (result.rows as EventRow[]).map((e) => ({
      id: String(e.id),
      name: e.name,
      type: e.type,
      date: e.date,
      amount: e.amount,
      createdAt: e.created_at,
    }));

    return NextResponse.json(events, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// 🔹 POST: crear evento
export async function POST(request: Request) {
  try {
    const body: {
      name: string;
      type: string;
      date: string;
      amount: number;
    } = await request.json();

    const { name, type, date, amount } = body;

    const result = await pool.query(
      `INSERT INTO events (name, type, date, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, type, date, amount, created_at`,
      [name, type, date, amount]
    );

    const event = result.rows[0] as EventRow;

    return NextResponse.json(
      {
        id: String(event.id),
        name: event.name,
        type: event.type,
        date: event.date,
        amount: event.amount,
        createdAt: event.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}