CREATE DATABASE  IF NOT EXISTS `reporte_incidencias` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
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
  `dni` varchar(8) NOT NULL,
  `telefono` varchar(9) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `escuela` varchar(100) NOT NULL,
  `facultad` varchar(100) NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `clave` varchar(255) NOT NULL,
  PRIMARY KEY (`id_estudiante`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiante`
--

LOCK TABLES `estudiante` WRITE;
/*!40000 ALTER TABLE `estudiante` DISABLE KEYS */;
INSERT INTO `estudiante` VALUES (1,'Pedro Giovanni','Ricra','Figueroa','72684987','922149396','pedro.ricra@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221081','$2b$10$UtxUX3KOUT5lSBwQNYwrI.te8IrqJi2OQip9FxntNoqpVoGMmKfKq'),(2,'Leonardo Franco','Campos','Inuma','11111111','912345678','leonardo.campos@gmail.com','Ingeniería de Sistemas','Facultad de Ingeniería de Sistemas y Civil','0002221057','$2b$10$T04eZVMm/SWO43uVuzz24uT7Ep4uKyXXDugZKoei87RTuhnGqlNIq'),(3,'Lenin Oseas','Aponte','Abisrror','22222222','995318921','Yukijira2004@gmail.com','Derecho','Facultad de derecho y ciencias políticas','0002210376','$2b$10$ajb/5PeX956mb7EStDvBuOCU3p5X9D0dJzWiH3tvFHDALvuKIsB9S');
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
  `id_estudiante` int NOT NULL,
  `id_reporte` int NOT NULL,
  `like` tinyint NOT NULL,
  PRIMARY KEY (`id_reaccion`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reaccion`
--

LOCK TABLES `reaccion` WRITE;
/*!40000 ALTER TABLE `reaccion` DISABLE KEYS */;
INSERT INTO `reaccion` VALUES (1,1,3,1),(2,1,5,1),(3,3,5,1),(4,1,6,1),(5,2,6,1),(6,3,6,1),(7,1,9,1),(8,1,14,1),(9,3,14,1),(10,1,15,1),(11,2,15,1),(12,3,15,1),(13,1,18,1),(14,1,20,1),(15,3,20,1),(16,1,21,1),(17,2,21,1),(18,3,21,1);
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
  `descripcion` varchar(500) NOT NULL,
  `foto_url` varchar(100) NOT NULL,
  `fecha_reporte` datetime NOT NULL,
  `fecha_edicion` datetime NOT NULL,
  `cantidad_reacciones` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `id_estado` int NOT NULL,
  `id_tipo_problema` int NOT NULL,
  `id_ubicacion` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_reporte_tipo_problema_idx` (`id_tipo_problema`),
  KEY `fk_reporte_estado_idx` (`id_estado`),
  KEY `fk_reporte_ubicacion_idx` (`id_ubicacion`),
  CONSTRAINT `fk_reporte_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `fk_reporte_tipo_problema` FOREIGN KEY (`id_tipo_problema`) REFERENCES `tipo_problema` (`id_tipo_problema`),
  CONSTRAINT `fk_reporte_ubicacion` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicacion` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
INSERT INTO `reporte` VALUES (1,'Grieta en pared del aula','Se observó una grieta en la pared del aula, cerca de la puerta. La fisura es visible y parece haberse extendido con el tiempo. Se solicita inspección técnica para identificar la causa (humedad o asentamiento), aplicar resane/refuerzo y prevenir desprendimientos o filtraciones que afecten la seguridad del ambiente.','/uploads/reportes/VSAiHgnWfVvq0xFYQbbtm9jTRkRhw05b.jpg','2025-02-01 01:01:01','2025-12-21 07:55:02',0,2,1,1,1,1),(2,'Sillas dañadas en salón','Varias sillas del salón tienen patas sueltas y estructura inestable; al sentarse se mueven o se ladean. Esto incrementa el riesgo de caídas y lesiones durante clases. Se recomienda retirar las unidades dañadas, ajustar tornillos y uniones, reforzar o reemplazar las que presenten piezas quebradas.','/uploads/reportes/ABTugDDS2E3PQn8ZaB7iWLSOeBEmingi.jpg','2025-03-01 01:01:01','2025-12-03 14:22:07',0,1,2,2,4,2),(3,'Proyector no enciende','El proyector no enciende al conectarlo y no muestra señal, impidiendo presentaciones. Se requiere revisar cable de poder, adaptador, toma eléctrica y estado del botón/indicadores. Solicitar mantenimiento para diagnóstico (fuente, fusible o falla interna) y reparación o sustitución para restablecer el servicio.','/uploads/reportes/ZVwEZ6xtDKMjfc4qqADFnUwDqmNIwEeG.jpg','2025-03-01 01:01:01','2025-12-30 23:18:06',1,3,2,3,7,1),(4,'Tomacorriente chispea','Al usar el tomacorriente, se producen chispas al conectar un cargador, indicando posible falso contacto o deterioro interno. Es un riesgo eléctrico y puede dañar equipos o causar cortocuitos. Se pide deshabilitarlo y señalizarlo de inmediato, reemplazar el punto y realizar pruebas de seguridad antes de habilitarlo.','/uploads/reportes/YF5QG8zfT6SOZfqbhB3oejSKvJkeKDgS.jpg','2025-05-01 01:01:01','2025-12-10 02:47:58',0,1,1,4,10,2),(5,'Falta limpieza en pasillo','En el pasillo hay basura acumulada y mal olor persistente, afectando la higiene y el tránsito. Se solicita limpieza inmediata, retiro de residuos y desinfección si corresponde. Además, reforzar la frecuencia de mantenimiento y verificar la colocación de tachos para evitar que el problema se repita.','/uploads/reportes/VvpxtpliAr7o7VP5PehdlTSEtJHQBBC8.jpg','2025-06-01 01:01:01','2025-12-27 12:40:51',2,1,3,8,13,1),(6,'Puerta del aula desajustada','La puerta del aula no cierra correctamente y presenta dificultad al abrir y cerrar, generando ruidos y riesgo de golpes en los usuarios. El problema podría deberse a desgaste de bisagras o desalineación del marco. Se solicita revisión técnica, ajuste o reemplazo de herrajes para garantizar un uso seguro.','/uploads/reportes/FlpxL8jcadGMHAf4LcZKMEET9FEEIxn7.jpg','2025-06-01 01:01:01','2025-12-06 09:05:43',3,2,2,1,16,2),(7,'Ventilador con ruido excesivo','El ventilador del aula emite ruidos anormales durante su funcionamiento, lo que distrae a los estudiantes y podría indicar desgaste del motor o aspas desbalanceadas. Se recomienda inspección técnica, mantenimiento correctivo o reemplazo del equipo si corresponde.','/uploads/reportes/xSRFmtyKBboCHZbeUUxi30l7NPdNXWy3.jpg','2025-08-01 01:01:01','2025-12-17 20:04:15',0,3,1,3,19,1),(8,'Luminaria parpadeante','Una de las luminarias del aula presenta parpadeo constante, afectando la visibilidad y provocando incomodidad visual. El problema podría estar relacionado con el balasto, cableado o el foco. Se solicita revisión eléctrica y reemplazo de componentes defectuosos.','/uploads/reportes/d0hXsBnTDcjuCq3cqQAItMqx2hF4QbVn.jpg','2025-08-01 01:01:01','2026-01-06 02:09:27',0,2,2,4,22,2),(9,'Pizarra deteriorada','La pizarra del aula se encuentra rayada y con la superficie desgastada, dificultando la correcta escritura y lectura del contenido. Se recomienda evaluar su restauración o reemplazo por una nueva para garantizar condiciones adecuadas de enseñanza.','/uploads/reportes/wNptORIjJ1TBynyfETENwYfaGkfFOErU.jpg','2025-10-01 01:01:01','2025-12-07 18:31:12',1,1,3,2,25,1),(10,'Enchufe flojo en pared','Se detectó un enchufe flojo en la pared del aula, el cual presenta movimiento al conectar dispositivos. Esto representa un riesgo eléctrico y posible daño a los equipos. Se solicita reparación inmediata, asegurando la correcta fijación y funcionamiento del tomacorriente.','/uploads/reportes/KyAUh3lxRfiBXFHuCZSYWyL8L13RbIzw.jpg','2025-12-01 01:01:01','2025-12-13 11:16:39',0,3,1,4,27,2),(11,'Monotonía','Es una cama bien perrona','/uploads/reportes/Te8m21q5uKN1qjat5NqU8RAY1fXQFMIp.jpeg','2026-01-06 16:25:50','2026-01-07 09:05:11',0,3,4,2,24,0),(12,'Rosa Negra','Esta es una rosa negra que me encontré en el AUDITORIO','/uploads/reportes/vqAd7QYLFinsKraxRzSybZ4EUSU5PolW.jpg','2026-01-06 16:28:57','2026-01-06 16:28:57',0,2,4,8,25,2),(13,'Jugando minecraft','jugando al minecraft','/uploads/reportes/ZehlkgZ00URfY9HIqm8eX9agb8ILvifZ.jpg','2026-01-06 17:42:10','2026-01-06 17:42:10',0,1,4,6,27,NULL),(14,'Baño sin agua','En los servicios higienicos no sale agua del lavamanos y el inodoro presenta poca carga. Se solicita revisar el suministro, llaves de paso y posibles obstrucciones para restablecer el servicio y evitar malos olores.','/uploads/reportes/6Qp3nL8mVt2aZx1cK9rJH0uEwY5bD7sF.jpg','2026-01-07 10:15:00','2026-01-07 10:15:00',2,1,2,5,24,NULL),(15,'Luz apagada pasillo','Un tramo del pasillo permanece sin iluminacion durante la tarde. Se requiere revisar foco, balasto o cableado para evitar zonas oscuras y mejorar la seguridad en el transito.','/uploads/reportes/hK2sP9vQm3Xc8Lw1Zr6aT0nYb5D7uE4G.jpg','2026-01-07 12:05:00','2026-01-07 14:20:00',3,2,2,4,1,1),(16,'Extintor vencido','Se identifico un extintor con etiqueta de inspeccion vencida. Solicito verificacion del equipo, recarga o reemplazo segun corresponda, y actualizacion del control de seguridad.','/uploads/reportes/R8x1qW4mZt6pN2vL0cK9sY3aD5uE7bH1J.jpg','2026-01-07 15:40:00','2026-01-09 23:58:03',0,1,1,7,27,3),(17,'Camara sin funcionar','La camara de vigilancia no muestra imagen o aparece en negro. Se solicita revisar energia, conexion y configuracion para recuperar el monitoreo y registrar incidencias.','/uploads/reportes/At5Qn2sL9xR0mV6cK1pZ7wY3dE8uH4bJ.jpg','2026-01-08 09:12:00','2026-01-08 11:30:00',0,3,3,7,27,2),(18,'Piso resbaloso','Se observa piso con derrame y suciedad que causa resbalones en el area de transito. Se solicita limpieza inmediata y senalizacion temporal para prevenir caidas.','/uploads/reportes/0mZ7rQ3pL1xV8cK2sY5aD9uE4bH6nJ0T.jpg','2026-01-08 13:55:00','2026-01-08 13:55:00',1,2,2,8,28,NULL),(19,'Computadora no prende','Una computadora del aula no enciende al presionar el boton. Se solicita revisar cable de poder, estabilizador y fuente para diagnostico y reparacion o reemplazo del equipo.','/uploads/reportes/L3pQ7nZ1xV5cK9sR2mY0aD6uE8bH4tJ.jpg','2026-01-08 16:10:00','2026-01-09 08:45:00',0,3,1,3,8,2),(20,'Ventana sin seguro','Una ventana presenta seguro dañado y queda abierta con facilidad. Se solicita ajustar o cambiar el seguro para evitar ingreso de lluvia, polvo o riesgo de caidas de piezas.','/uploads/reportes/Vt2aK9rJ0uEw5bD7sF6Qp3nL8mZx1cH.jpg','2026-01-09 09:20:00','2026-01-09 09:20:00',2,1,2,1,3,NULL),(21,'Basurero desbordado','Los tachos se encuentran llenos y hay residuos alrededor. Se solicita retiro de basura, desinfeccion y refuerzo de frecuencia de recojo para mantener el area limpia.','/uploads/reportes/9xR0mV6cK1pZ7wY3dE8uH4bJAt5Qn2s.jpg','2026-01-09 10:05:00','2026-01-09 10:30:00',3,2,3,8,16,1),(22,'Silla faltante aula','En el aula faltan sillas para los estudiantes y algunas estan en mal estado. Se solicita reposicion y verificacion del mobiliario para asegurar la capacidad del salon.','/uploads/reportes/2sY5aD9uE4bH6nJ0T0mZ7rQ3pL1xV8c.jpg','2026-01-09 11:18:00','2026-01-09 11:18:00',0,3,1,2,2,NULL),(23,'Cable suelto techo','Se aprecia cableado expuesto o suelto cerca del techo. Se solicita asegurar canaletas, revisar conexion y aislar correctamente para prevenir riesgos electricos.','/uploads/reportes/mY0aD6uE8bH4tJL3pQ7nZ1xV5cK9sR2.jpg','2026-01-09 14:02:00','2026-01-09 15:10:00',0,1,2,4,7,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Supervisor'),(2,'Administrador'),(3,'Estudiante');
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
-- Table structure for table `trabajador`
--

DROP TABLE IF EXISTS `trabajador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trabajador` (
  `id_trabajador` int NOT NULL AUTO_INCREMENT,
  `dni` varchar(8) NOT NULL,
  `nombres` varchar(45) NOT NULL,
  `apellido_paterno` varchar(45) NOT NULL,
  `apellido_materno` varchar(45) NOT NULL,
  `telefono` varchar(9) NOT NULL,
  `correo` varchar(45) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`id_trabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
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
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (1,'Pabellón 1'),(2,'Pabellón 2'),(3,'Pabellón 3'),(4,'Pabellón 4'),(5,'Pabellón 5'),(6,'Pabellón 6'),(7,'Pabellón 7'),(8,'FACULTAD DE INGENIERÍA DE SISTEMAS Y DE INGENIERÍA CIVIL'),(9,'FACULTAD DE MEDICINA HUMANA'),(10,'FACULTAD DE DERECHO Y CIENCIAS POLITICAS'),(11,'FACULTAD DE CIENCIAS ECONOMICAS, ADMINISTRATIVAS Y CONTABLES'),(12,'FACULTAD DE CIENCIAS AGROPECUARIAS'),(13,'FACULTAD DE CIENCIAS FORESTALES Y AMBIENTALES'),(14,'FACULTAD DE EDUCACIÓN Y CIENCIAS SOCIALES'),(15,'FACULTAD DE CIENCIAS DE LA SALUD'),(16,'Estacionamiento 1'),(17,'Estacionamiento 2'),(18,'Estacionamiento 3'),(19,'Estacionamiento 4'),(20,'Estacionamiento 5'),(21,'Estacionamiento 6'),(22,'Estacionamiento 7'),(23,'Estacionamiento 8'),(24,'Biblioteca'),(25,'AUDITORIO GENERAL'),(26,'Motelito'),(27,'Campo Deportivo'),(28,'COMEDOR');
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
  `id_trabajador` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `fk_usuario_rol_idx` (`id_rol`),
  KEY `fk_usuario_trabajador_idx` (`id_trabajador`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuario_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajador` (`id_trabajador`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'0001111000','$2b$10$vYAT/.Co4YeeuOa.bkIR.O8hqymVlaETaVamXlYPe1q.eUTI.W8QC',1,NULL,1),(2,'0002222000','$2b$10$dXZ0HiOtjltUHwfnKSeNkeNkif/IzfgjdciAgocOe5T/24HvpsF9y',2,NULL,2),(3,'0002221081','$2b$10$UtxUX3KOUT5lSBwQNYwrI.te8IrqJi2OQip9FxntNoqpVoGMmKfKq',3,1,NULL),(4,'0002221057','$2b$10$T04eZVMm/SWO43uVuzz24uT7Ep4uKyXXDugZKoei87RTuhnGqlNIq',3,2,NULL),(5,'0002210376','$2b$10$ajb/5PeX956mb7EStDvBuOCU3p5X9D0dJzWiH3tvFHDALvuKIsB9S',3,3,NULL);
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

-- Dump completed on 2026-01-09 23:59:27
