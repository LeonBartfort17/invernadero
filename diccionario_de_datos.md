# Diccionario de Datos
## Sistema AIoT para Gestión de Invernaderos y Cultivos Hidropónicos
**Desplegado en:** Render (Ohio) — `invernadero_wnjh`
**Repositorio:** https://github.com/LeonBartfort17/invernadero
**Frontend:** https://invernadero-three.vercel.app
**Backend:** https://invernadero-pyen.onrender.com

---

## Tabla: `usuarios`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | UUID | UUID | NO | PK | Identificador único (gen_random_uuid) |
| nombre | String | VARCHAR(100) | NO | — | Nombre completo del usuario |
| email | String | VARCHAR(150) | NO | — | Correo electrónico único en el sistema |
| password_hash | String | VARCHAR(255) | NO | — | Contraseña cifrada con BCrypt |
| rol | Rol (enum) | VARCHAR(50) | NO | — | Rol del usuario: ADMIN, OPERADOR o VIEWER |
| created_at | LocalDateTime | TIMESTAMP | NO | — | Fecha y hora de registro (DEFAULT NOW()) |

> **Nota:** El rol usa el valor `VIEWER` (no `VISOR`) tal como está definido en `Rol.java`.
> **Credenciales de prueba:** admin@invernadero.com / admin123

---

## Tabla: `invernaderos`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | UUID | UUID | NO | PK | Identificador único (gen_random_uuid) |
| usuario_id | UUID | UUID | NO | FK → usuarios | Propietario del invernadero |
| nombre | String | VARCHAR(100) | NO | — | Nombre descriptivo del invernadero |
| ubicacion | String | VARCHAR(200) | SÍ | — | Dirección o coordenadas |
| areaM2 | Float | FLOAT | SÍ | — | Área total en metros cuadrados |
| tipo | TipoInvernadero (enum) | VARCHAR(50) | SÍ | — | CONVENCIONAL, HIDROPONICO, ACUAPONICO |
| activo | Boolean | BOOLEAN | NO | — | Si el invernadero está en operación (DEFAULT TRUE) |
| createdAt | LocalDateTime | TIMESTAMP | NO | — | Fecha de creación (no editable, @CreationTimestamp) |

---

## Tabla: `zonas`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | Long | BIGSERIAL | NO | PK | Autoincremental — **no UUID** |
| invernadero_id | UUID | UUID | NO | FK → invernaderos | Invernadero al que pertenece la zona |
| nombre | String | VARCHAR(255) | NO | — | Nombre de la zona |
| tipo_cultivo | String | VARCHAR(255) | SÍ | — | Tipo de cultivo (Tomate, Lechuga…) |
| area_total | Double | DOUBLE PRECISION | SÍ | — | Área total de la zona en m² |
| createdAt | LocalDateTime | TIMESTAMP | NO | — | Fecha de creación (DEFAULT NOW()) |

> **Nota:** La PK es `Long` con `BIGSERIAL` (no UUID). Los campos `tipo_cultivo` y `area_total` están sincronizados con el formulario del frontend React. El atributo Java usa `@Column(name = "tipo_cultivo")` y `@Column(name = "area_total")`.

---

## Tabla: `cultivos`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | UUID | UUID | NO | PK | Identificador único (gen_random_uuid) |
| zona_id | BIGINT | BIGINT | NO | FK → zonas | Zona donde se encuentra el cultivo |
| tipoPlanta | String | VARCHAR(100) | NO | — | Tipo de planta (columna BD: tipo_planta) |
| fechaSiembra | LocalDate | DATE | NO | — | Fecha de siembra (columna BD: fecha_siembra) |
| fechaCosechaEstimada | LocalDate | DATE | SÍ | — | Fecha estimada de cosecha |
| estadoActivo | Boolean | BOOLEAN | NO | — | Si el cultivo está activo (DEFAULT TRUE) |
| created_at | LocalDateTime | TIMESTAMP | NO | — | Fecha de creación (DEFAULT NOW()) |

---

## Tabla: `sensores`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | UUID | UUID | NO | PK | Identificador único (gen_random_uuid) |
| zona_id | BIGINT | BIGINT | NO | FK → zonas | Zona donde está instalado el sensor |
| nombre | String | VARCHAR(100) | NO | — | Nombre descriptivo (ej: "Sensor DHT22 Norte") |
| tipo | TipoSensor (enum) | VARCHAR(50) | NO | — | TEMPERATURA, HUMEDAD_AMBIENTE, HUMEDAD_SUELO, CO2, ILUMINACION |
| estadoActivo | Boolean | BOOLEAN | NO | — | Si el sensor está operativo (DEFAULT TRUE) |
| createdAt | LocalDateTime | TIMESTAMP | NO | — | Columna BD: `fecha_registro` (no `created_at`) — @CreationTimestamp |

> **Nota:** El campo de fecha en `sensores` se llama `fecha_registro` en la BD, mapeado con `@Column(name = "fecha_registro")` al atributo Java `createdAt`.

---

## Tabla: `mediciones`
| Campo | Tipo Java | Tipo BD | Nulo | PK/FK | Descripción |
|---|---|---|---|---|---|
| id | UUID | UUID | NO | PK | Identificador único (gen_random_uuid) |
| sensor_id | UUID | UUID | NO | FK → sensores | Sensor que generó la medición |
| valor | Float | FLOAT | NO | — | Valor numérico (ej: 24.5°C, 65% humedad) |
| fechaRegistro | LocalDateTime | TIMESTAMP | NO | — | Columna BD: `fecha_registro` — @CreationTimestamp |

---

## Relaciones entre entidades

| Entidad origen | Cardinalidad | Entidad destino | Campo FK | Cascade | Anotación JPA |
|---|---|---|---|---|---|
| usuarios | 1 — N | invernaderos | usuario_id | ALL | @OneToMany / @ManyToOne |
| invernaderos | 1 — N | zonas | invernadero_id | ALL | @OneToMany / @ManyToOne |
| zonas | 1 — N | cultivos | zona_id | — | @ManyToOne |
| zonas | 1 — N | sensores | zona_id | — | @ManyToOne |
| sensores | 1 — N | mediciones | sensor_id | ALL | @OneToMany / @ManyToOne |

---

## Enumeraciones

### `Rol` (tabla `usuarios`)
| Valor | Descripción |
|---|---|
| ADMIN | Acceso total: crear, editar y eliminar. Ve sección Usuarios |
| OPERADOR | Puede crear y eliminar zonas, no gestiona usuarios |
| VIEWER | Solo lectura, sin botones de acción |

### `TipoInvernadero` (tabla `invernaderos`)
| Valor | Descripción |
|---|---|
| CONVENCIONAL | Invernadero de cultivo en tierra tradicional |
| HIDROPONICO | Cultivo en agua sin uso de suelo |
| ACUAPONICO | Sistema combinado de peces y plantas |

### `TipoSensor` (tabla `sensores`)
| Valor | Descripción |
|---|---|
| TEMPERATURA | Mide temperatura en °C |
| HUMEDAD_AMBIENTE | Mide humedad relativa del aire en % |
| HUMEDAD_SUELO | Mide humedad del sustrato en % |
| CO2 | Mide concentración de CO₂ en ppm |
| ILUMINACION | Mide intensidad lumínica en lux |

---

## Despliegue de la Base de Datos

| Parámetro | Valor |
|---|---|
| Motor | PostgreSQL 15+ |
| Proveedor | Render (región Ohio, USA) |
| Nombre de la BD | invernadero_wnjh |
| Usuario | invernadero_user |
| Host externo | dpg-d8c8184m0tmc73f4jc00-a.ohio-postgres.render.com |
| Puerto | 5432 |
| SSL | Requerido (Render lo gestiona automáticamente) |
| ddl-auto | none (tablas creadas manualmente con base_de_datos.sql) |
