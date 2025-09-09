const pool = require('../config/db');
const { validationResult, matchedData } = require('express-validator');
const { addNumericFilter } = require('../utils/sql'); // Helper para construir comparaciones numéricas seguras

// Listar productos con filtros, ordenación y paginación
exports.list = async (req, res) => {
  const errors = validationResult(req); // Validación de query params
  const data = matchedData(req, { locations: ['query'] }); // Datos saneados

  const page = parseInt(req.query.page) || 1; // Página actual
  const limit = 10;                           // Elementos por página
  const offset = (page - 1) * limit;          // Desplazamiento

  const SORTABLE = {
    id: 'p.id',
    nombre: 'p.nombre',
    precio: 'p.precio',
    costo: 'p.costo',
    stock: 'p.stock',
    stock_minimo: 'p.stock_minimo',
    localizacion: 'l.nombre'
  }; // Cualquier otra columna queda descartada

  const sortCol = SORTABLE[data.sortBy] || 'p.id';
  const sortDirSql = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const joins = [];   // Joins condicionales
  const clauses = []; // Condiciones WHERE
  const params = [];  // Valores parametrizados

  if (data.qName) {
    clauses.push('p.nombre LIKE ?');
    params.push(`%${data.qName}%`);
  }
  // Comparaciones numéricas: si hay valor y falta operador se asume '='
  addNumericFilter(clauses, params, 'p.precio', data.price, data.priceOp);
  addNumericFilter(clauses, params, 'p.stock', data.stock, data.stockOp);
  addNumericFilter(clauses, params, 'p.stock_minimo', data.min, data.minOp);
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
    `SELECT DISTINCT p.*, l.id AS localizacion_id, l.nombre AS localizacion ${baseSql} ORDER BY ${sortCol} ${sortDirSql} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Obtiene categorías y proveedores relacionados para mostrar procedencia
  const ids = rows.map(r => r.id); // IDs de los productos listados
  const catsByProd = {};          // categorías por producto
  const provsByProd = {};         // proveedores por producto
  if (ids.length) {
    const [catRows] = await pool.query(
      'SELECT pc.producto_id, c.id, c.nombre FROM producto_categoria pc JOIN categorias c ON c.id = pc.categoria_id WHERE pc.producto_id IN (?)',
      [ids]
    );
    catRows.forEach(r => {
      (catsByProd[r.producto_id] ||= []).push({ id: r.id, nombre: r.nombre });
    });
    const [provRows] = await pool.query(
      'SELECT pp.producto_id, pr.id, pr.nombre FROM producto_proveedor pp JOIN proveedores pr ON pr.id = pp.proveedor_id WHERE pp.producto_id IN (?)',
      [ids]
    );
    provRows.forEach(r => {
      (provsByProd[r.producto_id] ||= []).push({ id: r.id, nombre: r.nombre });
    });
  }
  rows.forEach(p => {
    p.categorias = catsByProd[p.id] || [];
    p.proveedores = provsByProd[p.id] || [];
  });

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT p.id) AS total ${baseSql}`,
    params
  );

  const totalPages = Math.ceil(countRows[0].total / limit);

  const [localizaciones] = await pool.query('SELECT id, nombre FROM localizaciones');
  const [categorias] = await pool.query('SELECT id, nombre FROM categorias');
  const [proveedores] = await pool.query('SELECT id, nombre FROM proveedores');

  res.render('pages/productos/list', {
    title: 'Productos',            // Se usa en el <title> y encabezado
    basePath: '/productos',        // Ruta base para "Limpiar" y paginación
    productos: rows,              // Resultado de la consulta
    page,
    totalPages,
    localizaciones,
    categorias,
    proveedores,
    query: req.query,             // Valores actuales de los filtros para repoblar inputs
    errors: errors.array(),       // Errores de validación a mostrar en la vista
    viewClass: 'view-productos'   // Clase de fondo para la vista
  });
};

// Mostrar formulario de creación/edición
exports.form = async (req, res) => {
  const [categorias] = await pool.query('SELECT * FROM categorias');
  const [proveedores] = await pool.query('SELECT * FROM proveedores');
  const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
  let producto = null;
  if (req.params.id) { // Si hay ID, estamos editando: precarga datos
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length) {
      producto = rows[0];
      const [pc] = await pool.query('SELECT categoria_id FROM producto_categoria WHERE producto_id=?', [req.params.id]);
      producto.categoriaIds = pc.map(r => r.categoria_id); // IDs de categorías actuales
      const [pp] = await pool.query('SELECT proveedor_id FROM producto_proveedor WHERE producto_id=?', [req.params.id]);
      producto.proveedorIds = pp.map(r => r.proveedor_id); // IDs de proveedores actuales
    }
  }
  const title = req.params.id ? 'Editar producto' : 'Nuevo producto';
  res.render('pages/productos/form', { title, producto, categorias, proveedores, localizaciones, errors: [], oldInput: null, viewClass: 'view-productos' });
};

// Crear producto
exports.create = async (req, res) => {
  const errors = validationResult(req);
  const [categorias] = await pool.query('SELECT * FROM categorias');
  const [proveedores] = await pool.query('SELECT * FROM proveedores');
  const [localizaciones] = await pool.query('SELECT * FROM localizaciones');
  if (!errors.isEmpty()) {
    return res.render('pages/productos/form', { title: 'Nuevo producto', producto: null, categorias, proveedores, localizaciones, errors: errors.array(), oldInput: req.body, viewClass: 'view-productos' });
  }

  const { nombre, descripcion, precio, costo, stock, stock_minimo, observaciones, localizacion_id, categoriaIds = [], proveedorIds = [] } = req.body; // Datos del formulario
  const categoriasArr = Array.isArray(categoriaIds) ? categoriaIds : (categoriaIds ? [categoriaIds] : []);
  const proveedoresArr = Array.isArray(proveedorIds) ? proveedorIds : (proveedorIds ? [proveedorIds] : []);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      'INSERT INTO productos (nombre, descripcion, precio, costo, stock, stock_minimo, observaciones, localizacion_id) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, descripcion, precio, costo, stock, stock_minimo, observaciones, localizacion_id]
    );
    const prodId = r.insertId;

    for (const cid of categoriasArr) {
      await conn.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES (?,?)', [prodId, cid]);
    }
    for (const pid of proveedoresArr) {
      await conn.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES (?,?)', [prodId, pid]);
    }

    await conn.commit();
    req.session.flash = { type: 'success', message: 'Producto creado con éxito.' };
    res.redirect('/productos');
  } catch (e) {
    await conn.rollback();
    res.render('pages/productos/form', { title: 'Nuevo producto', producto: null, categorias, proveedores, localizaciones, errors: [{ msg: e.message }], oldInput: req.body, viewClass: 'view-productos' });
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
    return res.render('pages/productos/form', { title: 'Editar producto', producto: rows[0], categorias, proveedores, localizaciones, errors: errors.array(), oldInput: req.body, viewClass: 'view-productos' });
  }
  const { nombre, descripcion, precio, costo, stock, stock_minimo, observaciones, localizacion_id, categoriaIds = [], proveedorIds = [] } = req.body; // Datos normalizados
  const categoriasArr = Array.isArray(categoriaIds) ? categoriaIds : (categoriaIds ? [categoriaIds] : []);
  const proveedoresArr = Array.isArray(proveedorIds) ? proveedorIds : (proveedorIds ? [proveedorIds] : []);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('UPDATE productos SET nombre=?, descripcion=?, precio=?, costo=?, stock=?, stock_minimo=?, observaciones=?, localizacion_id=? WHERE id=?',
      [nombre, descripcion, precio, costo, stock, stock_minimo, observaciones, localizacion_id, id]);
    await conn.query('DELETE FROM producto_categoria WHERE producto_id=?', [id]);
    for (const cid of categoriasArr) {
      await conn.query('INSERT INTO producto_categoria (producto_id, categoria_id) VALUES (?,?)', [id, cid]);
    }
    await conn.query('DELETE FROM producto_proveedor WHERE producto_id=?', [id]);
    for (const pid of proveedoresArr) {
      await conn.query('INSERT INTO producto_proveedor (producto_id, proveedor_id) VALUES (?,?)', [id, pid]);
    }
    await conn.commit();
    req.session.flash = { type: 'success', message: 'Producto actualizado.' };
    res.redirect('/productos');
  } catch (e) {
    await conn.rollback();
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    res.render('pages/productos/form', { title: 'Editar producto', producto: rows[0], categorias, proveedores, localizaciones, errors: [{ msg: e.message }], oldInput: req.body, viewClass: 'view-productos' });
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
// Propósito: mostrar ficha de producto con categorías/proveedores y estado de stock
// Entradas: req.params.id (ID numérico del producto)
// Salidas: renderiza vista de detalle con producto y bandera isBajoStock
// Dependencias: pool (MySQL), tablas productos, categorias, proveedores, localizaciones
exports.detail = async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(
    `SELECT p.*, l.id AS localizacion_id, l.nombre AS localizacion FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id WHERE p.id = ?`,
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
  const isBajoStock = producto.stock < producto.stock_minimo; // Calcula si está por debajo del mínimo
  res.render('pages/productos/detail', {
    title: 'Detalle de producto',
    producto,
    returnTo: req.query.returnTo,
    isBajoStock,
    viewClass: 'view-productos'
  });
};
// [checklist] Requisito implementado | Validación aplicada | SQL parametrizado (si aplica) | Comentarios modo curso | Sin código muerto
