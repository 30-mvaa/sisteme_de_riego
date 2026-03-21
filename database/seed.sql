-- Seed data for Chuichun Community Management
-- Run this after creating the schema

-- Insert users (passwords are hashed with bcrypt)
INSERT INTO auth_users (id, username, password, name, role, enabled) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Administrador', 'admin', true),
('550e8400-e29b-41d4-a716-446655440002', 'user1', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Juan Pérez', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- Insert members
INSERT INTO members (id, cedula, name, email, phone, land_hectares, land_location, land_description) VALUES 
('550e8400-e29b-41d4-a716-446655440101', '1234567890', 'Carlos Mendoza', 'carlos@ejemplo.com', '555-0101', 5.00, 'Sector Norte, Lote 12', 'Terreno con acceso a riego'),
('550e8400-e29b-41d4-a716-446655440102', '0987654321', 'María García', 'maria@ejemplo.com', '555-0102', 3.00, 'Sector Sur, Lote 5', 'Terreno plano'),
('550e8400-e29b-41d4-a716-446655440103', '1122334455', 'Pedro López', 'pedro@ejemplo.com', '555-0103', 8.00, 'Sector Este, Lote 23', 'Terreno con pendiente moderada')
ON CONFLICT (cedula) DO NOTHING;

-- Note: You can add more seed data for events, payments, etc. as needed
-- For now, starting with empty events and payments
