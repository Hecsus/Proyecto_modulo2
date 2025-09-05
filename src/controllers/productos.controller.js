const pool = require('../config/db');
const { validationResult, matchedData } = require('express-validator');

// Listar productos con filtros, ordenación y paginación
exports.list = async (req, res) => {
  const errors = validationResult(req); // Validación de query params
  const data = matchedData(req, { locations: ['query'] }); // Datos saneados

  const page = parseInt(req.query.page) || 1; // Página actual
  const limit = 10;                           // Elementos por página
  const offset = (page - 1) * limit;          // Desplazamiento

  const SORTABLE = {                          // Map de columnas ordenables
    id: 'p.id',
    nombre: 'p.nombre',
    precio: 'p.precio',
    stock: 'p.stock',
    stock_minimo: 'p.stock_minimo'
  };
  const OP_MAP = { eq: '=', lte: '<=', gte: '>=' }; // Operadores permitidos

  const sortCol = SORTABLE[data.sortBy] || 'p.id';
  const sortDirSql = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const joins = [];   // Joins condicionales
  const clauses = []; // Condiciones WHERE
  const params = [];  // Valores parametrizados

  if (data.qName) {
    clauses.push('p.nombre LIKE ?');
    params.push(`%${data.qName}%`);
  }
  if (data.price != null && data.priceOp && OP_MAP[data.priceOp]) {
    clauses.push(`p.precio ${OP_MAP[data.priceOp]} ?`);
    params.push(data.price);
  }
  if (data.stock != null && data.stockOp && OP_MAP[data.stockOp]) {
    clauses.push(`p.stock ${OP_MAP[data.stockOp]} ?`);
    params.push(data.stock);
  }
  if (data.min != null && data.minOp && OP_MAP[data.minOp]) {
    clauses.push(`p.stock_minimo ${OP_MAP[data.minOp]} ?`);
    params.push(data.min);
  }
  if (data.localizacionId) {
    clauses.push('p.localizacion_id = ?');
    params.push(data.localizacionId);
  }
  if (data.categoriaId) {
    joins.push('JOIN producto_categoria pc ON pc.producto_id = p.id');
    clauses.push('pc.categoria_id = ?');
    params.push(data.categoriaId);
  }
  if (data.proveedorId) {
    joins.push('JOIN producto_proveedor pp ON pp.producto_id = p.id');
    clauses.push('pp.proveedor_id = ?');
    params.push(data.proveedorId);
  }
  if (data.low === '1') {
    clauses.push('p.stock < p.stock_minimo');
  }

  const whereSql = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const joinSql = joins.join(' ');
  const baseSql = `FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id ${joinSql} ${whereSql}`;

  const [rows] = await pool.query(
    `SELECT DISTINCT p.*, l.nombre AS localizacion ${baseSql} ORDER BY ${sortCol} ${sortDirSql} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT p.id) AS total ${baseSql}`,
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
    query: req.query,
    errors: errors.array()
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
  res.render('pages/productos/form', { title, producto, categorias, proveedores, localizaciones, errors: [], old: null });
};

// Crear producto
exports.create = async (req, res) => {
  const errors = validationResult(req);
  const [categorias] = await pool.query('SELECT * FROM categorias');
  const [proveedores] = await pool.query('SELECT * FROM proveedores');
  const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
  if (!errors.isEmpty()) {
    return res.render('pages/productos/form', { title: 'Nuevo producto', producto: null, categorias, proveedores, localizaciones, errors: errors.array(), old: req.body });
  }

  const { nombre, descripcion, precio, stock, stock_minimo, localizacion_id, categorias: cats = [], proveedores: provs = [] } = req.body;
  const categoriasArr = Array.isArray(cats) ? cats : [cats];
  const proveedoresArr = Array.isArray(provs) ? provs : [provs];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, localizacion_id) VALUES (?,?,?,?,?,?)',
      [nombre, descripcion, precio, stock, stock_minimo, localizacion_id]
    );
    const prodId = r.insertId;

    if (categoriasArr.length) {
      const values = categoriasArr.map(id => [prodId, Number(id)]);
      await conn.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES ?', [values]);
    }
    if (proveedoresArr.length) {
      const values = proveedoresArr.map(id => [prodId, Number(id)]);
      await conn.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES ?', [values]);
    }

    await conn.commit();
    req.session.flash = { type: 'success', message: 'Producto creado con éxito.' };
    res.redirect('/productos');
  } catch (e) {
    await conn.rollback();
    res.render('pages/productos/form', { title: 'Nuevo producto', producto: null, categorias, proveedores, localizaciones, errors: [{ msg: e.message }], old: req.body });
  } finally {
    conn.release();
  }
};

// Editar producto
exports.update = async (req, res) => {
  const errors = validationResult(req);
  const id = req.params.id;
  const [categorias] = await pool.query('SELECT * FROM categorias');
  const [proveedores] = await pool.query('SELECT * FROM proveedores');
  const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
  if (!errors.isEmpty()) {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    return res.render('pages/productos/form', { title: 'Editar producto', producto: rows[0], categorias, proveedores, localizaciones, errors: errors.array(), old: req.body });
  }
  const { nombre, descripcion, precio, stock, stock_minimo, localizacion_id, categorias: cats = [], proveedores: provs = [] } = req.body;
  const categoriasArr = Array.isArray(cats) ? cats : [cats];
  const proveedoresArr = Array.isArray(provs) ? provs : [provs];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, stock_minimo=?, localizacion_id=? WHERE id=?',
      [nombre, descripcion, precio, stock, stock_minimo, localizacion_id, id]);
    await conn.query('DELETE FROM producto_categoria WHERE producto_id=?', [id]);
    await conn.query('DELETE FROM producto_proveedor WHERE producto_id=?', [id]);
    if (categoriasArr.length) {
      const values = categoriasArr.map(cid => [id, Number(cid)]);
      await conn.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES ?', [values]);
    }
    if (proveedoresArr.length) {
      const values = proveedoresArr.map(pid => [id, Number(pid)]);
      await conn.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES ?', [values]);
    }
    await conn.commit();
    req.session.flash = { type: 'success', message: 'Producto actualizado.' };
    res.redirect('/productos');
  } catch (e) {
    await conn.rollback();
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    res.render('pages/productos/form', { title: 'Editar producto', producto: rows[0], categorias, proveedores, localizaciones, errors: [{ msg: e.message }], old: req.body });
  } finally {
    conn.release();
  }
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
