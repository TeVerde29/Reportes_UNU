-- BD: crearla en el panel de TiDB y ejecutar este script dentro de ella
--


--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
CREATE TABLE `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `uq_estado_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estado`
--

INSERT INTO `estado` VALUES (2,'Aceptado'),(1,'Pendiente'),(3,'Resuelto');

--
-- Table structure for table `estudiante`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` VALUES (2,'Administrador'),(1,'Supervisor');

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `tipo_problema`;
CREATE TABLE `tipo_problema` (
  `id_tipo_problema` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_tipo_problema`),
  UNIQUE KEY `uq_tipo_problema_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tipo_problema`
--

INSERT INTO `tipo_problema` VALUES (6,'Áreas Verdes'),(3,'Equipos Electrónicos'),(1,'Infraestructura'),(4,'Instalaciones Eléctricas'),(5,'Instalaciones Sanitarias'),(8,'Limpieza'),(2,'Mobiliario'),(7,'Seguridad');

--
-- Table structure for table `trabajador`
--

DROP TABLE IF EXISTS `ubicacion`;
CREATE TABLE `ubicacion` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `uq_ubicacion_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ubicacion`
--

INSERT INTO `ubicacion` VALUES (25,'AUDITORIO GENERAL'),(24,'Biblioteca'),(27,'Campo Deportivo'),(28,'COMEDOR'),(16,'Estacionamiento 1'),(17,'Estacionamiento 2'),(18,'Estacionamiento 3'),(19,'Estacionamiento 4'),(20,'Estacionamiento 5'),(21,'Estacionamiento 6'),(22,'Estacionamiento 7'),(23,'Estacionamiento 8'),(12,'FACULTAD DE CIENCIAS AGROPECUARIAS'),(15,'FACULTAD DE CIENCIAS DE LA SALUD'),(11,'FACULTAD DE CIENCIAS ECONOMICAS, ADMINISTRATIVAS Y CONTABLES'),(13,'FACULTAD DE CIENCIAS FORESTALES Y AMBIENTALES'),(10,'FACULTAD DE DERECHO Y CIENCIAS POLITICAS'),(14,'FACULTAD DE EDUCACIÓN Y CIENCIAS SOCIALES'),(8,'FACULTAD DE INGENIERÍA DE SISTEMAS Y DE INGENIERÍA CIVIL'),(9,'FACULTAD DE MEDICINA HUMANA'),(26,'Motelito'),(1,'Pabellón 1'),(2,'Pabellón 2'),(3,'Pabellón 3'),(4,'Pabellón 4'),(5,'Pabellón 5'),(6,'Pabellón 6'),(7,'Pabellón 7');

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `trabajador`;
CREATE TABLE `trabajador` (
  `id_trabajador` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_trabajador`),
  UNIQUE KEY `uq_trabajador_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trabajador`
--

INSERT INTO `trabajador` VALUES (1,'45896321','Jorge Luis','Ramirez','Vargas','987123456','jorge.ramirez@gmail.com',1),(2,'47852369','Ana Maria','Torres','Lopez','951753258','ana.torres@gmail.com',1);

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_rol` int NOT NULL,
  `id_trabajador` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_codigo` (`codigo`),
  KEY `idx_usuario_rol` (`id_rol`),
  KEY `idx_usuario_trabajador` (`id_trabajador`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuario_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajador` (`id_trabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` VALUES (1,'0001111000','$2b$10$vYAT/.Co4YeeuOa.bkIR.O8hqymVlaETaVamXlYPe1q.eUTI.W8QC',1,1),(2,'0002222000','$2b$10$dXZ0HiOtjltUHwfnKSeNkeNkif/IzfgjdciAgocOe5T/24HvpsF9y',2,2);



DROP TABLE IF EXISTS `estudiante`;
CREATE TABLE `estudiante` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dni` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `escuela` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facultad` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `uq_estudiante_codigo` (`codigo`),
  UNIQUE KEY `uq_estudiante_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estudiante`
--

INSERT INTO `estudiante` VALUES (1,'Pedro Giovanni','Ricra','Figueroa','72684987','922149396','pedro.ricra@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221081','$2b$10$UtxUX3KOUT5lSBwQNYwrI.te8IrqJi2OQip9FxntNoqpVoGMmKfKq'),(2,'Leonardo Franco','Campos','Inuma','11111111','912345678','leonardo.campos@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221057','$2b$10$T04eZVMm/SWO43uVuzz24uT7Ep4uKyXXDugZKoei87RTuhnGqlNIq'),(3,'Lenin Oseas','Aponte','Abisrror','22222222','995318921','Yukijira2004@gmail.com','Derecho','Facultad de derecho y ciencias políticas','0002210376','$2b$10$ajb/5PeX956mb7EStDvBuOCU3p5X9D0dJzWiH3tvFHDALvuKIsB9S'),(4,'Larissa Melani','Ricra','Figuera','12343214','989713207','larissa.melany@gmail.com','Economía','Facultad de Ciencias Económicas, Administrativas y Contables','0001119897','$2b$10$RrJGx3GO.DCg.vPM9kqdVOa.q3smGoFBIsAHHqzSYJfup1ScpaMAy');

--
-- Table structure for table `reaccion`
--

DROP TABLE IF EXISTS `reporte`;
CREATE TABLE `reporte` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_reporte` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_edicion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cantidad_reacciones` int NOT NULL DEFAULT '0',
  `id_estado` int NOT NULL,
  `codigo_estudiante` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_tipo_problema` int NOT NULL,
  `id_ubicacion` int NOT NULL,
  `id_usuario` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `idx_reporte_estado` (`id_estado`),
  KEY `idx_reporte_codigo_est` (`codigo_estudiante`),
  KEY `idx_reporte_tipo` (`id_tipo_problema`),
  KEY `idx_reporte_ubicacion` (`id_ubicacion`),
  KEY `fk_reporte_usuario` (`id_usuario`),
  CONSTRAINT `fk_reporte_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `fk_reporte_tipo_problema` FOREIGN KEY (`id_tipo_problema`) REFERENCES `tipo_problema` (`id_tipo_problema`),
  CONSTRAINT `fk_reporte_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_reporte_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reporte`
--


--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `reaccion`;
CREATE TABLE `reaccion` (
  `id_reaccion` int NOT NULL AUTO_INCREMENT,
  `codigo_estudiante` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_reporte` int NOT NULL,
  `like` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_reaccion`),
  UNIQUE KEY `uq_reaccion_codigo_reporte` (`codigo_estudiante`,`id_reporte`),
  KEY `idx_reaccion_reporte` (`id_reporte`),
  CONSTRAINT `fk_reaccion_reporte` FOREIGN KEY (`id_reporte`) REFERENCES `reporte` (`id_reporte`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reaccion`
--


--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`session_id`),
  KEY `idx_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- sessions: vacía a propósito (las crea el backend al loguear)

--
-- Table structure for table `tipo_problema`
--
