const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Listado de productos con stock por debajo del mínimo
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
  const where = ['p.stock < p.stock_minimo'];    // Filtro fijo de bajo stock
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

  const whereSql = 'WHERE ' + where.join(' AND ');
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

  res.render('pages/bajo-stock', {
    title: 'Bajo stock',
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
