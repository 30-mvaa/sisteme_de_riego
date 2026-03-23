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

// 🔹 PUT — actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { username, password, name, email, role, enabled } = body;

    // 🔹 Obtener estado actual antes de actualizar
    const currentRes = await pool.query(
      "SELECT id, username, name, email, role, enabled FROM auth_users WHERE id::text = $1",
      [id]
    );
    const currentUser = currentRes.rows[0];

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // 🔹 validar username único
    if (username && username !== currentUser.username) {
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
    if (email && email !== currentUser.email) {
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
    const changes: { field: string; oldValue: string | boolean | null; newValue: string | boolean | null }[] = [];

    if (username && username !== currentUser.username) {
      fields.push(`username = $${index++}`);
      values.push(username);
      changes.push({ field: "nombre de usuario", oldValue: currentUser.username, newValue: username });
    }
    if (name && name !== currentUser.name) {
      fields.push(`name = $${index++}`);
      values.push(name);
      changes.push({ field: "nombre", oldValue: currentUser.name, newValue: name });
    }
    if (email !== undefined && email !== (currentUser.email || "")) {
      fields.push(`email = $${index++}`);
      values.push(email || null);
      changes.push({ field: "correo electrónico", oldValue: currentUser.email, newValue: email || null });
    }
    if (role && role !== currentUser.role) {
      fields.push(`role = $${index++}`);
      values.push(role);
      changes.push({ field: "rol", oldValue: currentUser.role, newValue: role });
    }
    if (enabled !== undefined && enabled !== currentUser.enabled) {
      fields.push(`enabled = $${index++}`);
      values.push(enabled);
      changes.push({ field: "estado", oldValue: currentUser.enabled ? "habilitado" : "deshabilitado", newValue: enabled ? "habilitado" : "deshabilitado" });
    }
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 12);
      fields.push(`password = $${index++}`);
      values.push(hashed);
      changes.push({ field: "contraseña", oldValue: "********", newValue: "******** (cambiada)" });
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

    // 🔹 Registrar en auditoría con detalle de cambios
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: "system",
      username: "Sistema",
      action: "UPDATE",
      entityType: "user",
      entityId: String(user.id),
      details: {
        usuarioEditado: currentUser.username,
        cambios: changes,
      },
      ...clientInfo,
    });

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const userRes = await pool.query(
      "SELECT id, username, enabled FROM auth_users WHERE id::text = $1 LIMIT 1",
      [id],
    );

    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const newEnabled = !user.enabled;

    const updatedRes = await pool.query(
      `UPDATE auth_users 
       SET enabled = $1
       WHERE id::text = $2
       RETURNING id, username, name, email, role, enabled, created_at`,
      [newEnabled, id],
    );

    const updated = updatedRes.rows[0] as UserRow;

    // 🔹 Registrar en auditoría
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: "system",
      username: "Sistema",
      action: "UPDATE",
      entityType: "user",
      entityId: String(updated.id),
      details: {
        usuarioEditado: updated.username,
        cambios: [
          { field: "estado", oldValue: user.enabled ? "habilitado" : "deshabilitado", newValue: newEnabled ? "habilitado" : "deshabilitado" }
        ],
      },
      ...clientInfo,
    });

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const userRes = await pool.query(
      "SELECT id, username, name, email, role, enabled FROM auth_users WHERE id::text = $1 LIMIT 1",
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

    const deletedUserInfo = { ...user };

    await pool.query("DELETE FROM auth_users WHERE id::text = $1", [id]);

    // 🔹 Registrar en auditoría
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: "system",
      username: "Sistema",
      action: "DELETE",
      entityType: "user",
      entityId: id,
      details: {
        usuarioEliminado: {
          username: deletedUserInfo.username,
          nombre: deletedUserInfo.name,
          email: deletedUserInfo.email,
          rol: deletedUserInfo.role,
          estado: deletedUserInfo.enabled ? "habilitado" : "deshabilitado",
        },
      },
      ...clientInfo,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/access/[id]]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}