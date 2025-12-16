CREATE DATABASE  IF NOT EXISTS `proyecto_swlibre` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `proyecto_swlibre`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: proyecto_swlibre
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
-- Table structure for table `carrera`
--

DROP TABLE IF EXISTS `carrera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrera` (
  `id_carrera` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrera`
--

LOCK TABLES `carrera` WRITE;
/*!40000 ALTER TABLE `carrera` DISABLE KEYS */;
INSERT INTO `carrera` VALUES (1,'Administración'),(2,'Contabilidad'),(3,'Economía'),(4,'Agronomía'),(5,'Ingeniería Forestal'),(6,'Ingeniería Ambiental'),(7,'Enfermería'),(8,'Psicología'),(9,'Ingeniería Agroindustrial'),(10,'Medicina Humana'),(11,'Ingeniería de Sistemas'),(12,'Ingeniería Civil'),(13,'Derecho'),(14,'Educación Primaria'),(15,'Educación Inicial'),(16,'Ciencias de la Comunicación'),(17,'Idioma Inglés'),(18,'Matemática, Física e Informática'),(19,'Lenguaje y Literatura'),(20,'Ciencias Sociales y Educación Intercultural'),(21,'Ciencias Naturales y Medio Ambiente');
/*!40000 ALTER TABLE `carrera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'Pendiente'),(2,'Aceptado'),(3,'Resuelto'),(4,'Rechazado');
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
  `nombres` varchar(45) NOT NULL,
  `apellido_paterno` varchar(45) NOT NULL,
  `apellido_materno` varchar(45) NOT NULL,
  `id_carrera` int NOT NULL,
  PRIMARY KEY (`id_estudiante`),
  KEY `fk_estudiante_carrera_idx` (`id_carrera`),
  CONSTRAINT `fk_estudiante_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carrera` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiante`
--

LOCK TABLES `estudiante` WRITE;
/*!40000 ALTER TABLE `estudiante` DISABLE KEYS */;
INSERT INTO `estudiante` VALUES (1,'Pedro Giovanni','Ricra','Figueroa',11),(2,'Leonardo Franco','Campos','Inuma',11);
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
  `id_estudiante` int DEFAULT NULL,
  `id_reporte` int DEFAULT NULL,
  `like` tinyint DEFAULT NULL,
  PRIMARY KEY (`id_reaccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
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
  `titulo` varchar(30) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `foto_url` varchar(100) NOT NULL,
  `fecha_reporte` datetime NOT NULL,
  `fecha_edicion` datetime NOT NULL,
  `cantidad_reacciones` int NOT NULL,
  `id_estado` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_tipo_problema` int NOT NULL,
  `id_ubicacion` int DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_reporte_estudiante_idx` (`id_estudiante`),
  KEY `fk_reporte_tipo_problema_idx` (`id_tipo_problema`),
  KEY `fk_reporte_estado_idx` (`id_estado`),
  KEY `fk_reporte_ubicacion_idx` (`id_ubicacion`),
  CONSTRAINT `fk_reporte_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `fk_reporte_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiante` (`id_estudiante`),
  CONSTRAINT `fk_reporte_tipo_problema` FOREIGN KEY (`id_tipo_problema`) REFERENCES `tipo_problema` (`id_tipo_problema`),
  CONSTRAINT `fk_reporte_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
INSERT INTO `reporte` VALUES (1,'Grieta en pared del aula','Se observó una grieta en la pared del aula, cerca de la puerta. La fisura es visible y parece haberse extendido con el tiempo. Se solicita inspección técnica para identificar la causa (humedad o asentamiento), aplicar resane/refuerzo y prevenir desprendimientos o filtraciones que afecten la seguridad del ambiente.','/uploads/reportes/HuH-Oc2Jx5BWnG__.jpg','2025-12-01 01:10:38','2025-12-19 01:10:38',0,2,1,1,1),(2,'Sillas dañadas en salón','Varias sillas del salón tienen patas sueltas y estructura inestable; al sentarse se mueven o se ladean. Esto incrementa el riesgo de caídas y lesiones durante clases. Se recomienda retirar las unidades dañadas, ajustar tornillos y uniones, reforzar o reemplazar las que presenten piezas quebradas.','/uploads/reportes/ArvQF4yVHRI3FrLW.jpg','2025-12-01 01:10:38','2025-12-23 01:10:38',2,2,2,2,2),(3,'Proyector no enciende','El proyector no enciende al conectarlo y no muestra señal, impidiendo presentaciones. Se requiere revisar cable de poder, adaptador, toma eléctrica y estado del botón/indicadores. Solicitar mantenimiento para diagnóstico (fuente, fusible o falla interna) y reparación o sustitución para restablecer el servicio.','/uploads/reportes/osJVkfbBb0nUrbjw.jpg','2025-12-01 01:10:38','2025-12-15 01:10:38',5,2,2,3,3),(4,'Tomacorriente chispea','Al usar el tomacorriente, se producen chispas al conectar un cargador, indicando posible falso contacto o deterioro interno. Es un riesgo eléctrico y puede dañar equipos o causar cortocircuitos. Se pide deshabilitarlo y señalizarlo de inmediato, reemplazar el punto y realizar pruebas de seguridad antes de habilitarlo.','/uploads/reportes/5sZrpCBrPhsdzT2q.jpg','2025-12-01 01:10:38','2025-12-09 01:10:38',1,2,1,4,4),(5,'Falta limpieza en pasillo','En el pasillo hay basura acumulada y mal olor persistente, afectando la higiene y el tránsito. Se solicita limpieza inmediata, retiro de residuos y desinfección si corresponde. Además, reforzar la frecuencia de mantenimiento y verificar la colocación de tachos para evitar que el problema se repita.','/uploads/reportes/2aAt8k4uLXA5FjuT.jpg','2025-12-01 01:10:38','2025-12-02 01:10:38',3,2,1,8,5);
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
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador'),(2,'Estudiante');
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
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id_tipo_problema`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_problema`
--

LOCK TABLES `tipo_problema` WRITE;
/*!40000 ALTER TABLE `tipo_problema` DISABLE KEYS */;
INSERT INTO `tipo_problema` VALUES (1,'Infraestructura'),(2,'Mobiliario'),(3,'Equipos Electrónicos'),(4,'Instalaciones Eléctricas'),(5,'Instalaciones Sanitarias'),(6,'Áreas Verdes'),(7,'Seguridad'),(8,'Limpieza');
/*!40000 ALTER TABLE `tipo_problema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicacion` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (1,'Pabellón 1'),(2,'Pabellón 2'),(3,'Pabellón 3'),(4,'Pabellón 4'),(5,'Pabellón 5'),(6,'Pabellón 6'),(7,'Pabellón 7'),(8,'FACULTAD DE INGENIERÍA DE SISTEMAS Y DE INGENIERÍA CIVIL'),(9,'FACULTAD DE CIENCIAS DE LA SALUD Y MEDICINA HUMANA'),(10,'FACULTAD DE DERECHO Y CIENCIAS POLITICAS'),(11,'FACULTAD DE CIENCIAS ECONOMICAS, ADMINISTRATIVAS Y CONTABLES'),(12,'FACULTAD DE CIENCIAS AGROPECUARIAS'),(13,'FACULTAD DE CIENCIAS FORESTALES Y AMBIENTALES'),(14,'FACULTAD DE EDUCACIÓN Y CIENCIAS SOCIALES'),(15,'FACULTAD DE CIENCIAS DE LA SALUD'),(16,'Estacionamiento 1'),(17,'Estacionamiento 2'),(18,'Estacionamiento 3'),(19,'Estacionamiento 4'),(20,'Estacionamiento 5'),(21,'Estacionamiento 6'),(22,'Estacionamiento 7'),(23,'Estacionamiento 8'),(24,'Estacionamiento 9'),(25,'AUDITORIO GENERAL'),(26,'Motelito'),(27,'Campo Deportivo');
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
  `codigo` varchar(45) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `id_rol` int NOT NULL,
  `id_estudiante` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `fk_usuario_rol_idx` (`id_rol`),
  KEY `fk_usuario_estudiante_idx` (`id_estudiante`),
  CONSTRAINT `fk_usuario_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiante` (`id_estudiante`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin','$2b$10$BoKt2B4CAS7FkCglsDaTuu3TYPKjH2yIwjav4m.c.BXZmAvySof/C',1,NULL),(2,'0002221081','$2b$10$UtxUX3KOUT5lSBwQNYwrI.te8IrqJi2OQip9FxntNoqpVoGMmKfKq',2,1),(3,'0002221057','$2b$10$T04eZVMm/SWO43uVuzz24uT7Ep4uKyXXDugZKoei87RTuhnGqlNIq',2,2);
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

-- Dump completed on 2025-12-16  8:29:51
