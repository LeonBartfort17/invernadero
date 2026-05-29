-- ══════════════════════════════════════════════════════════════════
--  Script de Base de Datos
--  Sistema AIoT para Gestión de Invernaderos y Cultivos Hidropónicos
--  Motor: PostgreSQL 15+
--  Desplegado en: Render (Ohio) — invernadero_wnjh
--  Sincronizado con los modelos JPA del proyecto Spring Boot
--  Repositorio: https://github.com/LeonBartfort17/invernadero
-- ══════════════════════════════════════════════════════════════════

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. USUARIOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    rol           VARCHAR(50)   NOT NULL CHECK (rol IN ('ADMIN', 'OPERADOR', 'VIEWER')),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── 2. INVERNADEROS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invernaderos (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre      VARCHAR(100)  NOT NULL,
    ubicacion   VARCHAR(200),
    area_m2     FLOAT,
    tipo        VARCHAR(50)   CHECK (tipo IN ('CONVENCIONAL', 'HIDROPONICO', 'ACUAPONICO')),
    activo      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── 3. ZONAS ───────────────────────────────────────────────────────
--  PK: BIGSERIAL (Long autoincremental, no UUID)
--  Campos tipo_cultivo y area_total sincronizados con el frontend React
CREATE TABLE IF NOT EXISTS zonas (
    id              BIGSERIAL     PRIMARY KEY,
    invernadero_id  UUID          NOT NULL REFERENCES invernaderos(id) ON DELETE CASCADE,
    nombre          VARCHAR(255)  NOT NULL,
    tipo_cultivo    VARCHAR(255),
    area_total      DOUBLE PRECISION,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── 4. CULTIVOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultivos (
    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    zona_id                 BIGINT  NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
    tipo_planta             VARCHAR(100)  NOT NULL,
    fecha_siembra           DATE          NOT NULL,
    fecha_cosecha_estimada  DATE,
    estado_activo           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── 5. SENSORES ────────────────────────────────────────────────────
--  La columna de fecha se llama fecha_registro (no created_at)
--  Mapeado al atributo Java 'createdAt' con @CreationTimestamp
CREATE TABLE IF NOT EXISTS sensores (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    zona_id         BIGINT        NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
    nombre          VARCHAR(100)  NOT NULL,
    tipo            VARCHAR(50)   NOT NULL CHECK (tipo IN (
                        'TEMPERATURA', 'HUMEDAD_AMBIENTE',
                        'HUMEDAD_SUELO', 'CO2', 'ILUMINACION')),
    estado_activo   BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_registro  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── 6. MEDICIONES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mediciones (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id       UUID      NOT NULL REFERENCES sensores(id) ON DELETE CASCADE,
    valor           FLOAT     NOT NULL,
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
--  ÍNDICES para mejorar rendimiento en consultas frecuentes
-- ══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_invernaderos_usuario    ON invernaderos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_zonas_invernadero       ON zonas(invernadero_id);
CREATE INDEX IF NOT EXISTS idx_cultivos_zona           ON cultivos(zona_id);
CREATE INDEX IF NOT EXISTS idx_sensores_zona           ON sensores(zona_id);
CREATE INDEX IF NOT EXISTS idx_mediciones_sensor       ON mediciones(sensor_id);
CREATE INDEX IF NOT EXISTS idx_mediciones_fecha        ON mediciones(fecha_registro);

-- ══════════════════════════════════════════════════════════════════
--  DATOS DE PRUEBA (para desarrollo y pruebas JUnit/Selenium/Python)
-- ══════════════════════════════════════════════════════════════════

-- Usuario administrador (password: admin123 en BCrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
    ('Administrador', 'admin@invernadero.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Usuario administrador alternativo (password: admin123)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
    ('Administrador 2', 'admin2@invernadero.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Usuario operador (password: oper123)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
    ('Operador Test', 'operador@invernadero.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'OPERADOR')
ON CONFLICT (email) DO NOTHING;
