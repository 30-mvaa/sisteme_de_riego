import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const statsResult = await pool.query(
      `SELECT action, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY action
       ORDER BY count DESC`
    );

    const usersResult = await pool.query(
      `SELECT username, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY username
       ORDER BY count DESC
       LIMIT 10`
    );

    const entitiesResult = await pool.query(
      `SELECT entity_type, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY entity_type
       ORDER BY count DESC`
    );

    const recentLoginsResult = await pool.query(
      `SELECT username, created_at, ip_address
       FROM audit_logs
       WHERE action IN ('LOGIN', 'LOGIN_FAILED')
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return NextResponse.json({
      byAction: statsResult.rows,
      byUser: usersResult.rows,
      byEntity: entitiesResult.rows,
      recentLogins: recentLoginsResult.rows,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("[GET /api/audit/stats]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
