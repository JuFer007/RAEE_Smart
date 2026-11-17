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
     'Universidad Nacional Pedro Ruiz Gallo', 'Lun a Vie 09:00 - 15:00', 3, 33),
  ('Municipalidad Distrital de Santa Rosa', 'Santa Rosa Recicla en Familia',
     'Jornada familiar para entregar aparatos electrónicos en desuso y recibir orientación ambiental.',
     'Plaza de Armas de Santa Rosa', 'Sáb 09:00 - 15:00', 4, 34),
  ('Municipalidad Distrital de Monsefú', 'Monsefú sin RAEE',
     'Campaña distrital para acopiar celulares, tablets y pequeños electrodomésticos.',
     'Plaza de Armas de Monsefú', 'Vie y Sáb 09:00 - 16:00', 6, 36),
  ('Municipalidad Distrital de Reque', 'Reque Recicla',
     'Punto temporal de acopio de RAEE para vecinos y comercios del distrito.',
     'Plaza de Armas de Reque', 'Jue 09:00 - 13:00', 8, 38),
  ('Municipalidad Distrital de Eten', 'Eten Ciudad Limpia',
     'Recolección de equipos eléctricos y electrónicos para reducir la contaminación.',
     'Plaza de Armas de Eten', 'Sáb 08:30 - 14:30', 10, 40),
  ('Municipalidad Distrital de Puerto Eten', 'Puerto Eten Recicla',
     'Jornada de acopio de RAEE en el malecón y la plaza principal del puerto.',
     'Plaza de Armas de Puerto Eten', 'Dom 09:00 - 13:00', 11, 39),
  ('Municipalidad Distrital de Pomalca', 'Pomalca Recicla Tecnología',
     'Acopio de computadoras, impresoras y electrodomésticos en la zona urbana.',
     'Plaza de Armas de Pomalca', 'Lun a Vie 08:00 - 15:00', 2, 31),
  ('Municipalidad Distrital de Tumán', 'Tumán Recicla',
     'Campaña de recepción de RAEE con certificado digital para cada entrega.',
     'Plaza de Armas de Tumán', 'Mié y Vie 09:00 - 15:00', 5, 35)
) AS v(muni, titulo, descripcion, lugar, horario, ini, fin)
JOIN municipalidad m ON m.nombre = v.muni
WHERE NOT EXISTS (
  SELECT 1 FROM campanas c
  WHERE c.municipalidad_id = m.id AND c.titulo = v.titulo
);

-- Vincula las campañas con su punto de entrega cuando el lugar coincide
-- con el nombre o la dirección de un punto de la misma municipalidad.
UPDATE campanas c
SET punto_recoleccion_id = COALESCE(
  (
    SELECT p.id
    FROM puntos_recoleccion p
    WHERE p.municipalidad_id = c.municipalidad_id
      AND (p.nombre = c.lugar
           OR p.direccion = c.lugar
           OR p.direccion LIKE c.lugar || '%'
           OR c.lugar LIKE p.direccion || '%')
    ORDER BY p.id
    LIMIT 1
  ),
  (
    SELECT p.id
    FROM puntos_recoleccion p
    WHERE p.municipalidad_id = c.municipalidad_id
    ORDER BY p.id
    LIMIT 1
  )
)
WHERE c.punto_recoleccion_id IS NULL;

-- ---------------------------------------------------------------------
-- 5) usuario  (contraseñas con BCrypt, igual que el backend)
--
--   Ciudadano de prueba (app móvil):  vecino@raee.com          / 123456
--   Super admin:                      admin@raee.com           / 123456
--   Admin por municipalidad:          admin.<distrito>@raee.com / 123456
--
-- Los admins municipales usan rol MUNICIPALIDAD y quedan ligados a su
-- municipalidad_id; el backend fuerza ese alcance en cada operación.
-- ---------------------------------------------------------------------
INSERT INTO usuario (nombre, email, password, telefono, dni, rol_usuario, fecha_registro, municipalidad_id)
SELECT v.nombre, v.email, v.password, v.telefono, v.dni, v.rol, NOW(), m.id
FROM (VALUES
  ('Carlos Alberto Ramírez', 'vecino@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '987654321', '76543210', 'CIUDADANO', NULL),
  ('María Fernanda Torres', 'maria.torres@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '976543210', '87654321', 'CIUDADANO', NULL),
  ('Luis Alberto Sánchez', 'luis.sanchez@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '965432109', '45678912', 'CIUDADANO', NULL),
  ('Ana Lucía Delgado', 'ana.delgado@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '954321098', '12345678', 'CIUDADANO', NULL),
  ('Jorge Enrique Custodio', 'jorge.custodio@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '943210987', '74185296', 'CIUDADANO', NULL),
  ('Rosa Elena Vásquez', 'rosa.vasquez@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', '932109876', '96325874', 'CIUDADANO', NULL),
  ('Administrador RAEE Smart', 'admin@raee.com', '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'ADMIN', NULL),
  ('Admin Municipalidad de Chiclayo',              'admin.chiclayo@raee.com',    '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Provincial de Chiclayo'),
  ('Admin Municipalidad de José Leonardo Ortiz',   'admin.jlo@raee.com',         '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de José Leonardo Ortiz'),
  ('Admin Municipalidad de La Victoria',           'admin.lavictoria@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de La Victoria'),
  ('Admin Municipalidad de Pimentel',              'admin.pimentel@raee.com',    '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Pimentel'),
  ('Admin Municipalidad de Santa Rosa',            'admin.santarosa@raee.com',   '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Santa Rosa'),
  ('Admin Municipalidad de Monsefú',               'admin.monsefu@raee.com',     '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Monsefú'),
  ('Admin Municipalidad de Reque',                 'admin.reque@raee.com',       '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Reque'),
  ('Admin Municipalidad de Eten',                  'admin.eten@raee.com',        '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Eten'),
  ('Admin Municipalidad de Puerto Eten',           'admin.puertoeten@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Puerto Eten'),
  ('Admin Municipalidad de Pomalca',               'admin.pomalca@raee.com',     '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Pomalca'),
  ('Admin Municipalidad de Tumán',                 'admin.tuman@raee.com',       '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Distrital de Tumán'),
  ('Admin Municipalidad de Lambayeque',            'admin.lambayeque@raee.com',  '$2a$10$800I/8HGwCkjx0iApGb/kevpKOnZ1jp2UjTTWCg9CKaUNKdFhoywa', NULL, NULL, 'MUNICIPALIDAD', 'Municipalidad Provincial de Lambayeque')
) AS v(nombre, email, password, telefono, dni, rol, muni)
LEFT JOIN municipalidad m ON m.nombre = v.muni
WHERE NOT EXISTS (SELECT 1 FROM usuario u WHERE u.email = v.email);

-- Corrige bases creadas con la versión anterior del seed, donde los admins
-- municipales tenían rol ADMIN.
UPDATE usuario
SET rol_usuario = 'MUNICIPALIDAD'
WHERE municipalidad_id IS NOT NULL
  AND rol_usuario = 'ADMIN';

-- Normaliza las preferencias de notificación de usuarios creados con el seed.
UPDATE usuario
SET notificar_push = COALESCE(notificar_push, TRUE),
    notificar_campanas = COALESCE(notificar_campanas, TRUE),
    notificar_entregas = COALESCE(notificar_entregas, TRUE)
WHERE notificar_push IS NULL
   OR notificar_campanas IS NULL
   OR notificar_entregas IS NULL;

-- ---------------------------------------------------------------------
-- 6) entregas (24 registros distribuidos en las 12 municipalidades)
--    foto_url funciona como clave idempotente del seed.
-- ---------------------------------------------------------------------
INSERT INTO entregas (
  usuario_id, tipo_raee, tipo_corregido, punto_recoleccion_id, foto_url,
  confianza_ia, clasificacion_corregida, latitud_usuario, longitud_usuario,
  estado, fecha_registro, fecha_confirmacion
)
SELECT u.id,
       v.tipo_raee,
       CASE WHEN v.corregida THEN v.tipo_corregido ELSE NULL END,
       p.id,
       v.foto_url,
       v.confianza,
       v.corregida,
       p.latitud,
       p.longitud,
       v.estado,
       NOW() - make_interval(days => v.dias_atras),
       CASE WHEN v.estado = 'CONFIRMADA'
            THEN NOW() - make_interval(days => v.dias_atras) + interval '3 hours'
            ELSE NULL END
FROM (VALUES
  ('/uploads/raee-smart/seed/entrega-01.jpg', 'vecino@raee.com',        'Municipalidad de Chiclayo',              'TELEVISOR',                NULL,      0.94, 'CONFIRMADA', 12, FALSE),
  ('/uploads/raee-smart/seed/entrega-02.jpg', 'maria.torres@raee.com',  'Municipalidad de Chiclayo',              'CELULAR',                  NULL,      0.89, 'CONFIRMADA',  9, FALSE),
  ('/uploads/raee-smart/seed/entrega-03.jpg', 'luis.sanchez@raee.com',  'Municipalidad de Chiclayo',              'LAPTOP',                   NULL,      0.91, 'EN_PROCESO',  2, FALSE),
  ('/uploads/raee-smart/seed/entrega-04.jpg', 'ana.delgado@raee.com',   'Municipalidad de Chiclayo',              'IMPRESORA',                NULL,      0.78, 'REGISTRADA',  1, FALSE),
  ('/uploads/raee-smart/seed/entrega-05.jpg', 'jorge.custodio@raee.com','Municipalidad de José Leonardo Ortiz',   'REFRIGERADORA',            NULL,      0.96, 'CONFIRMADA', 15, FALSE),
  ('/uploads/raee-smart/seed/entrega-06.jpg', 'rosa.vasquez@raee.com',  'Municipalidad de José Leonardo Ortiz',   'EQUIPO_DE_SONIDO',         NULL,      0.72, 'RECHAZADA',   6, FALSE),
  ('/uploads/raee-smart/seed/entrega-07.jpg', 'vecino@raee.com',        'Municipalidad de José Leonardo Ortiz',   'PEQUENO_ELECTRODOMESTICO', NULL,      0.83, 'CONFIRMADA', 20, FALSE),
  ('/uploads/raee-smart/seed/entrega-08.jpg', 'maria.torres@raee.com',  'Municipalidad de La Victoria',           'TABLET',                   NULL,      0.88, 'CONFIRMADA', 11, FALSE),
  ('/uploads/raee-smart/seed/entrega-09.jpg', 'luis.sanchez@raee.com',  'Municipalidad de La Victoria',           'TELEVISOR',                'LAPTOP',  0.61, 'CONFIRMADA',  8, TRUE),
  ('/uploads/raee-smart/seed/entrega-10.jpg', 'ana.delgado@raee.com',   'Municipalidad de La Victoria',           'CELULAR',                  NULL,      0.93, 'REGISTRADA',  0, FALSE),
  ('/uploads/raee-smart/seed/entrega-11.jpg', 'jorge.custodio@raee.com','Municipalidad de Pimentel',              'LAPTOP',                   NULL,      0.86, 'CONFIRMADA', 18, FALSE),
  ('/uploads/raee-smart/seed/entrega-12.jpg', 'rosa.vasquez@raee.com',  'Municipalidad de Pimentel',              'CELULAR',                  NULL,      0.81, 'EN_PROCESO',  3, FALSE),
  ('/uploads/raee-smart/seed/entrega-13.jpg', 'vecino@raee.com',        'Municipalidad de Santa Rosa',            'REFRIGERADORA',            NULL,      0.97, 'CONFIRMADA', 25, FALSE),
  ('/uploads/raee-smart/seed/entrega-14.jpg', 'maria.torres@raee.com',  'Municipalidad de Monsefú',               'IMPRESORA',                NULL,      0.69, 'RECHAZADA',  10, FALSE),
  ('/uploads/raee-smart/seed/entrega-15.jpg', 'luis.sanchez@raee.com',  'Municipalidad de Reque',                 'TELEVISOR',                NULL,      0.90, 'CONFIRMADA', 14, FALSE),
  ('/uploads/raee-smart/seed/entrega-16.jpg', 'ana.delgado@raee.com',   'Municipalidad de Eten',                  'TABLET',                   NULL,      0.84, 'CONFIRMADA', 22, FALSE),
  ('/uploads/raee-smart/seed/entrega-17.jpg', 'jorge.custodio@raee.com','Municipalidad de Puerto Eten',           'PEQUENO_ELECTRODOMESTICO', NULL,      0.79, 'EN_PROCESO',  4, FALSE),
  ('/uploads/raee-smart/seed/entrega-18.jpg', 'rosa.vasquez@raee.com',  'Municipalidad de Pomalca',               'EQUIPO_DE_SONIDO',         NULL,      0.92, 'CONFIRMADA', 16, FALSE),
  ('/uploads/raee-smart/seed/entrega-19.jpg', 'vecino@raee.com',        'Municipalidad de Tumán',                 'CELULAR',                  NULL,      0.87, 'CONFIRMADA',  7, FALSE),
  ('/uploads/raee-smart/seed/entrega-20.jpg', 'maria.torres@raee.com',  'Universidad Nacional Pedro Ruiz Gallo',  'LAPTOP',                   NULL,      0.95, 'CONFIRMADA', 13, FALSE),
  ('/uploads/raee-smart/seed/entrega-21.jpg', 'luis.sanchez@raee.com',  'Museo Tumbas Reales de Sipán',           'TELEVISOR',                NULL,      0.88, 'REGISTRADA',  1, FALSE),
  ('/uploads/raee-smart/seed/entrega-22.jpg', 'ana.delgado@raee.com',   'Municipalidad Provincial de Lambayeque', 'IMPRESORA',                NULL,      0.74, 'CONFIRMADA', 19, FALSE),
  ('/uploads/raee-smart/seed/entrega-23.jpg', 'jorge.custodio@raee.com','Municipalidad de Chiclayo',              'REFRIGERADORA',            NULL,      0.66, 'RECHAZADA',   5, FALSE),
  ('/uploads/raee-smart/seed/entrega-24.jpg', 'rosa.vasquez@raee.com',  'Municipalidad de Chiclayo',              'EQUIPO_DE_SONIDO',         'CELULAR', 0.58, 'CONFIRMADA',  4, TRUE)
) AS v(foto_url, email, punto, tipo_raee, tipo_corregido, confianza, estado, dias_atras, corregida)
JOIN usuario u ON u.email = v.email
JOIN puntos_recoleccion p ON p.nombre = v.punto
WHERE NOT EXISTS (
  SELECT 1 FROM entregas e WHERE e.foto_url = v.foto_url
);

-- ---------------------------------------------------------------------
-- 7) reportes_ia (una inferencia por cada entrega del seed)
-- ---------------------------------------------------------------------
INSERT INTO reportes_ia (entrega_id, version_modelo, prediccion_top1, confianza, tiempo_inferencia_ms)
SELECT e.id,
       'raee-classifier-v1.4',
       e.tipo_raee,
       e.confianza_ia,
       (120 + (e.id % 280))::integer
FROM entregas e
WHERE e.foto_url LIKE '/uploads/raee-smart/seed/entrega-%'
  AND NOT EXISTS (
    SELECT 1 FROM reportes_ia r WHERE r.entrega_id = e.id
  );

-- ---------------------------------------------------------------------
-- 8) certificados (solo para entregas confirmadas del seed)
-- ---------------------------------------------------------------------
INSERT INTO certificados (entrega_id, codigo_qr, codigo_hash, fecha_emision)
SELECT e.id,
       'http://localhost:8080/api/certificados/verificar/SEED-CERT-' || LPAD(e.id::text, 6, '0'),
       'SEED-CERT-' || LPAD(e.id::text, 6, '0'),
       COALESCE(e.fecha_confirmacion, e.fecha_registro) + interval '5 minutes'
FROM entregas e
WHERE e.foto_url LIKE '/uploads/raee-smart/seed/entrega-%'
  AND e.estado = 'CONFIRMADA'
  AND NOT EXISTS (
    SELECT 1 FROM certificados c WHERE c.entrega_id = e.id
  );

-- ---------------------------------------------------------------------
-- 9) notificaciones (bienvenida, campañas, entregas y horarios)
-- ---------------------------------------------------------------------
INSERT INTO notificaciones (usuario_id, titulo, detalle, tipo, leida, fecha_creacion)
SELECT u.id,
       'Bienvenido a RAEE Smart',
       'Tu cuenta está activa. Desde aquí puedes gestionar tus entregas y recibir novedades.',
       'GENERAL',
       FALSE,
       NOW() - interval '30 days'
FROM usuario u
WHERE NOT EXISTS (
  SELECT 1 FROM notificaciones n
  WHERE n.usuario_id = u.id AND n.titulo = 'Bienvenido a RAEE Smart'
);

INSERT INTO notificaciones (usuario_id, titulo, detalle, tipo, leida, fecha_creacion)
SELECT u.id,
       c.titulo,
       'Nueva campaña de acopio en ' || COALESCE(c.lugar, 'tu distrito') ||
       '. Horario: ' || COALESCE(c.horario, 'por confirmar') || '.',
       'CAMPANA',
       FALSE,
       NOW() - interval '2 days'
FROM usuario u
CROSS JOIN campanas c
WHERE u.rol_usuario = 'CIUDADANO'
  AND c.activa = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.usuario_id = u.id AND n.titulo = c.titulo
  );

INSERT INTO notificaciones (usuario_id, titulo, detalle, tipo, leida, fecha_creacion)
SELECT e.usuario_id,
       'Entrega #' || LPAD(e.id::text, 4, '0') || ' ' ||
       CASE e.estado
         WHEN 'CONFIRMADA' THEN 'confirmada'
         WHEN 'RECHAZADA' THEN 'rechazada'
         WHEN 'EN_PROCESO' THEN 'en revisión'
         ELSE 'registrada'
       END,
       CASE e.estado
         WHEN 'CONFIRMADA' THEN 'La recepción en ' || p.nombre || ' fue confirmada. Tu certificado digital ya está disponible.'
         WHEN 'RECHAZADA' THEN 'La recepción en ' || p.nombre || ' fue rechazada. Acércate al punto para más información.'
         WHEN 'EN_PROCESO' THEN 'Tu entrega en ' || p.nombre || ' está siendo revisada por la municipalidad.'
         ELSE 'Tu entrega en ' || p.nombre || ' fue registrada y está pendiente de revisión.'
       END,
       'ENTREGA',
       e.fecha_registro < NOW() - interval '7 days',
       e.fecha_registro + interval '5 minutes'
FROM entregas e
JOIN puntos_recoleccion p ON p.id = e.punto_recoleccion_id
WHERE e.foto_url LIKE '/uploads/raee-smart/seed/entrega-%'
  AND NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.usuario_id = e.usuario_id
      AND n.titulo LIKE 'Entrega #' || LPAD(e.id::text, 4, '0') || '%'
  );

INSERT INTO notificaciones (usuario_id, titulo, detalle, tipo, leida, fecha_creacion)
SELECT a.id,
       'Entrega #' || LPAD(e.id::text, 4, '0') || ' en ' || p.nombre,
       'Se registró una entrega de ' || c.nombre_visible || ' en ' || p.nombre ||
       '. Estado actual: ' || e.estado || '.',
       'ENTREGA',
       e.fecha_registro < NOW() - interval '7 days',
       e.fecha_registro + interval '2 minutes'
FROM entregas e
JOIN puntos_recoleccion p ON p.id = e.punto_recoleccion_id
JOIN usuario a ON a.municipalidad_id = p.municipalidad_id
               AND a.rol_usuario = 'MUNICIPALIDAD'
JOIN categorias_raee c ON c.tipo = COALESCE(e.tipo_corregido, e.tipo_raee)
WHERE e.foto_url LIKE '/uploads/raee-smart/seed/entrega-%'
  AND NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.usuario_id = a.id
      AND n.titulo = 'Entrega #' || LPAD(e.id::text, 4, '0') || ' en ' || p.nombre
  );

UPDATE usuario
SET notificar_recordatorios = TRUE
WHERE email = 'vecino@raee.com'
  AND notificar_recordatorios IS NOT TRUE;

INSERT INTO notificaciones (usuario_id, titulo, detalle, tipo, leida, fecha_creacion)
SELECT u.id,
       'Horario de atención actualizado',
       'El punto Municipalidad de Chiclayo atiende de lunes a viernes de 8:00 a 16:30.',
       'HORARIO',
       TRUE,
       NOW() - interval '7 days'
FROM usuario u
WHERE u.email = 'vecino@raee.com'
  AND NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.usuario_id = u.id AND n.titulo = 'Horario de atención actualizado'
  );

COMMIT;

-- Verificación rápida
-- SELECT id, nombre FROM municipalidad ORDER BY id;
-- SELECT m.distrito, COUNT(p.id) AS puntos FROM municipalidad m LEFT JOIN puntos_recoleccion p ON p.municipalidad_id = m.id GROUP BY m.distrito;
-- SELECT email, rol_usuario, municipalidad_id FROM usuario ORDER BY id;
