const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const all = req.query.all === 'true';
  const rows = all
    ? db.prepare('SELECT * FROM promotions ORDER BY id DESC').all()
    : db.prepare('SELECT * FROM promotions WHERE active = 1 ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, description, original_price, promotional_price, image, start_date, end_date, active } = req.body;
  if (!name || original_price == null || promotional_price == null) {
    return res.status(400).json({ error: 'name, original_price y promotional_price son requeridos' });
  }
  const info = db.prepare(`INSERT INTO promotions (name, description, original_price, promotional_price, image, start_date, end_date, active)
    VALUES (?,?,?,?,?,?,?,?)`)
    .run(name, description || '', original_price, promotional_price, image || '', start_date || '', end_date || '', active === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM promotions WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM promotions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  const body = { ...existing, ...req.body };
  db.prepare(`UPDATE promotions SET name=?, description=?, original_price=?, promotional_price=?, image=?, start_date=?, end_date=?, active=? WHERE id=?`)
    .run(body.name, body.description, body.original_price, body.promotional_price, body.image, body.start_date, body.end_date, body.active ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM promotions WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM promotions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
