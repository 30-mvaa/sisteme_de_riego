import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

function isPgError(e: unknown): e is { code?: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

// 🔹 Tipo usuario BD
type AuthUser = {
  id: string | number;
  username: string;
  password: string;
  name: string;
  role: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL?.trim();
    if (!dbUrl) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL no está definida. Añádela en .env.",
        },
        { status: 503 },
      );
    }
    if (dbUrl.includes("TU_PASSWORD")) {
      return NextResponse.json(
        {
          error:
            'Tu conexión usa el texto "TU_PASSWORD" como contraseña: es un ejemplo, no la contraseña real. Edita .env y pon la contraseña correcta del usuario postgres (o el usuario que uses) en PostgreSQL.',
        },
        { status: 503 },
      );
    }

    const body: {
      username: string;
      password: string;
    } = await request.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o cuenta deshabilitada" },
        { status: 401 }
      );
    }

    // 🔹 Buscar usuario en PostgreSQL
    const result = await pool.query(
      `SELECT id, username, password, name, role, enabled, created_at, updated_at
       FROM auth_users
       WHERE username = $1
       LIMIT 1`,
      [username]
    );

    const user = result.rows[0] as AuthUser;

    if (!user || user.enabled === false) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o cuenta deshabilitada" },
        { status: 401 }
      );
    }

    // 🔹 Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciales incorrectas o cuenta deshabilitada" },
        { status: 401 }
      );
    }

    // 🔹 Eliminar password antes de responder
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth]", error);
    if (isPgError(error) && error.code === "28P01") {
      return NextResponse.json(
        {
          error:
            "PostgreSQL rechazó usuario o contraseña (error 28P01). Revisa DATABASE_URL: usuario y contraseña deben coincidir con tu servidor PostgreSQL local.",
        },
        { status: 503 },
      );
    }
    if (isPgError(error) && error.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          error:
            "No hay conexión al servidor PostgreSQL (¿está arrancado y el puerto es correcto?).",
        },
        { status: 503 },
      );
    }
    if (isPgError(error) && error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            'Las tablas no existen en la base de datos. En la raíz del proyecto ejecuta: npm run db:migrate (asegúrate de que exista la base, p. ej. createdb chuichun_db). Luego inicia sesión con usuario admin y contraseña admin123.',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}