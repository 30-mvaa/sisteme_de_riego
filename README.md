# water

## Base de datos (PostgreSQL)

La app usa `DATABASE_URL` en `.env` (plantilla: `cp .env.example .env`).

### Primera vez: crear la base y las tablas

Si en consola ves **`relation "auth_users" does not exist`** (o similar), la base existe pero **falta el esquema**.

1. Crea la base (una vez):

   ```bash
   createdb chuichun_db
   ```

2. En `.env`, `DATABASE_URL` debe apuntar a esa base (usuario/contraseña de tu PostgreSQL).

3. Aplica migraciones y datos iniciales:

   ```bash
   npm run db:migrate
   ```

4. Inicia sesión con **usuario `admin`** y **contraseña `admin123`** (cámbiala después).

### Error 28P01 (contraseña)

Sustituye `TU_PASSWORD` en `.env` por la **contraseña real** del usuario de PostgreSQL.

Prueba conexión:

```bash
psql "postgresql://postgres:TU_CONTRASEÑA@localhost:5432/chuichun_db" -c "SELECT 1"
```
