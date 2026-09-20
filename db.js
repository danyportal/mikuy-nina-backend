const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // incluido en Node.js 22+, sin compilación nativa

const dbPath = path.join(__dirname, '..', 'restaurante.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ---------- ESQUEMA ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' -- 'admin' (los clientes no necesitan cuenta)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  category TEXT NOT NULL, -- entradas, platos, hamburguesas, bebidas, postres, extras, personalizado
  available INTEGER NOT NULL DEFAULT 1,
  sold_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  entrada TEXT,
  plato TEXT,
  bebida TEXT,
  postre TEXT,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  date TEXT NOT NULL, -- YYYY-MM-DD
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS combos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  items TEXT, -- texto libre: "Hamburguesa, Papas, Gaseosa"
  price REAL NOT NULL,
  image TEXT,
  available INTEGER NOT NULL DEFAULT 1
);

-- Opciones para el combo personalizado (paso 1-4 del builder)
CREATE TABLE IF NOT EXISTS custom_combo_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- plato | acompanamiento | bebida | extra
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  original_price REAL NOT NULL,
  promotional_price REAL NOT NULL,
  image TEXT,
  start_date TEXT,
  end_date TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_type TEXT NOT NULL, -- restaurante | recoger | delivery
  table_number TEXT,
  pickup_time TEXT,
  address TEXT,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendiente', -- Pendiente, Confirmado, En preparación, Listo, Entregado, Cancelado
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);
`);

// ---------- SEED (datos de ejemplo, solo si las tablas están vacías) ----------
const seed = () => {
  // Los productos reales de la carta (Mikuy Nina) se cargan aparte con:
  //   npm run cargar-menu   (ver backend/src/scripts/cargarMenuMikuyNina.js)

  const menuCount = db.prepare('SELECT COUNT(*) c FROM menus').get().c;
  if (menuCount === 0) {
    const today = new Date().toISOString().slice(0, 10);
    db.prepare(`INSERT INTO menus (name, entrada, plato, bebida, postre, description, price, image, date, available)
      VALUES (?,?,?,?,?,?,?,?,?,1)`)
      .run('Menú del día', 'Sopa de verduras', 'Pollo a la plancha con arroz y ensalada', 'Chicha morada', '', 'Menú completo del día', 15.0, '', today);
  }

  const comboCount = db.prepare('SELECT COUNT(*) c FROM combos').get().c;
  if (comboCount === 0) {
    const insertCombo = db.prepare(`INSERT INTO combos (name, description, items, price, image, available) VALUES (?,?,?,?,?,1)`);
    insertCombo.run('Combo Clásico', 'Ideal para uno', 'Hamburguesa, Papas fritas, Gaseosa', 18.0, '');
    insertCombo.run('Combo Familiar', 'Para compartir', 'Pollo, Papas, Ensalada, 4 bebidas', 55.0, '');
  }

  const optCount = db.prepare('SELECT COUNT(*) c FROM custom_combo_options').get().c;
  if (optCount === 0) {
    const insertOpt = db.prepare(`INSERT INTO custom_combo_options (category, name, price, available) VALUES (?,?,?,1)`);
    [['plato','Pollo a la plancha',14],['plato','Pollo broaster',15],['plato','Hamburguesa',12],['plato','Lomo saltado',18],['plato','Arroz chaufa',13]]
      .forEach(([category,name,price]) => insertOpt.run(category,name,price));
    [['acompanamiento','Papas fritas',4],['acompanamiento','Arroz',2],['acompanamiento','Ensalada',3],['acompanamiento','Yuca',3]]
      .forEach(([category,name,price]) => insertOpt.run(category,name,price));
    [['bebida','Chicha morada',4],['bebida','Limonada',4],['bebida','Gaseosa',4],['bebida','Agua',2]]
      .forEach(([category,name,price]) => insertOpt.run(category,name,price));
    [['extra','Queso',2],['extra','Huevo',2],['extra','Palta',3],['extra','Tocino',3],['extra','Salsa especial',1]]
      .forEach(([category,name,price]) => insertOpt.run(category,name,price));
  }

  const promoCount = db.prepare('SELECT COUNT(*) c FROM promotions').get().c;
  if (promoCount === 0) {
    db.prepare(`INSERT INTO promotions (name, description, original_price, promotional_price, image, start_date, end_date, active)
      VALUES (?,?,?,?,?,?,?,1)`)
      .run('Martes de Hamburguesa', 'Hamburguesa + papas + bebida', 22.0, 17.0, '', '2026-01-01', '2026-12-31');
  }
};
seed();

module.exports = db;
