import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token y nueva contraseña requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const resetResult = await pool.query(
      `SELECT * FROM password_resets 
       WHERE token = $1 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [token]
    );

    if (resetResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    const reset = resetResult.rows[0];

    const userResult = await pool.query(
      "SELECT * FROM auth_users WHERE username = $1 OR email = $1",
      [reset.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = userResult.rows[0];

    const samePassword = await compare(newPassword, user.password);
    if (samePassword) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser igual a la actual" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    await pool.query(
      "UPDATE auth_users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, user.id]
    );

    await pool.query(
      "UPDATE password_resets SET used = true WHERE id = $1",
      [reset.id]
    );

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Error al restablecer la contraseña" },
      { status: 500 }
    );
  }
}
