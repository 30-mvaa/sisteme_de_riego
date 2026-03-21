import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔹 Tipo BD
type ChargeRow = {
  id: string;
  member_id: string;
  month: string;
  amount: number;
  paid: boolean;
  payment_id: string | null;
  created_at: string;
};

// 🔹 Transformación
function transformCharge(c: ChargeRow) {
  return {
    id: String(c.id),
    memberId: String(c.member_id),
    month: c.month,
    amount: c.amount,
    paid: c.paid,
    paymentId: c.payment_id != null ? String(c.payment_id) : undefined,
    createdAt: c.created_at,
  };
}

// 🔹 GET
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, member_id, month, amount, paid, payment_id, created_at
       FROM monthly_charges
       ORDER BY month DESC, created_at ASC`
    );

    const charges = (result.rows as ChargeRow[]).map(transformCharge);

    return NextResponse.json(charges);
  } catch (error) {
    console.error("[GET /api/monthly-charges]", error);
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
      month: string;
      members: Array<{ id: string; hectares: number }>;
      ratePerHectare: number;
    } = await request.json();

    const { month, members, ratePerHectare } = body;

    let generated = 0;

    for (const m of members) {
      // 🔹 verificar si ya existe
      const existing = await pool.query(
        `SELECT id FROM monthly_charges
         WHERE member_id = $1 AND month = $2
         LIMIT 1`,
        [m.id, month]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO monthly_charges (member_id, month, amount, paid)
           VALUES ($1, $2, $3, $4)`,
          [m.id, month, m.hectares * ratePerHectare, false]
        );

        generated++;
      }
    }

    return NextResponse.json({ generated }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/monthly-charges]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}