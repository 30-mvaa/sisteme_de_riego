import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔹 GET: obtener configuraciones
export async function GET() {
  try {
    const result = await pool.query("SELECT key, value FROM settings");
    return NextResponse.json({
      settings: result.rows,
    });
  } catch (error) {
    console.error("[GET /api/settings]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔹 PUT: actualizar o crear configuración
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    // Intentar actualizar
    const update = await pool.query(
      "UPDATE settings SET value = $1 WHERE key = $2 RETURNING *",
      [value, key]
    );

    // Si no existe → insertar
    const setting =
      update.rows[0] ||
      (
        await pool.query(
          "INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING *",
          [key, value]
        )
      ).rows[0];

    return NextResponse.json(setting);
  } catch (error) {
    console.error("[PUT /api/settings]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}