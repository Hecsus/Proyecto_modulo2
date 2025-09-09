-- Ajuste de esquema para compatibilidad con el código existente
ALTER TABLE productos
  ADD COLUMN costo DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER precio,
  ADD COLUMN observaciones TEXT AFTER stock_minimo;
