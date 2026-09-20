const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Público: listar productos disponibles (con filtro opcional por categoría)
router.get('/', (req, res) => {
  const { category, all } = req.query;
  let rows;
  if (all === 'true') {
    // uso interno del admin: trae también los no disponibles
    rows = category
      ? db.prepare('SELECT * FROM products WHERE category = ? ORDER BY id DESC').all(category)
      : db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  } else {
    rows = category
      ? db.prepare('SELECT * FROM products WHERE category = ? AND available = 1 ORDER BY id DESC').all(category)
      : db.prepare('SELECT * FROM products WHERE available = 1 ORDER BY id DESC').all();
  }
  res.json(rows);
});

router.get('/mas-vendidos', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE available = 1 ORDER BY sold_count DESC LIMIT 6').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

// Admin: crear
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, image, category, available } = req.body;
  if (!name || price == null || !category) {
    return res.status(400).json({ error: 'name, price y category son requeridos' });
  }
  const info = db.prepare(`INSERT INTO products (name, description, price, image, category, available) VALUES (?,?,?,?,?,?)`)
    .run(name, description || '', price, image || '', category, available === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
});

// Admin: editar
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const { name, description, price, image, category, available } = req.body;
  db.prepare(`UPDATE products SET name=?, description=?, price=?, image=?, category=?, available=? WHERE id=?`)
    .run(
      name ?? existing.name,
      description ?? existing.description,
      price ?? existing.price,
      image ?? existing.image,
      category ?? existing.category,
      available === undefined ? existing.available : (available ? 1 : 0),
      req.params.id
    );
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// Admin: eliminar
router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
