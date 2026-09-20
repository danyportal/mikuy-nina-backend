// Carga el menú real de "Mikuy Nina" (Cajamarca) a la base de datos.
// Ejecutar UNA sola vez con: npm run cargar-menu
require('dotenv').config();
const db = require('../db');

const productos = [
  // ---- INFUSIONES, NATURALES Y CAFÉ ----
  ['Anís', 3.00, 'infusiones'],
  ['Manzanilla', 3.00, 'infusiones'],
  ['Cedrón', 3.00, 'infusiones'],
  ['Hierva luiza', 3.00, 'infusiones'],
  ['Menta', 3.00, 'infusiones'],
  ['Café pasado', 6.00, 'infusiones'],

  // ---- CERVEZAS ----
  ['Cristal', 9.00, 'cervezas'],
  ['Pilsen', 9.50, 'cervezas'],
  ['Trigo', 10.00, 'cervezas'],
  ['Negra', 10.00, 'cervezas'],

  // ---- POSTRES ----
  ['Dulce de berenjena', 5.00, 'postres'],
  ['Buñuelos', 10.00, 'postres'],
  ['Quesillo c/ Miel', 8.00, 'postres'],

  // ---- BEBIDAS REFRESCANTES ----
  ['Chicha morada 1L', 12.00, 'bebidas_refrescantes'],
  ['Maracuyá 1L', 12.00, 'bebidas_refrescantes'],
  ['Limonada 1L', 10.00, 'bebidas_refrescantes'],
  ['Piña 1L', 12.00, 'bebidas_refrescantes'],
  ['Chicha morada 1½L', 15.00, 'bebidas_refrescantes'],
  ['Maracuyá 1½L', 15.00, 'bebidas_refrescantes'],
  ['Limonada 1½L', 13.00, 'bebidas_refrescantes'],
  ['Piña 1½L', 15.00, 'bebidas_refrescantes'],

  // ---- PLATOS A LA CARTA ----
  ['Lomo a lo pobre', 28.00, 'platos_a_la_carta'],
  ['Pato a la cerveza', 25.00, 'platos_a_la_carta'],
  ['Chuleta c/papa dorada', 23.00, 'platos_a_la_carta'],
  ['Asado de res c/puré', 26.00, 'platos_a_la_carta'],
  ['Milanesa', 24.00, 'platos_a_la_carta'],
  ['Cabrito a la norteña', 22.00, 'platos_a_la_carta'],
  ['Bisteck a lo pobre', 27.00, 'platos_a_la_carta'],
  ['Mollejita', 22.00, 'platos_a_la_carta'],
  ['Trucha al vapor', 30.00, 'platos_a_la_carta'],

  // ---- ALITAS ----
  ['Alitas BBQ', 15.00, 'alitas'],
  ['Alitas Broster', 15.00, 'alitas'],
  ['Alitas c/Limón', 15.00, 'alitas'],
  ['Alitas Acevichadas', 18.00, 'alitas'],
  ['Alitas a la Maracuyá', 18.00, 'alitas'],

  // ---- PLATOS TÍPICOS DE CAJAMARCA ----
  ['Caldo verde', 10.00, 'platos_tipicos'],
  ['Cecina frita (motes)', 25.00, 'platos_tipicos'],
  ['Cecina shilpida (motes)', 28.00, 'platos_tipicos'],
  ['Chicharrón de chancho (con arroz y yuca o mote)', 28.00, 'platos_tipicos'],
  ['Trucha frita', 26.00, 'platos_tipicos'],
  ['Chicharrón de trucha', 30.00, 'platos_tipicos'],
  ['Pachamanca a la olla (gallina y chancho)', 22.00, 'platos_tipicos'],
  ['Jalea cajamarquina', 45.00, 'platos_tipicos'],
  ['Cuy frito o chactado 1/4', 20.00, 'platos_tipicos'],
  ['Cuy frito o chactado 1/2', 37.00, 'platos_tipicos'],
  ['Cuy frito o chactado Entero', 70.00, 'platos_tipicos'],

  // ---- SANDWICHS ----
  ['Sandwich de Pollo', 4.00, 'sandwichs'],
  ['Sandwich de Huevo', 3.00, 'sandwichs'],
  ['Sandwich de Palta', 3.00, 'sandwichs'],
  ['Sandwich de Queso', 4.00, 'sandwichs'],
  ['Sandwich de Chicharrón', 10.00, 'sandwichs'],
  ['Sandwich de Pavo', 10.00, 'sandwichs'],
  ['Biscocho c/queso', 5.00, 'sandwichs'],
  ['Sandwich de Chorizo', 8.00, 'sandwichs'],

  // ---- APERITIVOS CAJACHOS ----
  ['Papa c/ Huacatay', 10.00, 'aperitivos'],
  ['Frito c/ Cebiche', 10.00, 'aperitivos'],
  ['Mote Revueltos', 10.00, 'aperitivos'],
  ['Choclo c/ Queso', 8.00, 'aperitivos'],
  ['Chicharrón c/ Mote', 15.00, 'aperitivos'],

  // ---- MENÚ EJECUTIVO ----
  ['Arroz a la cubana', 9.00, 'menu_ejecutivo'],
  ['Trucha frita (menú ejecutivo)', 12.00, 'menu_ejecutivo'],
  ['Tallarín verde', 14.00, 'menu_ejecutivo'],
  ['Chuleta c/ Menestra', 13.00, 'menu_ejecutivo'],
  ['Cabrito c/Frejol', 13.00, 'menu_ejecutivo'],
  ['Pollo Broster', 13.00, 'menu_ejecutivo'],
  ['Sudado de Trucha', 15.00, 'menu_ejecutivo'],
  ['Lomo saltado', 15.00, 'menu_ejecutivo'],

  // ---- BEBIDAS Y GASEOSAS ----
  ['Gaseosa Personal', 2.50, 'bebidas_gaseosas'],
  ['Gaseosa 1/2 Lt', 4.00, 'bebidas_gaseosas'],
  ['Gaseosa 1 Lt', 7.00, 'bebidas_gaseosas'],
  ['Gaseosa 1.5 Lts', 11.00, 'bebidas_gaseosas'],
  ['Gaseosa 2 Lts', 14.00, 'bebidas_gaseosas'],
  ['Gaseosa Gordita', 5.00, 'bebidas_gaseosas'],
  ['Agua mineral', 2.50, 'bebidas_gaseosas'],

  // ---- DESAYUNOS ----
  ['Chocolate', 4.00, 'desayunos'],
  ['Chocolate c/leche', 6.00, 'desayunos'],
  ['Avena c/leche', 6.00, 'desayunos'],
  ['Café', 4.00, 'desayunos'],
  ['Leche pura (vaca)', 4.00, 'desayunos'],

  // ---- JUGOS ----
  ['Jugo de Piña', 5.00, 'jugos'],
  ['Jugo de Papaya', 5.00, 'jugos'],
  ['Jugo Surtido', 6.00, 'jugos'],
  ['Jugo de Fresa', 5.00, 'jugos'],
  ['Jugo de Mango', 6.00, 'jugos'],
  ['Jugo Especial', 10.00, 'jugos'],
  ['Plátano c/leche', 8.00, 'jugos'],

  // ---- ENTRADAS ----
  ['Humita', 4.00, 'entradas'],
  ['Tamal', 4.00, 'entradas'],
  ['Ocopa', 6.00, 'entradas'],
  ['Huancaina', 6.00, 'entradas'],
  ['Causa', 8.00, 'entradas'],

  // ---- CALDOS ----
  ['Caldo de gallina', 13.00, 'caldos'],
  ['Caldo de pata', 15.00, 'caldos'],
  ['Caldo de cabeza', 15.00, 'caldos'],
];

const insertar = db.prepare(
  `INSERT INTO products (name, description, price, image, category, available) VALUES (?, '', ?, '', ?, 1)`
);

let creados = 0;
for (const [name, price, category] of productos) {
  const existe = db.prepare('SELECT id FROM products WHERE name = ?').get(name);
  if (!existe) {
    insertar.run(name, price, category);
    creados++;
  }
}

console.log(`✅ Menú cargado. ${creados} productos nuevos agregados (de ${productos.length} en total).`);
console.log('   Los que ya existían con el mismo nombre no se duplicaron.');
