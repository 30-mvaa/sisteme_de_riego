import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type AuditLogRow = {
  id: string;
  user_id: string;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    // Auto-limpiar registros mayores a 30 días
    await pool.query(
      "DELETE FROM audit_logs WHERE created_at < now() - interval '30 days'"
    );

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (action) {
      whereClause += ` AND action = $${paramIndex++}`;
      params.push(action);
    }

    if (entityType) {
      whereClause += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType);
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT * FROM audit_logs ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    const logs = (result.rows as AuditLogRow[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/audit]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
