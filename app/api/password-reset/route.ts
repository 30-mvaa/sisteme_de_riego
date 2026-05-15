import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import pool from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const userResult = await pool.query(
      "SELECT id, name, email FROM auth_users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Si el email existe, recibirás un enlace de recuperación" },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)",
      [user.email, token, expiresAt]
    );

    await sendPasswordResetEmail(user.email, token, user.name);

    return NextResponse.json({
      message: "Si el email existe, recibirás un enlace de recuperación",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
