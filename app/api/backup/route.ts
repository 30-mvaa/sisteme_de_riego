import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [membersRes, chargesRes, eventsRes] = await Promise.all([
      pool.query("SELECT * FROM members ORDER BY id ASC"),
      pool.query("SELECT * FROM monthly_charges ORDER BY created_at DESC"),
      pool.query("SELECT * FROM events ORDER BY date DESC"),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      members: membersRes.rows,
      monthlyCharges: chargesRes.rows,
      events: eventsRes.rows,
    };

    const filename = `backup_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/backup]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
