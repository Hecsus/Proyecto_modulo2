const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Listar productos con filtros, ordenación y paginación
exports.list = async (req, res) => {
  const errors = validationResult(req); // Validación de query params
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Devuelve errores si la query es inválida
  }

  const page = parseInt(req.query.page) || 1; // Página actual
  const limit = 10;                           // Elementos por página
  const offset = (page - 1) * limit;          // Desplazamiento

  const SORTABLE = {                          // Whitelist de campos ordenables
    id: 'p.id',
    nombre: 'p.nombre',
    precio: 'p.precio',
    stock: 'p.stock',
    stock_minimo: 'p.stock_minimo'
  };
  const OP_MAP = { eq: '=', lte: '<=', gte: '>=' }; // Mapa de operadores permitidos

  const sortBy = SORTABLE[req.query.sortBy] || 'p.id';
  const sortDir = (req.query.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const joins = [];                             // Joins condicionales
  const where = [];                             // Filtros dinámicos
  const params = [];                            // Valores parametrizados

  if (req.query.qName) {                        // Búsqueda por nombre
    where.push('LOWER(p.nombre) LIKE ?');
    params.push(`%${req.query.qName.toLowerCase()}%`);
  }
  if (req.query.price && req.query.priceOp) {   // Filtro por precio
    where.push(`p.precio ${OP_MAP[req.query.priceOp]} ?`);
    params.push(req.query.price);
  }
  if (req.query.stock && req.query.stockOp) {   // Filtro por stock
    where.push(`p.stock ${OP_MAP[req.query.stockOp]} ?`);
    params.push(req.query.stock);
  }
  if (req.query.min && req.query.minOp) {       // Filtro por stock mínimo
    where.push(`p.stock_minimo ${OP_MAP[req.query.minOp]} ?`);
    params.push(req.query.min);
  }
  if (req.query.localizacionId) {               // Filtro por localización
    where.push('p.localizacion_id = ?');
    params.push(req.query.localizacionId);
  }
  if (req.query.categoriaId) {                  // Filtro por categoría
    joins.push('JOIN producto_categoria pc ON pc.producto_id = p.id');
    where.push('pc.categoria_id = ?');
    params.push(req.query.categoriaId);
  }
  if (req.query.proveedorId) {                  // Filtro por proveedor
    joins.push('JOIN producto_proveedor pp ON pp.producto_id = p.id');
    where.push('pp.proveedor_id = ?');
    params.push(req.query.proveedorId);
  }
  if (req.query.low === '1') {                  // Solo bajo stock
    where.push('p.stock < p.stock_minimo');
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const baseSql = `FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id ${joins.join(' ')}`;

  const [rows] = await pool.query(
    `SELECT DISTINCT p.*, l.nombre AS localizacion ${baseSql} ${whereSql} ORDER BY ${sortBy} ${sortDir} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT p.id) AS total ${baseSql} ${whereSql}`,
    params
  );

  const totalPages = Math.ceil(countRows[0].total / limit);

  const [localizaciones] = await pool.query('SELECT id, nombre FROM localizaciones');
  const [categorias] = await pool.query('SELECT id, nombre FROM categorias');
  const [proveedores] = await pool.query('SELECT id, nombre FROM proveedores');

  res.render('pages/productos/list', {
    title: 'Productos',
    productos: rows,
    page,
    totalPages,
    localizaciones,
    categorias,
    proveedores,
    filters: req.query,
    request: req
  });
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
  const [rows] = await pool.query(
    `SELECT p.*, l.nombre AS localizacion FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id WHERE p.id = ?`,
    [id]
  );
  if (!rows.length) return res.redirect('/productos');
  const producto = rows[0];
  const [cats] = await pool.query(
    `SELECT c.* FROM categorias c JOIN producto_categoria pc ON c.id = pc.categoria_id WHERE pc.producto_id = ?`,
    [id]
  );
  const [provs] = await pool.query(
    `SELECT pr.* FROM proveedores pr JOIN producto_proveedor pp ON pr.id = pp.proveedor_id WHERE pp.producto_id = ?`,
    [id]
  );
  producto.categorias = cats;
  producto.proveedores = provs;
  res.render('pages/productos/detail', { title: 'Detalle de producto', producto, returnTo: req.query.returnTo });
};
