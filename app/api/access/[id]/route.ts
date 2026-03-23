import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

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

// 🔹 PUT — actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { username, password, name, email, role, enabled } = body;

    // 🔹 validar username único
    if (username) {
      const existing = await pool.query(
        "SELECT id FROM auth_users WHERE username = $1 AND id::text <> $2 LIMIT 1",
        [username, id],
      );

      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está en uso." },
          { status: 409 }
        );
      }
    }

    // 🔹 validar email único (si se proporciona)
    if (email) {
      const existingEmail = await pool.query(
        "SELECT id FROM auth_users WHERE email = $1 AND id::text <> $2 LIMIT 1",
        [email, id],
      );

      if (existingEmail.rows.length > 0) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso." },
          { status: 409 }
        );
      }
    }

    // 🔹 construir update dinámico
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }
    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(email || null);
    }
    if (role) {
      fields.push(`role = $${index++}`);
      values.push(role);
    }
    if (enabled !== undefined) {
      fields.push(`enabled = $${index++}`);
      values.push(enabled);
    }
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 12);
      fields.push(`password = $${index++}`);
      values.push(hashed);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE auth_users 
       SET ${fields.join(", ")}
       WHERE id::text = $${index}
       RETURNING id, username, name, email, role, enabled, created_at`,
      values,
    );

    const user = result.rows[0] as UserRow;

    return NextResponse.json({
      id: String(user.id),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      enabled: user.enabled,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("[PUT /api/access/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔹 PATCH — toggle enabled
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const userRes = await pool.query(
      "SELECT id, enabled FROM auth_users WHERE id::text = $1 LIMIT 1",
      [id],
    );

    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const updatedRes = await pool.query(
      `UPDATE auth_users 
       SET enabled = $1
       WHERE id::text = $2
       RETURNING id, username, name, email, role, enabled, created_at`,
      [!user.enabled, id],
    );

    const updated = updatedRes.rows[0] as UserRow;

    return NextResponse.json({
      id: String(updated.id),
      username: updated.username,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      enabled: updated.enabled,
      createdAt: updated.created_at,
    });
  } catch (error) {
    console.error("[PATCH /api/access/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const userRes = await pool.query(
      "SELECT username FROM auth_users WHERE id::text = $1 LIMIT 1",
      [id],
    );

    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    if (user.username === "admin") {
      return NextResponse.json(
        { error: "No se puede eliminar el usuario administrador." },
        { status: 403 }
      );
    }

    await pool.query("DELETE FROM auth_users WHERE id::text = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/access/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}