import pool from "@/lib/db";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_COMPLETE";

export type EntityType =
  | "user"
  | "member"
  | "payment"
  | "event"
  | "attendance"
  | "monthly_charge"
  | "settings";

interface AuditLogData {
  userId: string;
  username: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.userId,
        data.username,
        data.action,
        data.entityType,
        data.entityId || null,
        data.details ? JSON.stringify(data.details) : null,
        data.ipAddress || null,
        data.userAgent || null,
      ]
    );
  } catch (error) {
    console.error("[AuditLog] Error creating audit log:", error);
  }
}

export function getClientInfo(request: Request): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}
