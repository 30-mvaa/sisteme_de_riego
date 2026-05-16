import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    await pool.query(`
      alter table auth_users drop constraint if exists auth_users_role_check;
      alter table auth_users add constraint auth_users_role_check
        check (role in ('admin', 'presidente', 'secretario', 'tesorero'));
    `);
    return NextResponse.json({ ok: true, message: "Migración de roles aplicada correctamente" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
