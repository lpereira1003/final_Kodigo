CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255),
  precio_compra NUMERIC(12, 2) NOT NULL CHECK (precio_compra > 0),
  precio_venta NUMERIC(12, 2) NOT NULL CHECK (precio_venta > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  numero_venta VARCHAR(30) NOT NULL UNIQUE,
  fecha_venta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('COMPLETADA', 'ANULADA'))
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id BIGSERIAL PRIMARY KEY,
  venta_id BIGINT NOT NULL REFERENCES ventas(id),
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario > 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta_id ON detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto_id ON detalle_ventas(producto_id);

INSERT INTO productos (codigo, nombre, descripcion, precio_compra, precio_venta, stock, activo)
VALUES
  ('MAR-001', 'Martillo de una', 'Martillo de acero con mango antideslizante', 5.50, 8.99, 25, TRUE),
  ('DES-001', 'Destornillador Phillips', 'Destornillador punta Phillips mediano', 1.75, 3.50, 60, TRUE),
  ('DES-002', 'Destornillador plano', 'Destornillador punta plana mediano', 1.70, 3.25, 55, TRUE),
  ('TAL-001', 'Taladro electrico', 'Taladro electrico 1/2 pulgada', 35.00, 59.99, 12, TRUE),
  ('BRO-001', 'Juego de brocas', 'Set de brocas para metal y madera', 6.80, 12.50, 30, TRUE),
  ('CIN-001', 'Cinta metrica', 'Cinta metrica de 5 metros', 2.40, 4.99, 45, TRUE),
  ('LLA-001', 'Llave ajustable', 'Llave ajustable de 10 pulgadas', 4.90, 9.75, 20, TRUE),
  ('ALI-001', 'Alicate universal', 'Alicate universal con mango aislado', 3.85, 7.25, 28, TRUE),
  ('TOR-001', 'Tornillos madera', 'Caja de tornillos para madera 100 unidades', 2.25, 4.50, 80, TRUE),
  ('CLA-001', 'Clavos acero', 'Bolsa de clavos de acero 1 libra', 1.60, 3.10, 90, TRUE),
  ('PEG-001', 'Pegamento PVC', 'Pegamento para tuberia PVC', 2.80, 5.25, 35, TRUE),
  ('PVC-001', 'Tubo PVC 1/2', 'Tubo PVC de media pulgada', 1.20, 2.40, 100, TRUE),
  ('PVC-002', 'Codo PVC 1/2', 'Codo PVC de media pulgada', 0.35, 0.85, 150, TRUE),
  ('PIN-001', 'Pintura blanca', 'Galon de pintura blanca interior', 12.00, 19.99, 18, TRUE),
  ('BRO-002', 'Brocha 2 pulgadas', 'Brocha para pintura de 2 pulgadas', 1.10, 2.25, 50, TRUE),
  ('ROD-001', 'Rodillo pintura', 'Rodillo para pintar paredes', 2.75, 5.50, 32, TRUE),
  ('GUA-001', 'Guantes trabajo', 'Par de guantes de trabajo resistentes', 1.95, 3.99, 70, TRUE),
  ('LEN-001', 'Lentes seguridad', 'Lentes transparentes de seguridad', 1.80, 3.75, 40, TRUE),
  ('ESC-001', 'Escalera aluminio', 'Escalera plegable de aluminio', 42.00, 69.99, 8, TRUE),
  ('EXT-001', 'Extension electrica', 'Extension electrica de 10 metros', 6.50, 11.99, 22, TRUE)
ON CONFLICT (codigo) DO NOTHING;
