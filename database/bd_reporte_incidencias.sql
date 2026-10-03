-- Reportes_UNU - Script limpio
-- BD: reporte_incidencias | utf8mb4
-- Nota: estudiante simula el API externa de la UNU (sin FK). codigo_estudiante es referencia logica al API. sessions queda vacia, la crea el backend.

CREATE DATABASE IF NOT EXISTS reporte_incidencias DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE reporte_incidencias;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reaccion;
DROP TABLE IF EXISTS reporte;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS estudiante;
DROP TABLE IF EXISTS trabajador;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS estado;
DROP TABLE IF EXISTS tipo_problema;
DROP TABLE IF EXISTS ubicacion;

-- Catalogos
CREATE TABLE estado (
  id_estado INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_estado),
  UNIQUE KEY uq_estado_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rol (
  id_rol INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_rol_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tipo_problema (
  id_tipo_problema INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_tipo_problema),
  UNIQUE KEY uq_tipo_problema_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ubicacion (
  id_ubicacion INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  PRIMARY KEY (id_ubicacion),
  UNIQUE KEY uq_ubicacion_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal interno
CREATE TABLE trabajador (
  id_trabajador INT NOT NULL AUTO_INCREMENT,
  dni VARCHAR(15) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  activo TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (id_trabajador),
  UNIQUE KEY uq_trabajador_dni (dni)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario (
  id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(45) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  id_trabajador INT DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_codigo (codigo),
  KEY idx_usuario_rol (id_rol),
  KEY idx_usuario_trabajador (id_trabajador),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol),
  CONSTRAINT fk_usuario_trabajador FOREIGN KEY (id_trabajador) REFERENCES trabajador (id_trabajador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alumnos (API simulada, sin FK hacia ni desde otras tablas)
CREATE TABLE estudiante (
  id_estudiante INT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100) NOT NULL,
  dni VARCHAR(15) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  escuela VARCHAR(150) NOT NULL,
  facultad VARCHAR(150) NOT NULL,
  codigo VARCHAR(45) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_estudiante),
  UNIQUE KEY uq_estudiante_codigo (codigo),
  UNIQUE KEY uq_estudiante_dni (dni)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reportes (codigo_estudiante = referencia logica al API, sin FK)
CREATE TABLE reporte (
  id_reporte INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  descripcion VARCHAR(1000) NOT NULL,
  foto_url VARCHAR(255) NOT NULL,
  fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_edicion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cantidad_reacciones INT NOT NULL DEFAULT 0,
  id_estado INT NOT NULL,
  codigo_estudiante VARCHAR(45) NOT NULL,
  id_tipo_problema INT NOT NULL,
  id_ubicacion INT NOT NULL,
  id_usuario INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id_reporte),
  KEY idx_reporte_estado (id_estado),
  KEY idx_reporte_codigo_est (codigo_estudiante),
  KEY idx_reporte_tipo (id_tipo_problema),
  KEY idx_reporte_ubicacion (id_ubicacion),
  KEY fk_reporte_usuario (id_usuario),
  CONSTRAINT fk_reporte_estado FOREIGN KEY (id_estado) REFERENCES estado (id_estado),
  CONSTRAINT fk_reporte_tipo_problema FOREIGN KEY (id_tipo_problema) REFERENCES tipo_problema (id_tipo_problema),
  CONSTRAINT fk_reporte_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES ubicacion (id_ubicacion),
  CONSTRAINT fk_reporte_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reaccion (
  id_reaccion INT NOT NULL AUTO_INCREMENT,
  codigo_estudiante VARCHAR(45) NOT NULL,
  id_reporte INT NOT NULL,
  `like` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (id_reaccion),
  UNIQUE KEY uq_reaccion_codigo_reporte (codigo_estudiante, id_reporte),
  KEY idx_reaccion_reporte (id_reporte),
  CONSTRAINT fk_reaccion_reporte FOREIGN KEY (id_reporte) REFERENCES reporte (id_reporte) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sesiones (la usa express-mysql-session, queda vacia)
CREATE TABLE sessions (
  session_id VARCHAR(128) NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT,
  PRIMARY KEY (session_id),
  KEY idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos
INSERT INTO estado VALUES
(1,'Pendiente'),
(2,'Aceptado'),
(3,'Resuelto');

INSERT INTO rol VALUES
(1,'Supervisor'),
(2,'Administrador');

INSERT INTO tipo_problema VALUES
(1,'Infraestructura'),
(2,'Mobiliario'),
(3,'Equipos Electrónicos'),
(4,'Instalaciones Eléctricas'),
(5,'Instalaciones Sanitarias'),
(6,'Áreas Verdes'),
(7,'Seguridad'),
(8,'Limpieza');

INSERT INTO ubicacion VALUES
(1,'Pabellón 1'),
(2,'Pabellón 2'),
(3,'Pabellón 3'),
(4,'Pabellón 4'),
(5,'Pabellón 5'),
(6,'Pabellón 6'),
(7,'Pabellón 7'),
(8,'FACULTAD DE INGENIERÍA DE SISTEMAS Y DE INGENIERÍA CIVIL'),
(9,'FACULTAD DE MEDICINA HUMANA'),
(10,'FACULTAD DE DERECHO Y CIENCIAS POLITICAS'),
(11,'FACULTAD DE CIENCIAS ECONOMICAS, ADMINISTRATIVAS Y CONTABLES'),
(12,'FACULTAD DE CIENCIAS AGROPECUARIAS'),
(13,'FACULTAD DE CIENCIAS FORESTALES Y AMBIENTALES'),
(14,'FACULTAD DE EDUCACIÓN Y CIENCIAS SOCIALES'),
(15,'FACULTAD DE CIENCIAS DE LA SALUD'),
(16,'Estacionamiento 1'),
(17,'Estacionamiento 2'),
(18,'Estacionamiento 3'),
(19,'Estacionamiento 4'),
(20,'Estacionamiento 5'),
(21,'Estacionamiento 6'),
(22,'Estacionamiento 7'),
(23,'Estacionamiento 8'),
(24,'Biblioteca'),
(25,'AUDITORIO GENERAL'),
(26,'Motelito'),
(27,'Campo Deportivo'),
(28,'COMEDOR');

INSERT INTO trabajador VALUES
(1,'45896321','Jorge Luis','Ramirez','Vargas','987123456','jorge.ramirez@gmail.com',1),
(2,'47852369','Ana Maria','Torres','Lopez','951753258','ana.torres@gmail.com',1);

INSERT INTO usuario VALUES
(1,'0001111000','$2b$10$vYAT/.Co4YeeuOa.bkIR.O8hqymVlaETaVamXlYPe1q.eUTI.W8QC',1,1),
(2,'0002222000','$2b$10$dXZ0HiOtjltUHwfnKSeNkeNkif/IzfgjdciAgocOe5T/24HvpsF9y',2,2);

INSERT INTO estudiante VALUES
(1,'Pedro Giovanni','Ricra','Figueroa','72684987','922149396','pedro.ricra@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221081','$2b$10$UtxUX3KOUT5lSBwQNYwrI.te8IrqJi2OQip9FxntNoqpVoGMmKfKq'),
(2,'Leonardo Franco','Campos','Inuma','11111111','912345678','leonardo.campos@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221057','$2b$10$T04eZVMm/SWO43uVuzz24uT7Ep4uKyXXDugZKoei87RTuhnGqlNIq'),
(3,'Lenin Oseas','Aponte','Abisrror','22222222','995318921','Yukijira2004@gmail.com','Derecho','Facultad de derecho y ciencias políticas','0002210376','$2b$10$ajb/5PeX956mb7EStDvBuOCU3p5X9D0dJzWiH3tvFHDALvuKIsB9S');

INSERT INTO reporte VALUES
(1,'Grieta en pared del aula','Se observó una grieta en la pared del aula, cerca de la puerta. La fisura es visible y parece haberse extendido con el tiempo. Se solicita inspección técnica para identificar la causa (humedad o asentamiento), aplicar resane/refuerzo y prevenir desprendimientos o filtraciones que afecten la seguridad del ambiente.','/uploads/reportes/VSAiHgnWfVvq0xFYQbbtm9jTRkRhw05b.jpg','2025-02-01 01:01:01','2026-09-30 08:38:32',0,2,'0002221081',1,1,1),
(2,'Sillas dañadas en salón','Varias sillas del salón tienen patas sueltas y estructura inestable; al sentarse se mueven o se ladean. Esto incrementa el riesgo de caídas y lesiones durante clases. Se recomienda retirar las unidades dañadas, ajustar tornillos y uniones, reforzar o reemplazar las que presenten piezas quebradas.','/uploads/reportes/ABTugDDS2E3PQn8ZaB7iWLSOeBEmingi.jpg','2025-03-01 01:01:01','2026-09-30 08:13:54',0,1,'0002221057',2,4,NULL),
(3,'Proyector no enciende','El proyector no enciende al conectarlo y no muestra señal, impidiendo presentaciones. Se requiere revisar cable de poder, adaptador, toma eléctrica y estado del botón/indicadores. Solicitar mantenimiento para diagnóstico (fuente, fusible o falla interna) y reparación o sustitución para restablecer el servicio.','/uploads/reportes/ZVwEZ6xtDKMjfc4qqADFnUwDqmNIwEeG.jpg','2025-03-01 01:01:01','2025-12-30 23:18:06',1,3,'0002221057',3,7,1),
(4,'Tomacorriente chispea','Al usar el tomacorriente, se producen chispas al conectar un cargador, indicando posible falso contacto o deterioro interno. Es un riesgo eléctrico y puede dañar equipos o causar cortocuitos. Se pide deshabilitarlo y señalizarlo de inmediato, reemplazar el punto y realizar pruebas de seguridad antes de habilitarlo.','/uploads/reportes/YF5QG8zfT6SOZfqbhB3oejSKvJkeKDgS.jpg','2025-05-01 01:01:01','2026-09-30 08:13:54',0,1,'0002221081',4,10,NULL),
(5,'Falta limpieza en pasillo','En el pasillo hay basura acumulada y mal olor persistente, afectando la higiene y el tránsito. Se solicita limpieza inmediata, retiro de residuos y desinfección si corresponde. Además, reforzar la frecuencia de mantenimiento y verificar la colocación de tachos para evitar que el problema se repita.','/uploads/reportes/VvpxtpliAr7o7VP5PehdlTSEtJHQBBC8.jpg','2025-06-01 01:01:01','2026-09-30 08:13:54',2,1,'0002210376',8,13,NULL),
(6,'Puerta del aula desajustada','La puerta del aula no cierra correctamente y presenta dificultad al abrir y cerrar, generando ruidos y riesgo de golpes en los usuarios. El problema podría deberse a desgaste de bisagras o desalineación del marco. Se solicita revisión técnica, ajuste o reemplazo de herrajes para garantizar un uso seguro.','/uploads/reportes/FlpxL8jcadGMHAf4LcZKMEET9FEEIxn7.jpg','2025-06-01 01:01:01','2026-09-30 08:42:44',3,2,'0002221057',1,16,2),
(7,'Ventilador con ruido excesivo','El ventilador del aula emite ruidos anormales durante su funcionamiento, lo que distrae a los estudiantes y podría indicar desgaste del motor o aspas desbalanceadas. Se recomienda inspección técnica, mantenimiento correctivo o reemplazo del equipo si corresponde.','/uploads/reportes/xSRFmtyKBboCHZbeUUxi30l7NPdNXWy3.jpg','2025-08-01 01:01:01','2025-12-17 20:04:15',0,3,'0002221081',3,19,1),
(8,'Luminaria parpadeante','Una de las luminarias del aula presenta parpadeo constante, afectando la visibilidad y provocando incomodidad visual. El problema podría estar relacionado con el balasto, cableado o el foco. Se solicita revisión eléctrica y reemplazo de componentes defectuosos.','/uploads/reportes/d0hXsBnTDcjuCq3cqQAItMqx2hF4QbVn.jpg','2025-08-01 01:01:01','2026-09-30 08:38:38',0,2,'0002221057',4,22,2),
(9,'Pizarra deteriorada','La pizarra del aula se encuentra rayada y con la superficie desgastada, dificultando la correcta escritura y lectura del contenido. Se recomienda evaluar su restauración o reemplazo por una nueva para garantizar condiciones adecuadas de enseñanza.','/uploads/reportes/wNptORIjJ1TBynyfETENwYfaGkfFOErU.jpg','2025-10-01 01:01:01','2026-09-30 08:13:54',1,1,'0002210376',2,25,NULL),
(10,'Enchufe flojo en pared','Se detectó un enchufe flojo en la pared del aula, el cual presenta movimiento al conectar dispositivos. Esto representa un riesgo eléctrico y posible daño a los equipos. Se solicita reparación inmediata, asegurando la correcta fijación y funcionamiento del tomacorriente.','/uploads/reportes/KyAUh3lxRfiBXFHuCZSYWyL8L13RbIzw.jpg','2025-12-01 01:01:01','2025-12-13 11:16:39',0,3,'0002221081',4,27,2),
(11,'Baño sin agua','En los servicios higienicos no sale agua del lavamanos y el inodoro presenta poca carga. Se solicita revisar el suministro, llaves de paso y posibles obstrucciones para restablecer el servicio y evitar malos olores.','/uploads/reportes/6Qp3nL8mVt2aZx1cK9rJH0uEwY5bD7sF.jpg','2026-01-07 10:15:00','2026-01-07 10:15:00',2,1,'0002221057',5,24,NULL),
(12,'Luz apagada pasillo','Un tramo del pasillo permanece sin iluminacion durante la tarde. Se requiere revisar foco, balasto o cableado para evitar zonas oscuras y mejorar la seguridad en el transito.','/uploads/reportes/hK2sP9vQm3Xc8Lw1Zr6aT0nYb5D7uE4G.jpg','2026-01-07 12:05:00','2026-01-07 14:20:00',3,2,'0002221057',4,1,1),
(13,'Extintor vencido','Se identifico un extintor con etiqueta de inspeccion vencida. Solicito verificacion del equipo, recarga o reemplazo segun corresponda, y actualizacion del control de seguridad.','/uploads/reportes/R8x1qW4mZt6pN2vL0cK9sY3aD5uE7bH1J.jpg','2026-01-07 15:40:00','2026-09-30 08:13:54',0,1,'0002221081',7,27,NULL),
(14,'Camara sin funcionar','La camara de vigilancia no muestra imagen o aparece en negro. Se solicita revisar energia, conexion y configuracion para recuperar el monitoreo y registrar incidencias.','/uploads/reportes/At5Qn2sL9xR0mV6cK1pZ7wY3dE8uH4bJ.jpg','2026-01-08 09:12:00','2026-01-08 11:30:00',0,3,'0002210376',7,27,2),
(15,'Piso resbaloso','Se observa piso con derrame y suciedad que causa resbalones en el area de transito. Se solicita limpieza inmediata y senalizacion temporal para prevenir caidas.','/uploads/reportes/0mZ7rQ3pL1xV8cK2sY5aD9uE4bH6nJ0T.jpg','2026-01-08 13:55:00','2026-09-30 08:43:13',1,2,'0002221057',8,28,1),
(16,'Computadora no prende','Una computadora del aula no enciende al presionar el boton. Se solicita revisar cable de poder, estabilizador y fuente para diagnostico y reparacion o reemplazo del equipo.','/uploads/reportes/L3pQ7nZ1xV5cK9sR2mY0aD6uE8bH4tJ.jpg','2026-01-08 16:10:00','2026-01-09 08:45:00',0,3,'0002221081',3,8,2),
(17,'Ventana sin seguro','Una ventana presenta seguro dañado y queda abierta con facilidad. Se solicita ajustar o cambiar el seguro para evitar ingreso de lluvia, polvo o riesgo de caidas de piezas.','/uploads/reportes/Vt2aK9rJ0uEw5bD7sF6Qp3nL8mZx1cH.jpg','2026-01-09 09:20:00','2026-01-09 09:20:00',2,1,'0002221057',1,3,NULL),
(18,'Basurero desbordado','Los tachos se encuentran llenos y hay residuos alrededor. Se solicita retiro de basura, desinfeccion y refuerzo de frecuencia de recojo para mantener el area limpia.','/uploads/reportes/9xR0mV6cK1pZ7wY3dE8uH4bJAt5Qn2s.jpg','2026-01-09 10:05:00','2026-01-09 10:30:00',3,2,'0002210376',8,16,1),
(19,'Silla faltante aula','En el aula faltan sillas para los estudiantes y algunas estan en mal estado. Se solicita reposicion y verificacion del mobiliario para asegurar la capacidad del salon.','/uploads/reportes/2sY5aD9uE4bH6nJ0T0mZ7rQ3pL1xV8c.jpg','2026-01-09 11:18:00','2026-09-30 07:59:07',0,3,'0002221081',2,2,1),
(20,'Cable suelto techo','Se aprecia cableado expuesto o suelto cerca del techo. Se solicita asegurar canaletas, revisar conexion y aislar correctamente para prevenir riesgos electricos.','/uploads/reportes/mY0aD6uE8bH4tJL3pQ7nZ1xV5cK9sR2.jpg','2026-01-09 14:02:00','2026-09-30 08:13:54',0,1,'0002221057',4,7,NULL);

INSERT INTO reaccion VALUES
(1,'0002221081',3,1),
(2,'0002221081',5,1),
(3,'0002210376',5,1),
(4,'0002221081',6,1),
(5,'0002221057',6,1),
(6,'0002210376',6,1),
(7,'0002221081',9,1),
(8,'0002221081',11,1),
(9,'0002210376',11,1),
(10,'0002221081',12,1),
(11,'0002221057',12,1),
(12,'0002210376',12,1),
(13,'0002221081',15,1),
(14,'0002221081',17,1),
(15,'0002210376',17,1),
(16,'0002221081',18,1),
(17,'0002221057',18,1),
(18,'0002210376',18,1),
(19,'0002221081',1,0),
(20,'0002221081',8,0),
(21,'0002221057',15,0);

SET FOREIGN_KEY_CHECKS = 1;
