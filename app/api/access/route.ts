import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createAuditLog, getClientInfo } from "@/lib/audit";

// 🔹 Tipo BD
type UserRow = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  enabled: boolean;
  created_at: string;
};

// 🔹 GET: listar usuarios
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, username, name, email, role, enabled, created_at
       FROM auth_users
       ORDER BY created_at ASC`
    );

    const users = (result.rows as UserRow[]).map((u) => ({
      id: String(u.id),
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      enabled: u.enabled,
      createdAt: u.created_at,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/access]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔹 POST: crear usuario
export async function POST(request: NextRequest) {
  try {
    const body: {
      username: string;
      password: string;
      name: string;
      email?: string;
      role: string;
      enabled: boolean;
    } = await request.json();

    const { username, password, name, email, role, enabled } = body;

    // 🔹 Verificar si ya existe el username
    const existing = await pool.query(
      "SELECT id FROM auth_users WHERE username = $1 LIMIT 1",
      [username]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso." },
        { status: 409 }
      );
    }

    // 🔹 Verificar si ya existe el email (si se proporciona)
    if (email) {
      const existingEmail = await pool.query(
        "SELECT id FROM auth_users WHERE email = $1 LIMIT 1",
        [email]
      );

      if (existingEmail.rows.length > 0) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso." },
          { status: 409 }
        );
      }
    }

    // 🔹 Hash contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔹 Insertar usuario
    const result = await pool.query(
      `INSERT INTO auth_users (username, password, name, email, role, enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, name, email, role, enabled, created_at`,
      [username, hashedPassword, name, email || null, role, enabled]
    );

    const user = result.rows[0] as UserRow;

    // 🔹 Registrar en auditoría
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: "system",
      username: "Sistema",
      action: "CREATE",
      entityType: "user",
      entityId: String(user.id),
      details: { username: user.username, name: user.name, role: user.role },
      ...clientInfo,
    });

    return NextResponse.json(
      {
        id: String(user.id),
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        enabled: user.enabled,
        createdAt: user.created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/access]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}