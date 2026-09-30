CREATE DATABASE  IF NOT EXISTS `reporte_incidencias` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `reporte_incidencias`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: reporte_incidencias
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `uq_estado_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (2,'Aceptado'),(1,'Pendiente'),(4,'Rechazado'),(3,'Resuelto');
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiante`
--

DROP TABLE IF EXISTS `estudiante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiante` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dni` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `escuela` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `facultad` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash bcrypt (credencial del API simulado)',
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `uq_estudiante_codigo` (`codigo`),
  UNIQUE KEY `uq_estudiante_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiante`
--

LOCK TABLES `estudiante` WRITE;
/*!40000 ALTER TABLE `estudiante` DISABLE KEYS */;
INSERT INTO `estudiante` VALUES (1,'Pedro Giovanni','Ricra','Figueroa','72684987','922149396','pedro.ricra@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221081','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a'),(2,'Leonardo Franco','Campos','Inuma','11111111','912345678','leonardo.campos@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221057','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a'),(3,'Lenin Oseas','Aponte','Abisrror','22222222','995318921','Yukijira2004@gmail.com','Derecho','Facultad de derecho y ciencias políticas','0002210376','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a');
/*!40000 ALTER TABLE `estudiante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reaccion`
--

DROP TABLE IF EXISTS `reaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reaccion` (
  `id_reaccion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL COMMENT 'Referencia LÓGICA al API de alumnos (sin FK)',
  `id_reporte` int NOT NULL,
  `like` tinyint NOT NULL DEFAULT '1' COMMENT '1 = activo, 0 = retirado',
  PRIMARY KEY (`id_reaccion`),
  UNIQUE KEY `uq_reaccion_estudiante_reporte` (`id_estudiante`,`id_reporte`),
  KEY `idx_reaccion_reporte` (`id_reporte`),
  CONSTRAINT `fk_reaccion_reporte` FOREIGN KEY (`id_reporte`) REFERENCES `reporte` (`id_reporte`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reaccion`
--

LOCK TABLES `reaccion` WRITE;
/*!40000 ALTER TABLE `reaccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `reaccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ruta del archivo en disco local, ej: /uploads/reportes/xxx.jpg',
  `fecha_reporte` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_edicion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cantidad_reacciones` int NOT NULL DEFAULT '0' COMMENT 'Contador desnormalizado, se mantiene por transacción',
  `id_estado` int NOT NULL,
  `id_estudiante` int NOT NULL COMMENT 'Referencia LÓGICA al API de alumnos (sin FK)',
  `id_tipo_problema` int NOT NULL,
  `id_ubicacion` int NOT NULL,
  `id_usuario` int unsigned DEFAULT NULL COMMENT 'Personal que atendió el reporte',
  PRIMARY KEY (`id_reporte`),
  KEY `idx_reporte_estado` (`id_estado`),
  KEY `idx_reporte_estudiante` (`id_estudiante`),
  KEY `idx_reporte_tipo` (`id_tipo_problema`),
  KEY `idx_reporte_ubicacion` (`id_ubicacion`),
  KEY `fk_reporte_usuario` (`id_usuario`),
  CONSTRAINT `fk_reporte_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `fk_reporte_tipo_problema` FOREIGN KEY (`id_tipo_problema`) REFERENCES `tipo_problema` (`id_tipo_problema`),
  CONSTRAINT `fk_reporte_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_reporte_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (2,'Administrador'),(3,'Estudiante'),(1,'Supervisor');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_problema`
--

DROP TABLE IF EXISTS `tipo_problema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_problema` (
  `id_tipo_problema` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_tipo_problema`),
  UNIQUE KEY `uq_tipo_problema_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_problema`
--

LOCK TABLES `tipo_problema` WRITE;
/*!40000 ALTER TABLE `tipo_problema` DISABLE KEYS */;
INSERT INTO `tipo_problema` VALUES (6,'Áreas Verdes'),(3,'Equipos Electrónicos'),(1,'Infraestructura'),(4,'Instalaciones Eléctricas'),(5,'Instalaciones Sanitarias'),(8,'Limpieza'),(2,'Mobiliario'),(7,'Seguridad');
/*!40000 ALTER TABLE `tipo_problema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trabajador`
--

DROP TABLE IF EXISTS `trabajador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabajador` (
  `id_trabajador` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_trabajador`),
  UNIQUE KEY `uq_trabajador_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trabajador`
--

LOCK TABLES `trabajador` WRITE;
/*!40000 ALTER TABLE `trabajador` DISABLE KEYS */;
INSERT INTO `trabajador` VALUES (1,'45896321','Jorge Luis','Ramirez','Vargas','987123456','jorge.ramirez@gmail.com',1),(2,'47852369','Ana Maria','Torres','Lopez','951753258','ana.torres@gmail.com',1);
/*!40000 ALTER TABLE `trabajador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicacion` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `uq_ubicacion_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (25,'AUDITORIO GENERAL'),(24,'Biblioteca'),(27,'Campo Deportivo'),(28,'COMEDOR'),(16,'Estacionamiento 1'),(17,'Estacionamiento 2'),(18,'Estacionamiento 3'),(19,'Estacionamiento 4'),(20,'Estacionamiento 5'),(21,'Estacionamiento 6'),(22,'Estacionamiento 7'),(23,'Estacionamiento 8'),(12,'FACULTAD DE CIENCIAS AGROPECUARIAS'),(15,'FACULTAD DE CIENCIAS DE LA SALUD'),(11,'FACULTAD DE CIENCIAS ECONOMICAS, ADMINISTRATIVAS Y CONTABLES'),(13,'FACULTAD DE CIENCIAS FORESTALES Y AMBIENTALES'),(10,'FACULTAD DE DERECHO Y CIENCIAS POLITICAS'),(14,'FACULTAD DE EDUCACIÓN Y CIENCIAS SOCIALES'),(8,'FACULTAD DE INGENIERÍA DE SISTEMAS Y DE INGENIERÍA CIVIL'),(9,'FACULTAD DE MEDICINA HUMANA'),(26,'Motelito'),(1,'Pabellón 1'),(2,'Pabellón 2'),(3,'Pabellón 3'),(4,'Pabellón 4'),(5,'Pabellón 5'),(6,'Pabellón 6'),(7,'Pabellón 7');
/*!40000 ALTER TABLE `ubicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash bcrypt',
  `id_rol` int NOT NULL,
  `id_estudiante` int DEFAULT NULL COMMENT 'Referencia LÓGICA al API de alumnos (sin FK)',
  `id_trabajador` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_codigo` (`codigo`),
  KEY `idx_usuario_rol` (`id_rol`),
  KEY `idx_usuario_estudiante` (`id_estudiante`),
  KEY `idx_usuario_trabajador` (`id_trabajador`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuario_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajador` (`id_trabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'0001111000','$2b$10$Vu/Oaylv5SaSmmXjeqrRXeqx.J7ZUhEcNr/WQbrkuxrNPNuC3dwxy',1,NULL,1),(2,'0002222000','$2b$10$MXT1CetJ6PtRykLVEgEviuxyciYRaStzDZlBfD2POY08ABTyHR.Ai',2,NULL,2),(3,'0002221081','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a',3,1,NULL),(4,'0002221057','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a',3,2,NULL),(5,'0002210376','$2b$10$NAAqcDj1tg82Upb9bjKW5uG1VY0tUdP8n6NyyNiEzM3b.EVipHU9a',3,3,NULL);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-30  5:00:31
