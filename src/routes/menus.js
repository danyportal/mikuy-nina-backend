const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Público: menú del día de hoy (o el más reciente disponible)
router.get('/hoy', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  let row = db.prepare('SELECT * FROM menus WHERE date = ? AND available = 1').get(today);
  if (!row) {
    row = db.prepare('SELECT * FROM menus WHERE available = 1 ORDER BY date DESC LIMIT 1').get();
  }
  res.json(row || null);
});

// Admin: listar todos
router.get('/', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM menus ORDER BY date DESC').all());
});

router.post('/', requireAdmin, (req, res) => {
  const { name, entrada, plato, bebida, postre, description, price, image, date, available } = req.body;
  if (!name || price == null || !date) {
    return res.status(400).json({ error: 'name, price y date son requeridos' });
  }
  const info = db.prepare(`INSERT INTO menus (name, entrada, plato, bebida, postre, description, price, image, date, available)
    VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(name, entrada || '', plato || '', bebida || '', postre || '', description || '', price, image || '', date, available === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM menus WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const body = { ...existing, ...req.body };
  db.prepare(`UPDATE menus SET name=?, entrada=?, plato=?, bebida=?, postre=?, description=?, price=?, image=?, date=?, available=? WHERE id=?`)
    .run(body.name, body.entrada, body.plato, body.bebida, body.postre, body.description, body.price, body.image, body.date, body.available ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
