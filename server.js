require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { crearAdminSiNoExiste } = require('./scripts/createAdmin');
const { cargarMenu } = require('./scripts/cargarMenuMikuyNina');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const menuRoutes = require('./routes/menus');
const comboRoutes = require('./routes/combos');
const promotionRoutes = require('./routes/promotions');
const orderRoutes = require('./routes/orders');

// Se ejecutan en cada arranque, pero son seguras: no duplican nada si ya existen.
crearAdminSiNoExiste();
cargarMenu();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', orderRoutes);

// Manejo de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API del restaurante corriendo en http://localhost:${PORT}`);
});
