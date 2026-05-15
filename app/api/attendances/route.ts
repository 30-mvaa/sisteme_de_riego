import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔹 Tipo BD (ids text/uuid en el esquema actual)
type AttendanceRow = {
  id: string;
  event_id: string;
  member_id: string;
  attended: boolean;
  fine_generated: boolean;
  fine_amount: number;
  fine_paid: boolean;
  fine_payment_id: string | null;
  created_at: string;
};

// 🔹 Transformación
function transformAttendance(a: AttendanceRow) {
  return {
    id: String(a.id),
    eventId: String(a.event_id),
    memberId: String(a.member_id),
    attended: a.attended,
    fineGenerated: a.fine_generated,
    fineAmount: a.fine_amount,
    finePaid: a.fine_paid,
    finePaymentId:
      a.fine_payment_id != null ? String(a.fine_payment_id) : undefined,
    createdAt: a.created_at,
  };
}

// 🔹 GET
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, event_id, member_id, attended, fine_generated, fine_amount, fine_paid, fine_payment_id, created_at
       FROM event_attendances
       ORDER BY created_at ASC`
    );

    const attendances = (result.rows as AttendanceRow[]).map(transformAttendance);

    return NextResponse.json(attendances, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("[GET /api/attendances]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔹 POST
export async function POST(request: NextRequest) {
  try {
    const body: {
      eventId: string;
      memberIds: string[];
      eventAmount: number;
    } = await request.json();

    const { eventId, memberIds, eventAmount } = body;

    // 🔹 Obtener miembros existentes
    const existingResult = await pool.query(
      `SELECT member_id FROM event_attendances WHERE event_id = $1`,
      [eventId]
    );

    const existingMemberIds = new Set(
      (existingResult.rows as { member_id: string }[]).map((a) =>
        String(a.member_id),
      ),
    );

    const newMemberIds = memberIds
      .map(String)
      .filter((id) => !existingMemberIds.has(id));

    if (newMemberIds.length === 0) {
      return NextResponse.json({ created: 0 }, { status: 201 });
    }

    // 🔹 Insertar nuevos registros
    const values = newMemberIds.map((memberId) => [
      eventId,
      memberId,
      false,
      eventAmount > 0,
      eventAmount,
      false,
    ]);

    for (const v of values) {
      await pool.query(
        `INSERT INTO event_attendances 
        (event_id, member_id, attended, fine_generated, fine_amount, fine_paid)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        v
      );
    }

    return NextResponse.json(
      { created: newMemberIds.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/attendances]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}