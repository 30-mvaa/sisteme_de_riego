import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type PaymentRow = {
  id: string | number;
  member_id: string;
  member_name: string;
  concept: string;
  description: string;
  amount: number;
  date: string;
  receipt_number: string;
  created_at: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payRes = await pool.query(
      "SELECT * FROM payments WHERE id::text = $1 LIMIT 1",
      [id],
    );
    const row = payRes.rows[0] as PaymentRow | undefined;

    if (!row) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const chargesRes = await pool.query(
      "SELECT id FROM monthly_charges WHERE payment_id::text = $1",
      [id],
    );
    const finesRes = await pool.query(
      "SELECT id FROM event_attendances WHERE fine_payment_id::text = $1",
      [id],
    );

    return NextResponse.json({
      id: row.id,
      memberId: row.member_id,
      memberName: row.member_name,
      concept: row.concept,
      description: row.description,
      amount: row.amount,
      date: row.date,
      receiptNumber: row.receipt_number,
      createdAt: row.created_at,
      monthlyChargeIds: chargesRes.rows.map((r: { id: string }) => r.id),
      attendanceIds: finesRes.rows.map((r: { id: string }) => r.id),
    });
  } catch (error) {
    console.error("[GET /api/payments/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
