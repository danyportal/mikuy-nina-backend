require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

const name = process.env.ADMIN_NAME || 'Administrador';
const email = process.env.ADMIN_EMAIL || 'admin@restaurante.com';
const password = process.env.ADMIN_PASSWORD || 'Admin123!';

const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (existing) {
  console.log(`⚠️  Ya existe un usuario con el email ${email}. No se creó uno nuevo.`);
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 10);
db.prepare('INSERT INTO users (name, phone, email, password, role) VALUES (?,?,?,?,?)')
  .run(name, '', email, hash, 'admin');

console.log('✅ Usuario administrador creado:');
console.log(`   Email:    ${email}`);
console.log(`   Password: ${password}`);
console.log('   (Cámbiala luego desde la base de datos o crea un endpoint de cambio de contraseña)');
