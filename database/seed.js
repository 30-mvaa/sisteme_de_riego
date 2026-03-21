const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/chuichun_db'
});

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Hash passwords
    const adminPassword = await hashPassword('admin123');
    const userPassword = await hashPassword('user123');
    
    // Insert users
    await pool.query(`
      INSERT INTO auth_users (id, username, password, name, role, enabled) VALUES 
      ($1, 'admin', $2, 'Administrador', 'admin', true),
      ($3, 'user1', $4, 'Juan Pérez', 'user', true)
      ON CONFLICT (username) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440001',
      adminPassword,
      '550e8400-e29b-41d4-a716-446655440002', 
      userPassword
    ]);
    
    // Insert members
    await pool.query(`
      INSERT INTO members (id, cedula, name, email, phone, land_hectares, land_location, land_description) VALUES 
      ($1, '1234567890', 'Carlos Mendoza', 'carlos@ejemplo.com', '555-0101', 5.00, 'Sector Norte, Lote 12', 'Terreno con acceso a riego'),
      ($2, '0987654321', 'María García', 'maria@ejemplo.com', '555-0102', 3.00, 'Sector Sur, Lote 5', 'Terreno plano'),
      ($3, '1122334455', 'Pedro López', 'pedro@ejemplo.com', '555-0103', 8.00, 'Sector Este, Lote 23', 'Terreno con pendiente moderada')
      ON CONFLICT (cedula) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440101',
      '550e8400-e29b-41d4-a716-446655440102',
      '550e8400-e29b-41d4-a716-446655440103'
    ]);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
