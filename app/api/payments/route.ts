import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { paymentFromRow } from "@/lib/db-mappers";

// 🔹 GET: listar pagos
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM payments ORDER BY created_at DESC"
    );
    return NextResponse.json(
      result.rows.map((r: Record<string, unknown>) => paymentFromRow(r)),
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 🔹 POST: crear pago
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      memberId,
      memberName,
      concept,
      description,
      amount,
      date,
      monthlyChargeIds,
      attendanceIds,
    } = body as {
      memberId: string;
      memberName: string;
      concept: string;
      description: string;
      amount: number;
      date: string;
      monthlyChargeIds?: string[];
      attendanceIds?: string[];
    };

    // Generar número de recibo
    const countResult = await client.query("SELECT COUNT(*) FROM payments");
    const count = Number(countResult.rows[0].count) + 1;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const receiptNumber = `REC-${year}${month}-${String(count).padStart(4, "0")}`;

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO payments 
      (member_id, member_name, concept, description, amount, date, receipt_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [memberId, memberName, concept, description, amount, date, receiptNumber],
    );

    const paymentId = String(result.rows[0].id);

    if (monthlyChargeIds?.length) {
      for (const cid of monthlyChargeIds) {
        await client.query(
          `UPDATE monthly_charges
           SET paid = true, payment_id = $1
           WHERE id::text = $2`,
          [paymentId, String(cid)],
        );
      }
    }

    if (attendanceIds?.length) {
      for (const aid of attendanceIds) {
        await client.query(
          `UPDATE event_attendances
           SET fine_paid = true, fine_payment_id = $1
           WHERE id::text = $2`,
          [paymentId, String(aid)],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(paymentFromRow(result.rows[0]), { status: 201 });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  } finally {
    client.release();
  }
}