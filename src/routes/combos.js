const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ---- Combos fijos ----
router.get('/', (req, res) => {
  const all = req.query.all === 'true';
  const rows = all
    ? db.prepare('SELECT * FROM combos ORDER BY id DESC').all()
    : db.prepare('SELECT * FROM combos WHERE available = 1 ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, description, items, price, image, available } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name y price son requeridos' });
  const info = db.prepare(`INSERT INTO combos (name, description, items, price, image, available) VALUES (?,?,?,?,?,?)`)
    .run(name, description || '', items || '', price, image || '', available === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM combos WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM combos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const body = { ...existing, ...req.body };
  db.prepare(`UPDATE combos SET name=?, description=?, items=?, price=?, image=?, available=? WHERE id=?`)
    .run(body.name, body.description, body.items, body.price, body.image, body.available ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM combos WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM combos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Opciones del combo personalizado ----
router.get('/opciones/todas', (req, res) => {
  const rows = db.prepare('SELECT * FROM custom_combo_options WHERE available = 1 ORDER BY category, id').all();
  const grouped = { plato: [], acompanamiento: [], bebida: [], extra: [] };
  rows.forEach(r => { if (grouped[r.category]) grouped[r.category].push(r); });
  res.json(grouped);
});

router.post('/opciones', requireAdmin, (req, res) => {
  const { category, name, price, available } = req.body;
  if (!category || !name) return res.status(400).json({ error: 'category y name son requeridos' });
  const info = db.prepare(`INSERT INTO custom_combo_options (category, name, price, available) VALUES (?,?,?,?)`)
    .run(category, name, price || 0, available === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM custom_combo_options WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/opciones/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM custom_combo_options WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const body = { ...existing, ...req.body };
  db.prepare(`UPDATE custom_combo_options SET category=?, name=?, price=?, available=? WHERE id=?`)
    .run(body.category, body.name, body.price, body.available ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM custom_combo_options WHERE id = ?').get(req.params.id));
});

router.delete('/opciones/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM custom_combo_options WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
