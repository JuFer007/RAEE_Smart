-- =====================================================================
-- RAEE Smart - Carga inicial (Chiclayo y Lambayeque)
-- BD: "RAEE_Smart" (PostgreSQL) | Tablas creadas por Hibernate (ddl-auto=update)
-- Basado en app-movil/src/utils/datosPrueba.js (municipalidades y puntos principales).
-- Ejecutar DESPUÉS de levantar el backend una vez (para que existan las tablas):
--   psql -U postgres -d "RAEE_Smart" -f seed_chiclayo.sql
-- Idempotente: se puede correr varias veces sin duplicar datos.
--
-- Si ya corriste la versión anterior de este script, descomenta el bloque
-- de reinicio de abajo (SOLO desarrollo: borra TODOS los datos, incluidas entregas).
-- =====================================================================

-- TRUNCATE usuario, campanas, puntos_recoleccion, municipalidad, categorias_raee RESTART IDENTITY CASCADE;

BEGIN;

-- ---------------------------------------------------------------------
-- 1) categorias_raee  (enum TipoRAEE + iconos Ionicons de la app)
-- ---------------------------------------------------------------------
INSERT INTO categorias_raee (tipo, nombre_visible, descripcion, icono_url)
SELECT v.tipo, v.nombre_visible, v.descripcion, v.icono_url
FROM (VALUES
  ('TELEVISOR',                'Televisor',                'Televisores LED, LCD y plasma, monitores y proyectores.',      'tv-outline'),
  ('TABLET',                   'Tablet',                   'Tablets, e-readers y consolas portátiles.',                    'tablet-portrait-outline'),
  ('CELULAR',                  'Celular',                  'Smartphones, teléfonos móviles, cargadores y accesorios.',     'phone-portrait-outline'),
  ('EQUIPO_DE_SONIDO',         'Equipo de sonido',         'Parlantes, minicomponentes, amplificadores y radios.',         'musical-notes-outline'),
  ('LAPTOP',                   'Laptop',                   'Laptops, netbooks y notebooks.',                               'laptop-outline'),
  ('REFRIGERADORA',            'Refrigeradora',            'Refrigeradoras, congeladoras y exhibidoras.',                  'snow-outline'),
  ('IMPRESORA',                'Impresora',                'Impresoras, multifuncionales y escáneres.',                    'print-outline'),
  ('PEQUENO_ELECTRODOMESTICO', 'Pequeño electrodoméstico', 'Licuadoras, microondas, planchas, freidoras y aspiradoras.',   'flash-outline')
) AS v(tipo, nombre_visible, descripcion, icono_url)
WHERE NOT EXISTS (SELECT 1 FROM categorias_raee c WHERE c.tipo = v.tipo);

UPDATE categorias_raee c SET icono_url = v.icono
FROM (VALUES
  ('TELEVISOR','tv-outline'),('LAPTOP','laptop-outline'),('CELULAR','phone-portrait-outline'),
  ('REFRIGERADORA','snow-outline'),('IMPRESORA','print-outline'),('TABLET','tablet-portrait-outline'),
  ('EQUIPO_DE_SONIDO','musical-notes-outline'),('PEQUENO_ELECTRODOMESTICO','flash-outline')
) AS v(tipo, icono)
WHERE c.tipo = v.tipo AND c.icono_url IS DISTINCT FROM v.icono;

-- ---------------------------------------------------------------------
-- 2) municipalidad (ids 1..12 en este orden, igual que la app móvil)
-- ---------------------------------------------------------------------
INSERT INTO municipalidad (nombre, distrito, direccion, latitud, longitud, contacto_email, activo, campanas_habilitadas)
SELECT v.nombre, v.distrito, v.direccion, v.latitud, v.longitud, v.contacto_email, TRUE, v.campanas
FROM (VALUES
  ( 1, 'Municipalidad Provincial de Chiclayo',           'Chiclayo',              'Plaza de Armas de Chiclayo, Chiclayo',      -6.7714, -79.8409, 'chiclayo@raee.com',     TRUE),
  ( 2, 'Municipalidad Distrital de José Leonardo Ortiz', 'José Leonardo Ortiz',   'Plaza de Armas de José Leonardo Ortiz',     -6.7600, -79.8370, 'jlo@raee.com',          TRUE),
  ( 3, 'Municipalidad Distrital de La Victoria',         'La Victoria',           'Plaza de Armas de La Victoria',             -6.7810, -79.8320, 'lavictoria@raee.com',   TRUE),
  ( 4, 'Municipalidad Distrital de Pimentel',            'Pimentel',              'Plaza de Armas de Pimentel',                -6.8369, -79.9340, 'pimentel@raee.com',     TRUE),
  ( 5, 'Municipalidad Distrital de Santa Rosa',          'Santa Rosa',            'Plaza de Armas de Santa Rosa',              -6.8667, -79.9500, 'santarosa@raee.com',    FALSE),
  ( 6, 'Municipalidad Distrital de Monsefú',             'Monsefú',               'Plaza de Armas de Monsefú',                 -6.8767, -79.8692, 'monsefu@raee.com',      FALSE),
  ( 7, 'Municipalidad Distrital de Reque',               'Reque',                 'Plaza de Armas de Reque',                   -6.8631, -79.8211, 'reque@raee.com',        FALSE),
  ( 8, 'Municipalidad Distrital de Eten',                'Eten',                  'Plaza de Armas de Eten',                    -6.9072, -79.8644, 'eten@raee.com',         FALSE),
  ( 9, 'Municipalidad Distrital de Puerto Eten',         'Puerto Eten',           'Plaza de Armas de Puerto Eten',             -6.9417, -79.8647, 'puertoeten@raee.com',   FALSE),
  (10, 'Municipalidad Distrital de Pomalca',             'Pomalca',               'Plaza de Armas de Pomalca',                 -6.7667, -79.7833, 'pomalca@raee.com',      FALSE),
  (11, 'Municipalidad Distrital de Tumán',               'Tumán',                 'Plaza de Armas de Tumán',                   -6.7500, -79.7167, 'tuman@raee.com',        FALSE),
  (12, 'Municipalidad Provincial de Lambayeque',         'Lambayeque',            'Plaza de Armas de Lambayeque, Lambayeque',  -6.7011, -79.9067, 'lambayeque@raee.com',   TRUE)
) AS v(orden, nombre, distrito, direccion, latitud, longitud, contacto_email, campanas)
WHERE NOT EXISTS (SELECT 1 FROM municipalidad m WHERE m.nombre = v.nombre)
ORDER BY v.orden;

-- ---------------------------------------------------------------------
-- 3) puntos_recoleccion (puntos principales: p1-p12, p23 y p24 de la app)
-- ---------------------------------------------------------------------
INSERT INTO puntos_recoleccion (municipalidad_id, nombre, direccion, latitud, longitud, horario_atencion, capacidad_diaria)
SELECT m.id, v.nombre, v.direccion, v.latitud, v.longitud, v.horario_atencion, v.capacidad_diaria
FROM (VALUES
  ('Municipalidad Provincial de Chiclayo',           'Municipalidad de Chiclayo',              'Plaza de Armas de Chiclayo, Chiclayo',       -6.7714, -79.8409, 'Lunes a viernes · 8:00 a 16:30',            80),
  ('Municipalidad Distrital de José Leonardo Ortiz', 'Municipalidad de José Leonardo Ortiz',   'Plaza de Armas de José Leonardo Ortiz',      -6.7600, -79.8370, 'Lunes a viernes · 8:00 a 16:30',            60),
  ('Municipalidad Distrital de La Victoria',         'Municipalidad de La Victoria',           'Plaza de Armas de La Victoria',              -6.7810, -79.8320, 'Lunes a viernes · 8:00 a 15:00',            50),
  ('Municipalidad Distrital de Pimentel',            'Municipalidad de Pimentel',              'Plaza de Armas de Pimentel',                 -6.8369, -79.9340, 'Lunes a sábado · 9:00 a 17:00',             55),
  ('Municipalidad Distrital de Santa Rosa',          'Municipalidad de Santa Rosa',            'Plaza de Armas de Santa Rosa',               -6.8667, -79.9500, 'Lunes a sábado · 10:00 a 18:00',            45),
  ('Municipalidad Distrital de Monsefú',             'Municipalidad de Monsefú',               'Plaza de Armas de Monsefú',                  -6.8767, -79.8692, 'Lunes a sábado · 9:00 a 17:00',             50),
  ('Municipalidad Distrital de Reque',               'Municipalidad de Reque',                 'Plaza de Armas de Reque',                    -6.8631, -79.8211, 'Martes, jueves y sábado · 9:00 a 13:00',    40),
  ('Municipalidad Distrital de Eten',                'Municipalidad de Eten',                  'Plaza de Armas de Eten',                     -6.9072, -79.8644, 'Lunes a viernes · 8:30 a 16:30',            35),
  ('Municipalidad Distrital de Puerto Eten',         'Municipalidad de Puerto Eten',           'Plaza de Armas de Puerto Eten',              -6.9417, -79.8647, 'Lunes a viernes · 8:30 a 16:30',            30),
  ('Municipalidad Distrital de Pomalca',             'Municipalidad de Pomalca',               'Plaza de Armas de Pomalca',                  -6.7667, -79.7833, 'Lunes a viernes · 8:00 a 15:00',            40),
  ('Municipalidad Distrital de Tumán',               'Municipalidad de Tumán',                 'Plaza de Armas de Tumán',                    -6.7500, -79.7167, 'Lunes a viernes · 8:00 a 15:00',            35),
  ('Municipalidad Provincial de Lambayeque',         'Municipalidad Provincial de Lambayeque', 'Plaza de Armas de Lambayeque, Lambayeque',   -6.7011, -79.9067, 'Lunes a viernes · 8:00 a 16:00',            70),
  ('Municipalidad Provincial de Lambayeque',         'Universidad Nacional Pedro Ruiz Gallo',  'Av. Juan XXIII 391, Lambayeque',             -6.7046, -79.9065, 'Lunes a viernes · horario por confirmar',   50),
  ('Municipalidad Provincial de Lambayeque',         'Museo Tumbas Reales de Sipán',           'Av. Juan Pablo Vizcardo y Guzmán 895, Lambayeque', -6.7017, -79.9069, 'Horario por confirmar',           50)
) AS v(muni, nombre, direccion, latitud, longitud, horario_atencion, capacidad_diaria)
JOIN municipalidad m ON m.nombre = v.muni
WHERE NOT EXISTS (
  SELECT 1 FROM puntos_recoleccion p
  WHERE p.municipalidad_id = m.id AND p.nombre = v.nombre
);

-- ---------------------------------------------------------------------
-- 4) campanas (fechas relativas a hoy para que siempre estén vigentes)
-- ---------------------------------------------------------------------
INSERT INTO campanas (municipalidad_id, titulo, descripcion, lugar, horario, fecha_inicio, fecha_fin, activa, fecha_creacion)
SELECT m.id, v.titulo, v.descripcion, v.lugar, v.horario,
       CURRENT_DATE + v.ini, CURRENT_DATE + v.fin, TRUE, NOW()
FROM (VALUES
  ('Municipalidad Provincial de Chiclayo', 'Campaña de Reciclaje Electrónico Chiclayo',
     'Entrega tus aparatos eléctricos y electrónicos en desuso y recibe tu certificado digital.',
     'Plaza de Armas de Chiclayo', 'Sáb y Dom 09:00 - 17:00', -3, 27),
  ('Municipalidad Provincial de Chiclayo', 'Eco-Mercado: RAEE en el Mercado Modelo',
     'Módulo móvil de recepción de celulares, cargadores y pequeños electrodomésticos.',
     'Zona Mercado Modelo, Chiclayo', 'Lun a Sáb 08:00 - 14:00', 5, 35),
  ('Municipalidad Distrital de José Leonardo Ortiz', 'JLO Recicla Tecnología',
     'Recolección de RAEE en el distrito con apoyo de brigadas municipales.',
     'Plaza de Armas de José Leonardo Ortiz', 'Lun a Vie 09:00 - 15:00', 0, 30),
  ('Municipalidad Distrital de La Victoria', 'La Victoria Libre de Basura Electrónica',
     'Jornada distrital de acopio de computadoras, televisores y electrodomésticos.',
     'Plaza de Armas de La Victoria', 'Sáb 09:00 - 16:00', 2, 32),
  ('Municipalidad Distrital de Pimentel', 'Pimentel Verde: Recicla tus Electrónicos',
     'Acopio de RAEE para cuidar el litoral y el malecón de Pimentel.',
     'Plaza de Armas de Pimentel', 'Sáb y Dom 09:00 - 17:00', 7, 37),
  ('Municipalidad Provincial de Lambayeque', 'Lambayeque Recicla en la UNPRG',
     'Acopio de RAEE en la Universidad Nacional Pedro Ruiz Gallo para estudiantes y vecinos.',
     'Universidad Nacional Pedro Ruiz Gallo', 'Lun a Vie 09:00 - 15:00', 3, 33)
) AS v(muni, titulo, descripcion, lugar, horario, ini, fin)
JOIN municipalidad m ON m.nombre = v.muni
WHERE NOT EXISTS (
  SELECT 1 FROM campanas c
  WHERE c.municipalidad_id = m.id AND c.titulo = v.titulo
);

-- ---------------------------------------------------------------------
-- 5) usuario  (contraseñas con BCrypt, igual que el backend)
--
--   Ciudadano de prueba (app móvil):  vecino@raee.com          / 123456
--   Super admin:                      admin@raee.com           / 123456
--   Admin por municipalidad:          admin.<distrito>@raee.com / 123456
--
-- Los admins municipales usan rol ADMIN porque SecurityConfig solo deja
-- entrar a /api/admin/** con ese rol; quedan ligados a su municipalidad_id.
-- ---------------------------------------------------------------------
INSERT INTO usuario (nombre, email, password, telefono, dni, rol_usuario, fecha_registro, municipalidad_id)
SELECT v.nombre, v.email, v.password, v.telefono, v.dni, v.rol, NOW(), m.id
FROM (VALUES
  ('Carlos Alberto Ramírez', 'vecino@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '987654321', '76543210', 'CIUDADANO', NULL),
  ('Administrador RAEE Smart', 'admin@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', NULL),
  ('Admin Municipalidad de Chiclayo',              'admin.chiclayo@raee.com',    '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Provincial de Chiclayo'),
  ('Admin Municipalidad de José Leonardo Ortiz',   'admin.jlo@raee.com',         '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de José Leonardo Ortiz'),
  ('Admin Municipalidad de La Victoria',           'admin.lavictoria@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de La Victoria'),
  ('Admin Municipalidad de Pimentel',              'admin.pimentel@raee.com',    '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Pimentel'),
  ('Admin Municipalidad de Santa Rosa',            'admin.santarosa@raee.com',   '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Santa Rosa'),
  ('Admin Municipalidad de Monsefú',               'admin.monsefu@raee.com',     '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Monsefú'),
  ('Admin Municipalidad de Reque',                 'admin.reque@raee.com',       '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Reque'),
  ('Admin Municipalidad de Eten',                  'admin.eten@raee.com',        '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Eten'),
  ('Admin Municipalidad de Puerto Eten',           'admin.puertoeten@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Puerto Eten'),
  ('Admin Municipalidad de Pomalca',               'admin.pomalca@raee.com',     '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Pomalca'),
  ('Admin Municipalidad de Tumán',                 'admin.tuman@raee.com',       '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Distrital de Tumán'),
  ('Admin Municipalidad de Lambayeque',            'admin.lambayeque@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', 'Municipalidad Provincial de Lambayeque')
) AS v(nombre, email, password, telefono, dni, rol, muni)
LEFT JOIN municipalidad m ON m.nombre = v.muni
WHERE NOT EXISTS (SELECT 1 FROM usuario u WHERE u.email = v.email);

COMMIT;

-- Verificación rápida
-- SELECT id, nombre FROM municipalidad ORDER BY id;
-- SELECT m.distrito, COUNT(p.id) AS puntos FROM municipalidad m LEFT JOIN puntos_recoleccion p ON p.municipalidad_id = m.id GROUP BY m.distrito;
-- SELECT email, rol_usuario, municipalidad_id FROM usuario ORDER BY id;
