const pool = require('../config/db');
const { validationResult, matchedData } = require('express-validator');
const { addNumericFilter } = require('../utils/sql'); // Helper para condiciones numéricas

// Listado de productos con stock por debajo del mínimo
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
  };

  const sortCol = SORTABLE[data.sortBy] || 'p.id';
  const sortDirSql = (data.sortDir || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const joins = [];                             // Joins condicionales
  const where = ['p.stock < p.stock_minimo'];    // Filtro fijo de bajo stock
  const params = [];                            // Valores parametrizados

  if (data.qName) {
    where.push('p.nombre LIKE ?');
    params.push(`%${data.qName}%`);
  }
  // Comparaciones numéricas con '=' por defecto si falta operador
  addNumericFilter(where, params, 'p.precio', data.price, data.priceOp);
  addNumericFilter(where, params, 'p.stock', data.stock, data.stockOp);
  addNumericFilter(where, params, 'p.stock_minimo', data.min, data.minOp);
  if (data.localizacionId) {
    where.push('p.localizacion_id = ?');
    params.push(data.localizacionId);
  }
  if (data.categoriaId) {
    joins.push('JOIN producto_categoria pc ON pc.producto_id = p.id');
    where.push('pc.categoria_id = ?');
    params.push(data.categoriaId);
  }
  if (data.proveedorId) {
    joins.push('JOIN producto_proveedor pp ON pp.producto_id = p.id');
    where.push('pp.proveedor_id = ?');
    params.push(data.proveedorId);
  }

  const whereSql = 'WHERE ' + where.join(' AND ');
  const joinSql = joins.join(' ');
  const baseSql = `FROM productos p LEFT JOIN localizaciones l ON p.localizacion_id = l.id ${joinSql} ${whereSql}`;

  const [rows] = await pool.query(
    `SELECT DISTINCT p.*, l.id AS localizacion_id, l.nombre AS localizacion ${baseSql} ORDER BY ${sortCol} ${sortDirSql} LIMIT ? OFFSET ?`,
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

  res.render('pages/bajo-stock', {
    title: 'Bajo stock',         // Título de la página
    basePath: '/inventario/bajo-stock', // Ruta base para Limpiar/paginación
    productos: rows,             // Resultado de la consulta
    page,
    totalPages,
    localizaciones,
    categorias,
    proveedores,
    query: req.query,
    errors: errors.array(),
    viewClass: 'view-bajo-stock' // Clase de fondo para la vista
  });
};
