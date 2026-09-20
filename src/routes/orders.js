const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['Pendiente', 'Confirmado', 'En preparación', 'Listo', 'Entregado', 'Cancelado'];

// Cliente: crear pedido a partir del carrito
router.post('/', (req, res) => {
  const { customer_name, phone, order_type, table_number, pickup_time, address, items } = req.body;

  if (!customer_name || !phone || !order_type || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Datos de pedido incompletos' });
  }
  if (!['restaurante', 'recoger', 'delivery'].includes(order_type)) {
    return res.status(400).json({ error: 'Tipo de pedido inválido' });
  }
  if (order_type === 'restaurante' && !table_number) {
    return res.status(400).json({ error: 'Falta el número de mesa' });
  }
  if (order_type === 'delivery' && !address) {
    return res.status(400).json({ error: 'Falta la dirección de delivery' });
  }

  const total = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);

  const insertOrder = db.prepare(`INSERT INTO orders (customer_name, phone, order_type, table_number, pickup_time, address, total, status)
    VALUES (?,?,?,?,?,?,?, 'Pendiente')`);
  const insertItem = db.prepare(`INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?,?,?,?)`);
  const bumpSold = db.prepare(`UPDATE products SET sold_count = sold_count + ? WHERE name = ?`);

  let orderId;
  db.exec('BEGIN');
  try {
    const info = insertOrder.run(customer_name, phone, order_type, table_number || null, pickup_time || null, address || null, total);
    orderId = info.lastInsertRowid;
    items.forEach(it => {
      insertItem.run(orderId, it.name, it.quantity, it.price);
      bumpSold.run(it.quantity, it.name);
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'No se pudo registrar el pedido' });
  }

  res.status(201).json({ id: orderId, total, status: 'Pendiente' });
});

// Cliente: consultar estado por número de pedido
router.get('/:id/estado', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  const items = db.prepare('SELECT product_name, quantity, price FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

// Admin: listar todos los pedidos
router.get('/', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const itemsStmt = db.prepare('SELECT product_name, quantity, price FROM order_items WHERE order_id = ?');
  const withItems = orders.map(o => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(withItems);
});

// Admin: cambiar estado
router.put('/:id/estado', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
});

// Admin: dashboard / reportes
router.get('/reportes/resumen', requireAdmin, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const ventasHoy = db.prepare(`SELECT COALESCE(SUM(total),0) t FROM orders WHERE date(created_at) = ? AND status != 'Cancelado'`).get(today).t;
  const pedidosPendientes = db.prepare(`SELECT COUNT(*) c FROM orders WHERE status IN ('Pendiente','Confirmado','En preparación')`).get().c;
  const pedidosCompletados = db.prepare(`SELECT COUNT(*) c FROM orders WHERE status = 'Entregado' AND date(created_at) = ?`).get(today).c;
  const numPedidosHoy = db.prepare(`SELECT COUNT(*) c FROM orders WHERE date(created_at) = ?`).get(today).c;

  const ventasSemana = db.prepare(`SELECT COALESCE(SUM(total),0) t FROM orders WHERE date(created_at) >= date('now','-6 days','localtime') AND status != 'Cancelado'`).get().t;
  const ventasMes = db.prepare(`SELECT COALESCE(SUM(total),0) t FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m','now','localtime') AND status != 'Cancelado'`).get().t;

  const masVendidos = db.prepare(`SELECT product_name, SUM(quantity) cantidad FROM order_items GROUP BY product_name ORDER BY cantidad DESC LIMIT 5`).all();

  const totalPedidos = db.prepare(`SELECT COUNT(*) c FROM orders WHERE status != 'Cancelado'`).get().c;
  const ticketPromedio = totalPedidos > 0 ? (ventasMes / Math.max(numPedidosHoy, 1)) : 0;

  res.json({
    ventas_hoy: ventasHoy,
    pedidos_pendientes: pedidosPendientes,
    pedidos_completados_hoy: pedidosCompletados,
    ingresos_hoy: ventasHoy,
    ventas_semana: ventasSemana,
    ventas_mes: ventasMes,
    numero_pedidos_hoy: numPedidosHoy,
    productos_mas_vendidos: masVendidos,
    ticket_promedio: Number(ticketPromedio.toFixed(2))
  });
});

module.exports = router;
