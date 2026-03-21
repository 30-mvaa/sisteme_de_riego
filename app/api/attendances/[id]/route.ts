import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type AttendanceRow = {
  id: string | number;
  event_id: string | number;
  member_id: string | number;
  attended: boolean;
  fine_generated: boolean;
  fine_amount: number;
  fine_paid: boolean;
  fine_payment_id: string | number | null;
  created_at: string;
};

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { attended }: { attended: boolean } = body;

    const currentRes = await pool.query(
      "SELECT id, fine_amount FROM event_attendances WHERE id::text = $1 LIMIT 1",
      [id],
    );
    const current = currentRes.rows[0] as
      | { id: unknown; fine_amount: number }
      | undefined;
    if (!current) {
      return NextResponse.json(
        { error: "Asistencia no encontrada" },
        { status: 404 },
      );
    }

    const originalFineAmount = Number(current.fine_amount);

    const updateRes = await pool.query(
      `UPDATE event_attendances SET
        attended = $1,
        fine_generated = $2,
        fine_amount = $3
       WHERE id::text = $4
       RETURNING id, event_id, member_id, attended, fine_generated, fine_amount, fine_paid, fine_payment_id, created_at`,
      [attended, !attended, attended ? 0 : originalFineAmount, id],
    );

    const updated = updateRes.rows[0] as AttendanceRow;
    return NextResponse.json(transformAttendance(updated));
  } catch (error) {
    console.error("[PATCH /api/attendances/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
