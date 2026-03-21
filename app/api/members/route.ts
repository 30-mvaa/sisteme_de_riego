import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { memberFromRow } from "@/lib/db-mappers";

// 🔹 GET: listar miembros
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY id ASC");
    return NextResponse.json(
      result.rows.map((r: Record<string, unknown>) => memberFromRow(r)),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 🔹 POST: crear miembro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cedula, name, email, phone, land } = body;

    // Validar duplicado
    const existing = await pool.query(
      "SELECT * FROM members WHERE cedula = $1",
      [cedula]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "La cédula ya está registrada" },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `INSERT INTO members (cedula, name, email, phone, hectares, location, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        cedula,
        name,
        email,
        phone,
        land.hectares,
        land.location,
        land.description,
      ]
    );

    return NextResponse.json(memberFromRow(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}