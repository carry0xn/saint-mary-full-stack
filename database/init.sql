-- Script de inicialización de la base de datos para Saint Mary Institute
-- Sistema de gestión de pagos de alumnos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios para el sistema (RF13 - Control de acceso)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    usuario VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alumnos (RF1 - Gestión de alumnos)
CREATE TABLE alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    observaciones TEXT,
    año_curso VARCHAR(20) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, irregular, inactivo
    fecha_inscripcion DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de cuotas por año/curso (RF5 - Configuración de cuotas)
CREATE TABLE configuracion_cuotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    año_curso VARCHAR(20) NOT NULL,
    monto_cuota DECIMAL(10,2) NOT NULL,
    monto_matricula DECIMAL(10,2) NOT NULL,
    año_vigencia INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(año_curso, año_vigencia)
);

-- Tabla de pagos (RF3 - Gestión de pagos)
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    monto_abonado DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    concepto VARCHAR(50) NOT NULL, -- matricula, cuota_mensual
    mes INTEGER, -- Para cuotas mensuales (1-12)
    año INTEGER NOT NULL,
    descuento_aplicado DECIMAL(5,2) DEFAULT 0, -- Porcentaje de descuento
    recargo_aplicado DECIMAL(5,2) DEFAULT 0, -- Porcentaje de recargo
    monto_original DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para controlar relaciones familiares (RF6 - Sistema de descuentos por hermanos)
CREATE TABLE relaciones_familiares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    familiar_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    tipo_relacion VARCHAR(20) DEFAULT 'hermano',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alumno_id, familiar_id),
    CHECK (alumno_id != familiar_id)
);

-- Tabla de notificaciones (RF7 - Notificación de deuda)
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- deuda_cuota, pago_tardio, vencimiento_proximo
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP,
    mes_referencia INTEGER,
    año_referencia INTEGER NOT NULL
);

-- Tabla de auditoría para cambios importantes
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id UUID NOT NULL,
    operacion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    usuario_id UUID REFERENCES usuarios(id),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_alumnos_dni ON alumnos(dni);
CREATE INDEX idx_alumnos_estado ON alumnos(estado);
CREATE INDEX idx_alumnos_año_curso ON alumnos(año_curso);
CREATE INDEX idx_pagos_alumno_id ON pagos(alumno_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX idx_pagos_mes_año ON pagos(mes, año);
CREATE INDEX idx_pagos_concepto ON pagos(concepto);
CREATE INDEX idx_notificaciones_alumno ON notificaciones(alumno_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_usuarios_timestamp BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_alumnos_timestamp BEFORE UPDATE ON alumnos FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_configuracion_cuotas_timestamp BEFORE UPDATE ON configuracion_cuotas FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_pagos_timestamp BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Datos iniciales de ejemplo

-- Usuario administrador por defecto
INSERT INTO usuarios (email, usuario, password_hash, nombre, apellido, rol) VALUES 
('admin@saintmary.edu', 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye1XrZwQT9TRb1QfgWIH2bfGXGPKcFn.y', 'Administrador', 'Sistema', 'admin');
-- Password: admin123

-- Configuraciones de cuotas de ejemplo para diferentes años/cursos
INSERT INTO configuracion_cuotas (año_curso, monto_cuota, monto_matricula, año_vigencia) VALUES 
('Jardín 3', 25000.00, 15000.00, 2026),
('Jardín 4', 25000.00, 15000.00, 2026),
('Jardín 5', 27000.00, 16000.00, 2026),
('1° Grado', 30000.00, 18000.00, 2026),
('2° Grado', 30000.00, 18000.00, 2026),
('3° Grado', 32000.00, 19000.00, 2026),
('4° Grado', 32000.00, 19000.00, 2026),
('5° Grado', 35000.00, 20000.00, 2026),
('6° Grado', 35000.00, 20000.00, 2026),
('7° Grado', 38000.00, 22000.00, 2026);

-- Alumnos de ejemplo
INSERT INTO alumnos (nombre, apellido, dni, año_curso, observaciones) VALUES 
('Juan', 'Pérez', '12345678', '3° Grado', 'Alumno regular'),
('María', 'García', '23456789', '5° Grado', 'Hermana de Pedro García'),
('Pedro', 'García', '34567890', '2° Grado', 'Hermano de María García'),
('Ana', 'López', '45678901', '1° Grado', 'Nueva estudiante'),
('Carlos', 'Martínez', '56789012', '6° Grado', 'Alumno avanzado');

-- Relaciones familiares (hermanos)
INSERT INTO relaciones_familiares (alumno_id, familiar_id, tipo_relacion) VALUES 
((SELECT id FROM alumnos WHERE dni = '23456789'), (SELECT id FROM alumnos WHERE dni = '34567890'), 'hermano'),
((SELECT id FROM alumnos WHERE dni = '34567890'), (SELECT id FROM alumnos WHERE dni = '23456789'), 'hermano');

-- Vista para estadísticas del panel administrativo (RF14)
CREATE VIEW estadisticas_mensuales AS
SELECT 
    DATE_TRUNC('month', CURRENT_DATE) as mes,
    (SELECT COUNT(*) FROM alumnos WHERE estado = 'activo') as total_alumnos,
    (SELECT COUNT(*) FROM pagos WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)) as pagos_realizados_mes,
    (SELECT COUNT(DISTINCT alumno_id) 
     FROM alumnos a 
     LEFT JOIN pagos p ON a.id = p.alumno_id 
     AND p.mes = EXTRACT(MONTH FROM CURRENT_DATE) 
     AND p.año = EXTRACT(YEAR FROM CURRENT_DATE)
     AND p.concepto = 'cuota_mensual'
     WHERE a.estado = 'activo' AND p.id IS NULL) as pagos_pendientes;

COMMENT ON DATABASE saint_mary_payments IS 'Sistema de gestión de pagos para Saint Mary Institute';