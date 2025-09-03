const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Listar productos con paginación simple
exports.list = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // página actual
  const limit = 10;                           // elementos por página
  const offset = (page - 1) * limit;          // desplazamiento
  const [rows] = await pool.query(`SELECT p.*, l.nombre AS localizacion FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id LIMIT ? OFFSET ?`, [limit, offset]);
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM productos');
  const totalPages = Math.ceil(countRows[0].total / limit);
  res.render('pages/productos/list', { title: 'Productos', productos: rows, bajoStock: false, page, totalPages });
};

// Vista de productos bajo stock utilizando la VIEW creada en SQL
exports.bajoStock = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos_bajo_stock');
  res.render('pages/productos/list', { title: 'Productos bajo stock', productos: rows, bajoStock: true, page: 1, totalPages: 1 });
};

// Mostrar formulario de creación/edición
exports.form = async (req, res) => {
  const [categorias] = await pool.query('SELECT * FROM categorias');
  const [proveedores] = await pool.query('SELECT * FROM proveedores');
  const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
  let producto = null;
  if (req.params.id) {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length) {
      producto = rows[0];
      const [pc] = await pool.query('SELECT categoria_id FROM producto_categoria WHERE producto_id=?', [req.params.id]);
      producto.categorias = pc.map(r => r.categoria_id);
      const [pp] = await pool.query('SELECT proveedor_id FROM producto_proveedor WHERE producto_id=?', [req.params.id]);
      producto.proveedores = pp.map(r => r.proveedor_id);
    }
  }
  const title = req.params.id ? 'Editar producto' : 'Nuevo producto';
  res.render('pages/productos/form', { title, producto, categorias, proveedores, localizaciones, errors: [] });
};

// Crear producto
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [categorias] = await pool.query('SELECT * FROM categorias');
    const [proveedores] = await pool.query('SELECT * FROM proveedores');
    const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
    return res.render('pages/productos/form', { title: 'Nuevo producto', producto: null, categorias, proveedores, localizaciones, errors: errors.array() });
  }
  const { nombre, descripcion, precio, stock, stock_minimo, localizacion_id, categorias: cats = [], proveedores: provs = [] } = req.body;
  const [result] = await pool.query('INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, localizacion_id) VALUES (?,?,?,?,?,?)',
    [nombre, descripcion, precio, stock, stock_minimo, localizacion_id]);
  const prodId = result.insertId;
  const arrC = Array.isArray(cats) ? cats : [cats];
  for (const c of arrC) {
    if (c) await pool.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES (?,?)', [prodId, c]);
  }
  const arrP = Array.isArray(provs) ? provs : [provs];
  for (const p of arrP) {
    if (p) await pool.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES (?,?)', [prodId, p]);
  }
  res.redirect('/productos');
};

// Editar producto
exports.update = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  if (!errors.isEmpty()) {
    const [categorias] = await pool.query('SELECT * FROM categorias');
    const [proveedores] = await pool.query('SELECT * FROM proveedores');
    const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    return res.render('pages/productos/form', { title: 'Editar producto', producto: rows[0], categorias, proveedores, localizaciones, errors: errors.array() });
  }
  const { nombre, descripcion, precio, stock, stock_minimo, localizacion_id, categorias: cats = [], proveedores: provs = [] } = req.body;
  await pool.query('UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, stock_minimo=?, localizacion_id=? WHERE id=?',
    [nombre, descripcion, precio, stock, stock_minimo, localizacion_id, id]);
  await pool.query('DELETE FROM producto_categoria WHERE producto_id=?', [id]);
  await pool.query('DELETE FROM producto_proveedor WHERE producto_id=?', [id]);
  const arrC = Array.isArray(cats) ? cats : [cats];
  for (const c of arrC) {
    if (c) await pool.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES (?,?)', [id, c]);
  }
  const arrP = Array.isArray(provs) ? provs : [provs];
  for (const p of arrP) {
    if (p) await pool.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES (?,?)', [id, p]);
  }
  res.redirect('/productos');
};

// Eliminar producto
exports.remove = async (req, res) => {
  await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  res.redirect('/productos');
};

// Detalle de producto
exports.detail = async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(`SELECT p.*, l.nombre AS localizacion FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id WHERE p.id = ?`, [id]);
  if (!rows.length) return res.redirect('/productos');
  const producto = rows[0];
  const [cats] = await pool.query(`SELECT c.* FROM categorias c JOIN producto_categoria pc ON c.id = pc.categoria_id WHERE pc.producto_id = ?`, [id]);
  const [provs] = await pool.query(`SELECT pr.* FROM proveedores pr JOIN producto_proveedor pp ON pr.id = pp.proveedor_id WHERE pp.producto_id = ?`, [id]);
  producto.categorias = cats;
  producto.proveedores = provs;
  res.render('pages/productos/detail', { title: 'Detalle de producto', producto });
};
