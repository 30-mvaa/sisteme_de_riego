-- Datos iniciales (ejecutar después de 001_init.sql)
-- Contraseña del usuario admin: admin123  (cámbiala tras el primer acceso)

INSERT INTO settings (key, value)
VALUES ('rate_per_hectare', '4')
ON CONFLICT (key) DO NOTHING;

-- Hash bcrypt (cost 12) de "admin123", generado con bcryptjs
INSERT INTO auth_users (username, password, name, role, enabled)
VALUES (
  'admin',
  '$2b$12$BGvqjXmKWQ.W4AMM4U7NFOCJ/r/mICGAATcf2FhcCxFZEAb3KUeUK',
  'Administrador',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;
