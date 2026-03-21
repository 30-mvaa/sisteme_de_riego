import pool from "@/lib/db";
import { memberFromRow } from "@/lib/db-mappers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      cedula,
      name,
      email,
      phone,
      land,
    }: {
      cedula: string;
      name: string;
      email: string;
      phone: string;
      land: { hectares: number; location: string; description: string };
    } = body;

    const dup = await pool.query(
      "SELECT id FROM members WHERE cedula = $1 AND id::text <> $2 LIMIT 1",
      [cedula, id],
    );
    if (dup.rows.length > 0) {
      return NextResponse.json(
        { error: "La cédula ya está registrada." },
        { status: 409 },
      );
    }

    const result = await pool.query(
      `UPDATE members SET
        cedula = $1, name = $2, email = $3, phone = $4,
        hectares = $5, location = $6, description = $7
       WHERE id::text = $8
       RETURNING *`,
      [
        cedula,
        name,
        email,
        phone,
        land.hectares,
        land.location,
        land.description,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    return NextResponse.json(memberFromRow(result.rows[0]));
  } catch (error) {
    console.error("[PUT /api/members/[id]]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM members WHERE id::text = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/members/[id]]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
