-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-06-2026 a las 22:39:28
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sisge_almacen`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id` bigint(20) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) DEFAULT NULL,
  `usuario_nombre` varchar(100) DEFAULT NULL,
  `usuario_email` varchar(150) DEFAULT NULL,
  `usuario_rol` varchar(20) DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `entidad_nombre` varchar(200) DEFAULT NULL,
  `detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle`)),
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria`
--

INSERT INTO `auditoria` (`id`, `fecha`, `id_usuario`, `usuario_nombre`, `usuario_email`, `usuario_rol`, `accion`, `modulo`, `entidad_id`, `entidad_nombre`, `detalle`, `ip`, `user_agent`) VALUES
(1, '2026-06-01 16:07:47', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.8457'),
(2, '2026-06-01 16:08:11', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.8457'),
(3, '2026-06-01 16:25:26', 2, 'Omar', 'omar@gmail.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:movimientos', '{\"rol\":\"operario\",\"modulo\":\"movimientos\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(4, '2026-06-01 16:25:26', 2, 'Omar', 'omar@gmail.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:movimientos', '{\"rol\":\"operario\",\"modulo\":\"movimientos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(5, '2026-06-01 16:27:47', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(6, '2026-06-01 16:28:46', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(7, '2026-06-01 16:41:31', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; es-PE) WindowsPowerShell/5.1.26100.8457'),
(8, '2026-06-01 17:23:30', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(9, '2026-06-01 17:28:55', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'CERRAR_UBICACION', 'ubicaciones', 4, 'Amoladora angular 4.5\" 850W — Rodolfo', '{\"cerrado_por\":\"Fernando\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(10, '2026-06-01 18:10:13', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(11, '2026-06-01 18:16:43', 5, 'Rodolfo', 'rodolfo@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Rodolfo', '{\"username\":\"Rodolfo\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(12, '2026-06-01 18:22:44', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(13, '2026-06-01 18:26:43', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(14, '2026-06-01 18:33:12', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(15, '2026-06-01 18:40:03', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(16, '2026-06-01 18:40:39', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:productos', '{\"rol\":\"operario\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(17, '2026-06-01 18:40:41', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:productos', '{\"rol\":\"operario\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(18, '2026-06-01 18:40:51', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(19, '2026-06-01 18:40:52', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(20, '2026-06-01 18:40:53', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(21, '2026-06-01 18:40:54', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(22, '2026-06-01 18:41:12', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(23, '2026-06-01 18:41:14', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(24, '2026-06-01 18:41:17', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(25, '2026-06-01 18:41:17', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(26, '2026-06-01 18:41:18', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(27, '2026-06-01 18:41:47', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(28, '2026-06-01 18:46:39', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(29, '2026-06-01 18:47:27', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:ubicaciones', '{\"rol\":\"operario\",\"modulo\":\"ubicaciones\",\"puede_ver\":false,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(30, '2026-06-01 18:47:30', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:ubicaciones', '{\"rol\":\"operario\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(31, '2026-06-01 18:47:31', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:reportes', '{\"rol\":\"operario\",\"modulo\":\"reportes\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(32, '2026-06-01 18:47:31', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:importar', '{\"rol\":\"operario\",\"modulo\":\"importar\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(33, '2026-06-01 18:47:32', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:usuarios', '{\"rol\":\"operario\",\"modulo\":\"usuarios\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(34, '2026-06-01 18:47:32', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:auditoria', '{\"rol\":\"operario\",\"modulo\":\"auditoria\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(35, '2026-06-01 18:52:50', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":false,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(36, '2026-06-01 18:52:54', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":false,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(37, '2026-06-01 18:52:54', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:dashboard', '{\"rol\":\"operario\",\"modulo\":\"dashboard\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(38, '2026-06-01 18:52:56', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:productos', '{\"rol\":\"operario\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(39, '2026-06-01 18:52:58', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:productos', '{\"rol\":\"operario\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(40, '2026-06-01 18:52:59', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:productos', '{\"rol\":\"operario\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(41, '2026-06-01 18:53:01', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(42, '2026-06-01 18:53:02', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(43, '2026-06-01 18:53:04', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:categorias', '{\"rol\":\"operario\",\"modulo\":\"categorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(44, '2026-06-01 18:53:06', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(45, '2026-06-01 18:53:07', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(46, '2026-06-01 18:53:20', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:movimientos', '{\"rol\":\"operario\",\"modulo\":\"movimientos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(47, '2026-06-01 18:53:21', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:movimientos', '{\"rol\":\"operario\",\"modulo\":\"movimientos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(48, '2026-06-01 18:53:22', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:ubicaciones', '{\"rol\":\"operario\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(49, '2026-06-01 18:53:24', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:historial', '{\"rol\":\"operario\",\"modulo\":\"historial\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(50, '2026-06-01 18:53:29', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:historial', '{\"rol\":\"operario\",\"modulo\":\"historial\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(51, '2026-06-01 18:53:36', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:ubicaciones', '{\"rol\":\"operario\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(52, '2026-06-01 18:53:39', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:importar', '{\"rol\":\"operario\",\"modulo\":\"importar\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(53, '2026-06-01 18:53:40', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:usuarios', '{\"rol\":\"operario\",\"modulo\":\"usuarios\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(54, '2026-06-01 18:53:42', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:auditoria', '{\"rol\":\"operario\",\"modulo\":\"auditoria\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(55, '2026-06-01 18:53:45', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:usuarios', '{\"rol\":\"operario\",\"modulo\":\"usuarios\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(56, '2026-06-01 18:53:49', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:ubicaciones', '{\"rol\":\"operario\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(57, '2026-06-01 18:53:55', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(58, '2026-06-01 18:53:59', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:subcategorias', '{\"rol\":\"operario\",\"modulo\":\"subcategorias\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(59, '2026-06-01 18:54:17', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(60, '2026-06-01 18:54:53', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(61, '2026-06-01 18:55:55', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:operario módulo:usuarios', '{\"rol\":\"operario\",\"modulo\":\"usuarios\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(62, '2026-06-01 18:56:22', 5, 'Rodolfo', 'rodolfo@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Rodolfo', '{\"username\":\"Rodolfo\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(63, '2026-06-01 18:56:59', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(64, '2026-06-01 18:57:13', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:productos', '{\"rol\":\"supervisor\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(65, '2026-06-01 18:57:16', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:historial', '{\"rol\":\"supervisor\",\"modulo\":\"historial\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(66, '2026-06-01 18:57:18', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:historial', '{\"rol\":\"supervisor\",\"modulo\":\"historial\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(67, '2026-06-01 18:57:19', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:historial', '{\"rol\":\"supervisor\",\"modulo\":\"historial\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(68, '2026-06-01 18:57:23', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:ubicaciones', '{\"rol\":\"supervisor\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(69, '2026-06-01 18:57:24', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:ubicaciones', '{\"rol\":\"supervisor\",\"modulo\":\"ubicaciones\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(70, '2026-06-01 18:57:28', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:importar', '{\"rol\":\"supervisor\",\"modulo\":\"importar\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(71, '2026-06-01 18:57:29', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:importar', '{\"rol\":\"supervisor\",\"modulo\":\"importar\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(72, '2026-06-01 18:57:31', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:usuarios', '{\"rol\":\"supervisor\",\"modulo\":\"usuarios\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(73, '2026-06-01 18:57:32', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:auditoria', '{\"rol\":\"supervisor\",\"modulo\":\"auditoria\",\"puede_ver\":false,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(74, '2026-06-01 18:57:33', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:auditoria', '{\"rol\":\"supervisor\",\"modulo\":\"auditoria\",\"puede_ver\":true,\"puede_crear\":false,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(75, '2026-06-01 19:09:48', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'productos', 4, 'Alicate de corte diagonal', '{\"antes\":{\"nombre\":\"Alicate de corte diagonal\",\"id_categoria\":1,\"stock_minimo\":\"4.00\"},\"despues\":{\"nombre\":\"Alicate de corte diagonal\",\"id_categoria\":1,\"stock_minimo\":\"10.00\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(76, '2026-06-01 19:09:55', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'productos', 4, 'Alicate de corte diagonal', '{\"antes\":{\"nombre\":\"Alicate de corte diagonal\",\"id_categoria\":1,\"stock_minimo\":\"10.00\"},\"despues\":{\"nombre\":\"Alicate de corte diagonal\",\"id_categoria\":1,\"stock_minimo\":\"12.00\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(77, '2026-06-01 19:13:42', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(78, '2026-06-01 19:29:53', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(79, '2026-06-01 19:29:55', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(80, '2026-06-01 19:41:36', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'admin', '{\"username\":\"admin\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'curl/8.19.0'),
(81, '2026-06-01 19:41:44', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(82, '2026-06-01 19:41:48', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(83, '2026-06-01 19:41:54', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(84, '2026-06-01 19:44:22', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:dashboard', '{\"rol\":\"supervisor\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":false,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(85, '2026-06-01 19:44:23', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:dashboard', '{\"rol\":\"supervisor\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(86, '2026-06-01 19:44:24', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:dashboard', '{\"rol\":\"supervisor\",\"modulo\":\"dashboard\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(87, '2026-06-01 19:44:30', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'permisos', NULL, 'rol:supervisor módulo:productos', '{\"rol\":\"supervisor\",\"modulo\":\"productos\",\"puede_ver\":true,\"puede_crear\":true,\"puede_editar\":true,\"puede_eliminar\":false}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(88, '2026-06-01 19:45:54', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'productos', 58, 'Bota de seguridad punta acero T44-', '{\"antes\":{\"nombre\":\"Bota de seguridad punta acero T44\",\"id_categoria\":7,\"stock_minimo\":\"2.00\"},\"despues\":{\"nombre\":\"Bota de seguridad punta acero T44-\",\"id_categoria\":7,\"stock_minimo\":\"2.00\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(89, '2026-06-01 19:47:54', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(90, '2026-06-01 19:48:03', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(91, '2026-06-01 19:48:30', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'curl/8.19.0'),
(92, '2026-06-01 19:48:39', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'curl/8.19.0'),
(93, '2026-06-01 19:48:43', NULL, 'Intento fallido', NULL, NULL, 'LOGIN_FALLIDO', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"motivo\":\"Credenciales incorrectas\"}', '::1', 'curl/8.19.0'),
(94, '2026-06-01 19:48:48', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(95, '2026-06-01 19:55:45', 2, 'Omar', 'omar@sisge.com', 'admin', 'EDITAR', 'usuarios', 5, 'rodolfo', '{\"antes\":{\"id\":5,\"nombre\":\"Rodolfo\",\"username\":\"Rodolfo\",\"email\":\"rodolfo@sisge.com\",\"rol\":\"operario\",\"created_at\":{}},\"despues\":{\"id\":5,\"nombre\":\"Rodolfo\",\"username\":\"rodolfo\",\"email\":\"rodolfo@sisge.com\",\"rol\":\"supervisor\",\"created_at\":{}}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(96, '2026-06-01 19:57:53', 2, 'Omar', 'omar@sisge.com', 'admin', 'REGISTRAR_MOVIMIENTO', 'movimientos', 47, 'SALIDA — Alicate de corte diagonal', '{\"tipo\":\"SALIDA\",\"producto\":\"Alicate de corte diagonal\",\"cantidad\":\"1.00\",\"stock_anterior\":\"10.00\",\"stock_nuevo\":\"9.00\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(97, '2026-06-01 19:58:41', 5, 'Rodolfo', 'rodolfo@sisge.com', 'supervisor', 'LOGIN', 'auth', NULL, 'rodolfo', '{\"username\":\"rodolfo\",\"rol\":\"supervisor\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(98, '2026-06-01 20:02:06', 4, 'Alvaro', 'alvaro@sisge.com', 'operario', 'LOGIN', 'auth', NULL, 'Alvaro', '{\"username\":\"Alvaro\",\"rol\":\"operario\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'),
(99, '2026-06-01 20:03:47', 1, 'Fernando', 'fernando@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Fernando', '{\"username\":\"Fernando\",\"rol\":\"admin\"}', '::1', 'curl/8.19.0'),
(100, '2026-06-01 20:09:34', 2, 'Omar', 'omar@sisge.com', 'admin', 'LOGIN', 'auth', NULL, 'Omar', '{\"username\":\"Omar\",\"rol\":\"admin\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `activo`, `created_at`) VALUES
(1, 'Herramientas', 'Herramientas manuales y eléctricas de uso técnico', 1, '2026-06-01 14:17:27'),
(2, 'Equipos y Maquinaria', 'Equipos de mayor valor asignados a proyectos', 1, '2026-06-01 14:17:27'),
(3, 'Materiales Eléctricos', 'Insumos para instalaciones y mantenimiento eléctrico', 1, '2026-06-01 14:17:27'),
(4, 'Materiales de Plomería', 'Insumos para sistemas de agua e hidráulica', 1, '2026-06-01 14:17:27'),
(5, 'Repuestos y Componentes', 'Piezas de reemplazo para reparaciones', 1, '2026-06-01 14:17:27'),
(6, 'Insumos de Mantenimiento', 'Lubricantes, desengrasantes y consumibles técnicos', 1, '2026-06-01 14:17:27'),
(7, 'EPP', 'Equipos de Protección Personal para el personal', 1, '2026-06-01 14:17:27'),
(8, 'Materiales de Construcción', 'Materiales para trabajos civiles menores', 1, '2026-06-01 14:17:27'),
(9, 'Consumibles de Almacén', 'Materiales administrativos y de embalaje', 1, '2026-06-01 14:17:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `tipo` enum('ENTRADA','SALIDA','DEVOLUCION','AJUSTE') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `stock_anterior` decimal(10,2) NOT NULL,
  `stock_nuevo` decimal(10,2) NOT NULL,
  `motivo` varchar(200) DEFAULT NULL,
  `referencia_doc` varchar(100) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `id_orden_trabajo` varchar(50) DEFAULT NULL,
  `id_movimiento_origen` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `movimientos`
--

INSERT INTO `movimientos` (`id`, `id_producto`, `tipo`, `cantidad`, `stock_anterior`, `stock_nuevo`, `motivo`, `referencia_doc`, `id_usuario`, `id_tecnico`, `id_orden_trabajo`, `id_movimiento_origen`, `observaciones`, `fecha`) VALUES
(1, 1, 'ENTRADA', 10.00, 0.00, 10.00, 'Compra inicial de herramientas', 'OC-2025-001', 1, NULL, NULL, NULL, NULL, '2026-05-02 16:05:06'),
(2, 2, 'ENTRADA', 20.00, 0.00, 20.00, 'Compra inicial de herramientas', 'OC-2025-001', 1, NULL, NULL, NULL, NULL, '2026-05-02 16:05:06'),
(3, 6, 'ENTRADA', 5.00, 0.00, 5.00, 'Compra inicial equipos el├®ctricos', 'OC-2025-002', 1, NULL, NULL, NULL, NULL, '2026-05-03 16:05:06'),
(4, 18, 'ENTRADA', 8.00, 0.00, 8.00, 'Compra materiales el├®ctricos', 'OC-2025-003', 1, NULL, NULL, NULL, NULL, '2026-05-04 16:05:06'),
(5, 22, 'ENTRADA', 25.00, 0.00, 25.00, 'Compra breakers Schneider', 'OC-2025-003', 1, NULL, NULL, NULL, NULL, '2026-05-04 16:05:06'),
(6, 23, 'ENTRADA', 15.00, 0.00, 15.00, 'Compra breakers Schneider', 'OC-2025-003', 1, NULL, NULL, NULL, NULL, '2026-05-04 16:05:06'),
(7, 31, 'ENTRADA', 25.00, 0.00, 25.00, 'Compra tuber├¡a PVC', 'OC-2025-004', 2, NULL, NULL, NULL, NULL, '2026-05-05 16:05:06'),
(8, 32, 'ENTRADA', 20.00, 0.00, 20.00, 'Compra tuber├¡a PVC', 'OC-2025-004', 2, NULL, NULL, NULL, NULL, '2026-05-05 16:05:06'),
(9, 44, 'ENTRADA', 20.00, 0.00, 20.00, 'Compra EPP personal', 'OC-2025-005', 2, NULL, NULL, NULL, NULL, '2026-05-06 16:05:06'),
(10, 45, 'ENTRADA', 12.00, 0.00, 12.00, 'Compra EPP personal', 'OC-2025-005', 2, NULL, NULL, NULL, NULL, '2026-05-06 16:05:06'),
(11, 46, 'ENTRADA', 15.00, 0.00, 15.00, 'Compra EPP personal', 'OC-2025-005', 2, NULL, NULL, NULL, NULL, '2026-05-06 16:05:06'),
(12, 47, 'ENTRADA', 8.00, 0.00, 8.00, 'Compra EPP personal', 'OC-2025-005', 2, NULL, NULL, NULL, NULL, '2026-05-06 16:05:06'),
(13, 40, 'ENTRADA', 12.00, 0.00, 12.00, 'Compra lubricantes', 'OC-2025-006', 1, NULL, NULL, NULL, NULL, '2026-05-07 16:05:06'),
(14, 41, 'ENTRADA', 20.00, 0.00, 20.00, 'Compra lubricantes', 'OC-2025-006', 1, NULL, NULL, NULL, NULL, '2026-05-07 16:05:06'),
(15, 18, 'SALIDA', 2.00, 8.00, 6.00, 'Instalaci├│n tablero el├®ctrico', 'OC-2025-003', 1, 3, 'OT-2025-001', NULL, NULL, '2026-05-12 16:05:06'),
(16, 22, 'SALIDA', 5.00, 25.00, 20.00, 'Instalaci├│n tablero el├®ctrico', 'OC-2025-003', 1, 3, 'OT-2025-001', NULL, NULL, '2026-05-12 16:05:06'),
(17, 27, 'SALIDA', 8.00, 30.00, 22.00, 'Canalizaci├│n el├®ctrica', 'OC-2025-003', 1, 3, 'OT-2025-001', NULL, NULL, '2026-05-12 16:05:06'),
(18, 6, 'SALIDA', 1.00, 5.00, 4.00, 'Trabajo en obra Av. Principal', 'OT-2025-001', 1, 3, 'OT-2025-001', NULL, NULL, '2026-05-14 16:05:06'),
(19, 31, 'SALIDA', 5.00, 25.00, 20.00, 'Instalaci├│n red hidr├íulica', 'OT-2025-002', 1, 4, 'OT-2025-002', NULL, NULL, '2026-05-14 16:05:06'),
(20, 32, 'SALIDA', 3.00, 20.00, 17.00, 'Instalaci├│n red hidr├íulica', 'OT-2025-002', 1, 4, 'OT-2025-002', NULL, NULL, '2026-05-14 16:05:06'),
(21, 35, 'SALIDA', 10.00, 50.00, 40.00, 'Instalaci├│n red hidr├íulica', 'OT-2025-002', 1, 4, 'OT-2025-002', NULL, NULL, '2026-05-14 16:05:06'),
(22, 15, 'SALIDA', 1.00, 3.00, 2.00, 'Bomba para sistema de riego', 'OT-2025-002', 2, 4, 'OT-2025-002', NULL, NULL, '2026-05-17 16:05:06'),
(23, 38, 'SALIDA', 2.00, 10.00, 8.00, 'Mantenimiento preventivo maquinaria', 'OT-2025-003', 1, 5, 'OT-2025-003', NULL, NULL, '2026-05-17 16:05:06'),
(24, 39, 'SALIDA', 1.00, 8.00, 7.00, 'Mantenimiento preventivo maquinaria', 'OT-2025-003', 1, 5, 'OT-2025-003', NULL, NULL, '2026-05-17 16:05:06'),
(25, 40, 'SALIDA', 2.00, 12.00, 10.00, 'Cambio de aceite compresor', 'OT-2025-003', 1, 5, 'OT-2025-003', NULL, NULL, '2026-05-18 16:05:06'),
(26, 41, 'SALIDA', 3.00, 20.00, 17.00, 'Lubricaci├│n general equipos', 'OT-2025-003', 1, 5, 'OT-2025-003', NULL, NULL, '2026-05-18 16:05:06'),
(27, 7, 'SALIDA', 1.00, 3.00, 2.00, 'Desbaste en taller', 'OT-2025-003', 2, 5, 'OT-2025-003', NULL, NULL, '2026-05-20 16:05:06'),
(28, 52, 'SALIDA', 5.00, 20.00, 15.00, 'Trabajo de alba├▒iler├¡a', 'OT-2025-004', 2, 6, 'OT-2025-004', NULL, NULL, '2026-05-20 16:05:06'),
(29, 44, 'SALIDA', 2.00, 20.00, 18.00, 'EPP para obra', 'OT-2025-004', 2, 6, 'OT-2025-004', NULL, NULL, '2026-05-20 16:05:06'),
(30, 46, 'SALIDA', 3.00, 15.00, 12.00, 'EPP para obra', 'OT-2025-004', 2, 6, 'OT-2025-004', NULL, NULL, '2026-05-20 16:05:06'),
(31, 48, 'SALIDA', 1.00, 4.00, 3.00, 'Bota talla 42 para Antonio', 'OT-2025-004', 2, 6, 'OT-2025-004', NULL, NULL, '2026-05-21 16:05:06'),
(32, 22, 'DEVOLUCION', 2.00, 20.00, 22.00, 'Devoluci├│n breakers sobrantes OT-001', NULL, 1, 3, NULL, NULL, NULL, '2026-05-22 16:05:06'),
(33, 35, 'DEVOLUCION', 5.00, 40.00, 45.00, 'Devoluci├│n codos sobrantes OT-002', NULL, 1, 4, NULL, NULL, NULL, '2026-05-24 16:05:06'),
(34, 41, 'DEVOLUCION', 1.00, 17.00, 18.00, 'Devoluci├│n grasa sobrante OT-003', NULL, 1, 5, NULL, NULL, NULL, '2026-05-26 16:05:06'),
(35, 2, 'AJUSTE', 14.00, 20.00, 14.00, 'Ajuste por conteo f├¡sico ÔÇö 1 unidad da├▒ada', NULL, 1, NULL, NULL, NULL, NULL, '2026-05-27 16:05:06'),
(36, 10, 'AJUSTE', 4.00, 5.00, 4.00, 'Ajuste por conteo f├¡sico', NULL, 2, NULL, NULL, NULL, NULL, '2026-05-29 16:05:06'),
(37, 22, 'ENTRADA', 10.00, 22.00, 32.00, 'Reposici├│n breakers 1P 20A', 'OC-2025-010', 1, NULL, NULL, NULL, NULL, '2026-05-30 16:05:06'),
(38, 44, 'ENTRADA', 5.00, 18.00, 23.00, 'Reposici├│n cascos seguridad', 'OC-2025-011', 2, NULL, NULL, NULL, NULL, '2026-05-31 16:05:06'),
(39, 18, 'ENTRADA', 3.00, 6.00, 9.00, 'Reposici├│n cable THW 12 AWG', 'OC-2025-012', 1, NULL, NULL, NULL, NULL, '2026-06-01 16:05:06'),
(40, 7, 'DEVOLUCION', 1.00, 3.00, 4.00, 'Devolución automática al cerrar ubicación #4', NULL, 1, NULL, NULL, 27, NULL, '2026-06-01 17:28:55'),
(41, 1, 'ENTRADA', 10.00, 8.00, 18.00, 'Reposición de stock', NULL, 1, NULL, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(42, 2, 'ENTRADA', 8.00, 15.00, 23.00, 'Reposición de stock', NULL, 1, NULL, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(43, 3, 'ENTRADA', 6.00, 6.00, 12.00, 'Reposición de stock', NULL, 1, NULL, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(44, 62, 'SALIDA', 1.00, 4.00, 3.00, 'Material para trabajo en campo', NULL, 1, 3, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(45, 61, 'SALIDA', 1.00, 8.00, 7.00, 'Material para trabajo en campo', NULL, 1, 4, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(46, 60, 'SALIDA', 1.00, 5.00, 4.00, 'Material para trabajo en campo', NULL, 1, 5, NULL, NULL, NULL, '2026-06-01 19:05:25'),
(47, 4, 'SALIDA', 1.00, 10.00, 9.00, 'Corte de cable en el Hospital El Pacífico', NULL, 2, 6, NULL, NULL, NULL, '2026-06-01 19:57:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('INFO','ADVERTENCIA','ERROR','EXITO') DEFAULT 'INFO',
  `titulo` varchar(150) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `url` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id` int(11) NOT NULL,
  `rol` enum('admin','supervisor','operario') NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `puede_ver` tinyint(1) NOT NULL DEFAULT 0,
  `puede_crear` tinyint(1) NOT NULL DEFAULT 0,
  `puede_editar` tinyint(1) NOT NULL DEFAULT 0,
  `puede_eliminar` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id`, `rol`, `modulo`, `puede_ver`, `puede_crear`, `puede_editar`, `puede_eliminar`) VALUES
(1, 'admin', 'dashboard', 1, 0, 0, 0),
(2, 'admin', 'productos', 1, 1, 1, 1),
(3, 'admin', 'categorias', 1, 1, 1, 1),
(4, 'admin', 'subcategorias', 1, 1, 1, 1),
(5, 'admin', 'movimientos', 1, 1, 1, 1),
(6, 'admin', 'historial', 1, 0, 0, 0),
(7, 'admin', 'ubicaciones', 1, 1, 1, 1),
(8, 'admin', 'reportes', 1, 1, 0, 0),
(9, 'admin', 'usuarios', 1, 1, 1, 1),
(10, 'admin', 'auditoria', 1, 0, 0, 0),
(11, 'admin', 'importar', 1, 1, 0, 0),
(12, 'supervisor', 'dashboard', 1, 1, 1, 1),
(13, 'supervisor', 'productos', 1, 1, 1, 0),
(14, 'supervisor', 'categorias', 1, 1, 1, 0),
(15, 'supervisor', 'subcategorias', 1, 1, 1, 0),
(16, 'supervisor', 'movimientos', 1, 1, 1, 0),
(17, 'supervisor', 'historial', 1, 1, 1, 1),
(18, 'supervisor', 'ubicaciones', 1, 1, 1, 0),
(19, 'supervisor', 'reportes', 1, 1, 0, 0),
(20, 'supervisor', 'usuarios', 0, 0, 0, 0),
(21, 'supervisor', 'auditoria', 1, 0, 0, 0),
(22, 'supervisor', 'importar', 1, 1, 1, 1),
(23, 'operario', 'dashboard', 0, 0, 0, 0),
(24, 'operario', 'productos', 1, 1, 1, 1),
(25, 'operario', 'categorias', 1, 1, 1, 1),
(26, 'operario', 'subcategorias', 1, 1, 0, 0),
(27, 'operario', 'movimientos', 1, 1, 1, 1),
(28, 'operario', 'historial', 1, 0, 0, 0),
(29, 'operario', 'ubicaciones', 1, 1, 1, 1),
(30, 'operario', 'reportes', 1, 0, 0, 0),
(31, 'operario', 'usuarios', 0, 0, 0, 0),
(32, 'operario', 'auditoria', 0, 0, 0, 0),
(33, 'operario', 'importar', 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos_usuario`
--

CREATE TABLE `permisos_usuario` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `puede_ver` tinyint(1) DEFAULT NULL,
  `puede_crear` tinyint(1) DEFAULT NULL,
  `puede_editar` tinyint(1) DEFAULT NULL,
  `puede_eliminar` tinyint(1) DEFAULT NULL,
  `asignado_por` int(11) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_subcategoria` int(11) DEFAULT NULL,
  `stock_actual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_minimo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unidad_medida` varchar(30) NOT NULL DEFAULT 'unidad',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `id_categoria`, `id_subcategoria`, `stock_actual`, `stock_minimo`, `unidad_medida`, `activo`, `created_at`) VALUES
(1, 'Martillo de carpintero 16oz', 'Mango de fibra de vidrio, cabeza de acero', 1, 1, 18.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(2, 'Destornillador Phillips #2', 'Punta magn├®tica, mango ergon├│mico', 1, 1, 23.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(3, 'Llave ajustable 12\"', 'Acero cromo-vanadio, apertura m├íx 35mm', 1, 1, 12.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(4, 'Alicate de corte diagonal', 'Corte limpio hasta calibre 10 AWG', 1, 1, 9.00, 12.00, 'unidad', 1, '2026-06-01 16:05:06'),
(5, 'Cinta m├®trica 5m', 'Cuerpo ABS, cinta de acero inoxidable', 1, 3, 12.00, 4.00, 'unidad', 1, '2026-06-01 16:05:06'),
(6, 'Taladro percutor 13mm 750W', 'Velocidad variable, reversa, malet├¡n incluido', 1, 2, 4.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(7, 'Amoladora angular 4.5\" 850W', 'Disco de desbaste incluido, protector ajustable', 1, 2, 4.00, 1.00, 'unidad', 1, '2026-06-01 16:05:06'),
(8, 'Sierra circular 7.25\" 1400W', 'Gu├¡a paralela, hoja de 24 dientes', 1, 2, 2.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(9, 'Nivel de burbuja 60cm', 'Aluminio extruido, 3 burbujas', 1, 3, 7.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(10, 'Mult├¡metro digital UNI-T', 'Voltaje, corriente, resistencia, continuidad', 1, 3, 5.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(11, 'Detector de voltaje sin contacto', 'Rango 12-1000V AC, se├▒al sonora y visual', 1, 3, 8.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(12, 'Generador 5500W gasolina', 'Motor 4T 389cc, AVR, panel de control', 2, 6, 2.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(13, 'Generador inverter 2200W', 'Silencioso, port├ítil, arranque el├®ctrico', 2, 6, 1.00, 1.00, 'unidad', 1, '2026-06-01 16:05:06'),
(14, 'Compresor de aire 50L 2HP', 'Presi├│n m├íx 115 PSI, motor monof├ísico', 2, 7, 2.00, 1.00, 'unidad', 1, '2026-06-01 16:05:06'),
(15, 'Bomba de agua 1HP centr├¡fuga', 'Caudal 60 L/min, cabeza m├íx 35m', 2, 7, 3.00, 1.00, 'unidad', 1, '2026-06-01 16:05:06'),
(16, 'Andamio tubular 1.5x1m', 'Tubo galvanizado 1.5\", plataforma incluida', 2, 8, 6.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(17, 'Escalera telesc├│pica 6m', 'Aluminio, 12 pelda├▒os, carga m├íx 150kg', 2, 8, 3.00, 1.00, 'unidad', 1, '2026-06-01 16:05:06'),
(18, 'Cable THW 12 AWG negro x100m', 'Cobre s├│lido, aislamiento PVC 600V', 3, 11, 5.00, 2.00, 'rollo', 1, '2026-06-01 16:05:06'),
(19, 'Cable THW 10 AWG rojo x100m', 'Cobre s├│lido, aislamiento PVC 600V', 3, 11, 4.00, 2.00, 'rollo', 1, '2026-06-01 16:05:06'),
(20, 'Cable encauchetado 3x12 x50m', 'Flexible, uso industrial, 600V', 3, 11, 3.00, 1.00, 'rollo', 1, '2026-06-01 16:05:06'),
(21, 'Cable UTP Cat6 x305m', 'Caja 305m, 4 pares, CMR rated', 3, 11, 2.00, 1.00, 'caja', 1, '2026-06-01 16:05:06'),
(22, 'Breaker 1P 20A Schneider', 'Riel DIN, curva C, 6kA', 3, 12, 20.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(23, 'Breaker 2P 30A Schneider', 'Riel DIN, curva C, 6kA', 3, 12, 12.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(24, 'Breaker 3P 60A Schneider', 'Riel DIN, curva C, 10kA', 3, 12, 8.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(25, 'Interruptor diferencial 2P 25A', '30mA, clase AC, riel DIN', 3, 12, 6.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(26, 'Conduit EMT 3/4\" x3m', 'Acero galvanizado, extremos lisos', 3, 14, 30.00, 10.00, 'unidad', 1, '2026-06-01 16:05:06'),
(27, 'Conduit PVC 3/4\" x3m', 'R├¡gido, gris, UL listed', 3, 14, 25.00, 8.00, 'unidad', 1, '2026-06-01 16:05:06'),
(28, 'Canaleta ranurada 40x25mm x2m', 'PVC blanco, tapa incluida', 3, 14, 20.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(29, 'Luminaria LED 40W panel', 'Empotrable 60x60cm, 4000K, 3600lm', 3, 15, 10.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(30, 'Reflector LED 100W exterior', 'IP65, 6500K, soporte ajustable', 3, 15, 6.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(31, 'L├ímpara LED T8 18W x1.2m', 'Tubo fluorescente LED, 6500K, 1800lm', 3, 15, 24.00, 6.00, 'unidad', 1, '2026-06-01 16:05:06'),
(32, 'Tubo PVC 1/2\" x6m', 'Presi├│n, roscable, ASTM D1785', 4, 16, 20.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(33, 'Tubo PVC 3/4\" x6m', 'Presi├│n, roscable, ASTM D1785', 4, 16, 15.00, 4.00, 'unidad', 1, '2026-06-01 16:05:06'),
(34, 'Tubo CPVC 1/2\" x6m', 'Agua caliente, SDR-11, 100 PSI', 4, 16, 10.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(35, 'Tubo galvanizado 1\" x6m', 'C├®dula 40, extremos roscados', 4, 16, 8.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(36, 'Codo PVC 1/2\" 90┬░', 'Presi├│n, socket, bolsa x10', 4, 17, 50.00, 15.00, 'unidad', 1, '2026-06-01 16:05:06'),
(37, 'Tee PVC 3/4\"', 'Presi├│n, socket, bolsa x5', 4, 17, 30.00, 10.00, 'unidad', 1, '2026-06-01 16:05:06'),
(38, 'Uni├│n universal PVC 1/2\"', 'Desmontable, presi├│n', 4, 17, 20.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(39, 'Rodamiento 6205 2RS', '25x52x15mm, sellado, SKF', 5, 22, 10.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(40, 'Rodamiento 6208 ZZ', '40x80x18mm, blindado, FAG', 5, 22, 8.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(41, 'Correa en V tipo A-50', 'Neopreno, longitud exterior 1295mm', 5, 22, 6.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(42, 'Filtro de aceite Fram PH3600', 'Rosca 3/4-16 UNF, bypass 11 PSI', 5, 23, 12.00, 4.00, 'unidad', 1, '2026-06-01 16:05:06'),
(43, 'Filtro de aire 17801-0C010', 'Panel, papel, Toyota Hilux', 5, 23, 8.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(44, 'Filtro hidr├íulico HF6553', 'Spin-on, 10 micras, 3000 PSI', 5, 23, 6.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(45, 'Aceite hidr├íulico ISO 46 x20L', 'Antidesgaste, antioxidante, antiespumante', 6, 26, 8.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(46, 'Grasa multiprop├│sito NLGI 2 x1kg', 'Base litio, rango -20┬░C a 130┬░C', 6, 26, 15.00, 4.00, 'unidad', 1, '2026-06-01 16:05:06'),
(47, 'Aceite de motor 15W40 x4L', 'Mineral, API CF-4, para di├®sel', 6, 26, 10.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(48, 'WD-40 lubricante x400ml', 'Desplaza humedad, afloja piezas oxidadas', 6, 27, 8.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(49, 'Casco de seguridad clase E', 'HDPE, ranura para accesorios, blanco', 7, 31, 10.00, 4.00, 'unidad', 1, '2026-06-01 16:05:06'),
(50, 'Casco con rachet ajustable', 'ABS, suspensi├│n de 6 puntos, amarillo', 7, 31, 8.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(51, 'Guantes de cuero soldador', 'Manga larga, resistente a chispas, talla L', 7, 32, 12.00, 4.00, 'par', 1, '2026-06-01 16:05:06'),
(52, 'Guantes nitrilo talla M x100', 'Desechables, sin polvo, azul', 7, 32, 5.00, 2.00, 'caja', 1, '2026-06-01 16:05:06'),
(53, 'Guantes de hilo con puntos PVC', 'Antideslizante, talla ├║nica', 7, 32, 20.00, 6.00, 'par', 1, '2026-06-01 16:05:06'),
(54, 'Lentes de seguridad claros', 'Policarbonato, ANSI Z87.1, antirayadura', 7, 33, 15.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(55, 'Careta facial policarbonato', 'Visor 20x40cm, soporte ajustable', 7, 33, 4.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(56, 'Bota de seguridad punta acero T42', 'Cuero, suela antideslizante, CE EN ISO 20345', 7, 34, 4.00, 2.00, 'par', 1, '2026-06-01 16:05:06'),
(57, 'Bota de seguridad punta acero T43', 'Cuero, suela antideslizante, CE EN ISO 20345', 7, 34, 4.00, 2.00, 'par', 1, '2026-06-01 16:05:06'),
(58, 'Bota de seguridad punta acero T44-', 'Cuero, suela antideslizante, CE EN ISO 20345', 7, 34, 3.00, 2.00, 'par', 1, '2026-06-01 16:05:06'),
(59, 'Cemento Portland tipo I x42.5kg', 'Bolsa, resistencia 28 d├¡as: 42.5 MPa', 8, 36, 20.00, 5.00, 'unidad', 1, '2026-06-01 16:05:06'),
(60, 'Arena fina x m┬│', 'Lavada, granulometr├¡a 0-2mm', 8, 36, 4.00, 2.00, 'unidad', 1, '2026-06-01 16:05:06'),
(61, 'Cinta de embalaje transparente x6', '48mm x100m, adhesivo acr├¡lico', 9, 41, 7.00, 3.00, 'unidad', 1, '2026-06-01 16:05:06'),
(62, 'Stretch film 20\" x300m', 'Calibre 80, transparente, manual', 9, 41, 3.00, 2.00, 'rollo', 1, '2026-06-01 16:05:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_invalidas`
--

CREATE TABLE `sesiones_invalidas` (
  `id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_exp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesiones_invalidas`
--

INSERT INTO `sesiones_invalidas` (`id`, `token_hash`, `id_usuario`, `fecha_exp`, `created_at`) VALUES
(1, 'ea23d0ea0fde4461c003f161fc4eb7b6203c33c6735616fd5655cdecb11dcc68', 2, '2026-06-02 04:43:02', '2026-06-01 16:27:33'),
(2, '5a01345345d8ed0473b0a9d8b2d296d04bc535f9e31152c8224dc6df88f1bf0f', 4, '2026-06-02 05:27:47', '2026-06-01 16:28:38'),
(3, 'd011d3d500e3bc2ef769972daa53d82b6c111d6fdb425b674c06b31ae7cdd015', 1, '2026-06-02 06:23:30', '2026-06-01 18:09:51'),
(4, '848d88097a8747ece564a04e0b4b4d47ae5ebd38dc63ca7a38470ffeb5829ec8', 4, '2026-06-02 07:10:13', '2026-06-01 18:11:27'),
(5, '6b1d0a750125488f7c71c679f7a3ac9da05616af79bbdf1eeb6c44316fa31b91', 5, '2026-06-02 07:16:43', '2026-06-01 18:22:07'),
(6, '5c2eedea9b60d4ac7e33d11bc9552d3a8303404743538e792ba9d71e8dba9308', 2, '2026-06-02 07:22:44', '2026-06-01 18:26:35'),
(7, '5f718f7d06dd5052a5a47184f53eb29b1833590fdaf2de5c4a89d187cfdecf71', 1, '2026-06-02 07:26:43', '2026-06-01 18:33:02'),
(8, 'b77efd0832332c510fd7e5e9e9cb05dc800d30642a922a470c27fe8d3131a6d0', 4, '2026-06-02 07:33:12', '2026-06-01 18:39:53'),
(9, 'e19f5e7f105829d4b16349d529694d95b1bccf68aeaa2f1d228e7b8a3ef00657', 2, '2026-06-02 07:40:03', '2026-06-01 18:41:34'),
(10, '50012be67b73986a2451704bb7e8726e8765709d34900c6c04aa1827d499d44e', 4, '2026-06-02 07:41:47', '2026-06-01 18:46:29'),
(11, 'e94cd0d25462bc57a6ecefed314c3dcb8e1b42e200384e1382b8a9544da839e5', 2, '2026-06-02 07:46:39', '2026-06-01 18:54:05'),
(12, '6cb947f99a3ff1690f367198bb5159acdff37708c46a2d7bd64304e6c782550d', 4, '2026-06-02 07:54:17', '2026-06-01 18:54:45'),
(13, '20676717e948fc92ec14a4212bd68daf416c05445ddb2718de7c12a63d2d8196', 2, '2026-06-02 07:54:53', '2026-06-01 18:56:11'),
(14, '2933348f579e3e04642294489ff6d2b920f2f9ff18c9df79754ed2177e150712', 5, '2026-06-02 07:56:22', '2026-06-01 18:56:48'),
(15, '7136ffd99319786475bc2c35d5189be52f7b8eb040c4971a88e42a48dd59e279', 2, '2026-06-02 07:56:59', '2026-06-01 19:13:31'),
(16, 'f8d4bb2024a71d1f2604e084cdb8a0450399eb997842416123893ad656c7c7dc', 4, '2026-06-02 08:13:42', '2026-06-01 19:29:45'),
(17, 'd3a131b55cd51ffb0605882c44bb8703a1a4af12ba4a38da509ba72dced1f9da', 2, '2026-06-02 08:29:55', '2026-06-01 19:58:32'),
(18, '0eea06138eafefab9cd5ad7c933caa58c9412bd2bf00d467d34c01f29b897f40', 5, '2026-06-02 08:58:41', '2026-06-01 20:01:57'),
(19, '0999d00cd64e32ff3b9379e83d72f8538712746e2a4deb1ce683a0ba0f9e8568', 4, '2026-06-02 09:02:06', '2026-06-01 20:09:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategorias`
--

CREATE TABLE `subcategorias` (
  `id` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `subcategorias`
--

INSERT INTO `subcategorias` (`id`, `id_categoria`, `nombre`, `descripcion`, `activo`, `created_at`) VALUES
(1, 1, 'Manuales', NULL, 1, '2026-06-01 14:17:27'),
(2, 1, 'Eléctricas portátiles', NULL, 1, '2026-06-01 14:17:27'),
(3, 1, 'Medición', NULL, 1, '2026-06-01 14:17:27'),
(4, 1, 'Neumáticas', NULL, 1, '2026-06-01 14:17:27'),
(5, 1, 'Especializadas', NULL, 1, '2026-06-01 14:17:27'),
(6, 2, 'Generadores', NULL, 1, '2026-06-01 14:17:27'),
(7, 2, 'Compresores y bombas', NULL, 1, '2026-06-01 14:17:27'),
(8, 2, 'Andamios y escaleras', NULL, 1, '2026-06-01 14:17:27'),
(9, 2, 'Soldadura', NULL, 1, '2026-06-01 14:17:27'),
(10, 2, 'Maquinaria ligera', NULL, 1, '2026-06-01 14:17:27'),
(11, 3, 'Cables y conductores', NULL, 1, '2026-06-01 14:17:27'),
(12, 3, 'Interruptores y breakers', NULL, 1, '2026-06-01 14:17:27'),
(13, 3, 'Tomacorrientes', NULL, 1, '2026-06-01 14:17:27'),
(14, 3, 'Canalización', NULL, 1, '2026-06-01 14:17:27'),
(15, 3, 'Iluminación', NULL, 1, '2026-06-01 14:17:27'),
(16, 4, 'Tubería', NULL, 1, '2026-06-01 14:17:27'),
(17, 4, 'Conexiones y codos', NULL, 1, '2026-06-01 14:17:27'),
(18, 4, 'Llaves y válvulas', NULL, 1, '2026-06-01 14:17:27'),
(19, 4, 'Selladores', NULL, 1, '2026-06-01 14:17:27'),
(20, 4, 'Accesorios sanitarios', NULL, 1, '2026-06-01 14:17:27'),
(21, 5, 'Motores y bombas', NULL, 1, '2026-06-01 14:17:27'),
(22, 5, 'Rodamientos y bandas', NULL, 1, '2026-06-01 14:17:27'),
(23, 5, 'Filtros', NULL, 1, '2026-06-01 14:17:27'),
(24, 5, 'Sensores y controles', NULL, 1, '2026-06-01 14:17:27'),
(25, 5, 'Piezas por equipo', NULL, 1, '2026-06-01 14:17:27'),
(26, 6, 'Lubricantes y grasas', NULL, 1, '2026-06-01 14:17:27'),
(27, 6, 'Desengrasantes', NULL, 1, '2026-06-01 14:17:27'),
(28, 6, 'Pinturas', NULL, 1, '2026-06-01 14:17:27'),
(29, 6, 'Adhesivos industriales', NULL, 1, '2026-06-01 14:17:27'),
(30, 6, 'Abrasivos', NULL, 1, '2026-06-01 14:17:27'),
(31, 7, 'Cascos y barbijos', NULL, 1, '2026-06-01 14:17:27'),
(32, 7, 'Guantes', NULL, 1, '2026-06-01 14:17:27'),
(33, 7, 'Lentes y caretas', NULL, 1, '2026-06-01 14:17:27'),
(34, 7, 'Calzado de seguridad', NULL, 1, '2026-06-01 14:17:27'),
(35, 7, 'Arnés y línea de vida', NULL, 1, '2026-06-01 14:17:27'),
(36, 8, 'Cemento y agregados', NULL, 1, '2026-06-01 14:17:27'),
(37, 8, 'Bloques y ladrillos', NULL, 1, '2026-06-01 14:17:27'),
(38, 8, 'Varilla y malla', NULL, 1, '2026-06-01 14:17:27'),
(39, 8, 'Impermeabilizantes', NULL, 1, '2026-06-01 14:17:27'),
(40, 8, 'Ferretería estructural', NULL, 1, '2026-06-01 14:17:27'),
(41, 9, 'Embalaje', NULL, 1, '2026-06-01 14:17:27'),
(42, 9, 'Etiquetas', NULL, 1, '2026-06-01 14:17:27'),
(43, 9, 'Papelería', NULL, 1, '2026-06-01 14:17:27'),
(44, 9, 'Contenedores', NULL, 1, '2026-06-01 14:17:27'),
(45, 9, 'Limpieza de área', NULL, 1, '2026-06-01 14:17:27'),
(47, 1, 'El├®ctricas port├ítiles', NULL, 1, '2026-06-01 16:05:04'),
(48, 1, 'Medici├│n', NULL, 1, '2026-06-01 16:05:04'),
(49, 1, 'Neum├íticas', NULL, 1, '2026-06-01 16:05:04'),
(70, 7, 'Arn├®s y l├¡nea de vida', NULL, 1, '2026-06-01 16:05:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones_material`
--

CREATE TABLE `ubicaciones_material` (
  `id` int(11) NOT NULL,
  `id_movimiento` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `motivo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('EN_USO','EN_OBRA','PENDIENTE_DEV','EXTRAVIADO','DEVUELTO') NOT NULL DEFAULT 'EN_USO',
  `fecha_esperada_dev` date DEFAULT NULL,
  `fecha_devolucion` timestamp NULL DEFAULT NULL,
  `id_reportado_por` int(11) NOT NULL,
  `id_cerrado_por` int(11) DEFAULT NULL,
  `nota_cierre` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones_material`
--

INSERT INTO `ubicaciones_material` (`id`, `id_movimiento`, `id_producto`, `id_tecnico`, `ubicacion`, `motivo`, `descripcion`, `estado`, `fecha_esperada_dev`, `fecha_devolucion`, `id_reportado_por`, `id_cerrado_por`, `nota_cierre`, `created_at`, `updated_at`) VALUES
(1, 18, 6, 3, 'Obra Av. Principal #45, Piso 3', 'Instalaci├│n tablero el├®ctrico en curso', 'El taladro se usa para fijar el tablero. Se estima terminar esta semana.', 'EN_OBRA', '2026-05-24', NULL, 3, NULL, NULL, '2026-06-01 16:05:06', '2026-06-01 19:05:25'),
(2, 17, 27, 3, 'Obra Av. Principal #45, Bodega de piso', 'Canalizaci├│n pendiente de completar', 'Quedan 3 tramos por instalar. Material guardado en bodega de la obra bajo llave.', 'PENDIENTE_DEV', '2026-05-30', NULL, 3, NULL, NULL, '2026-06-01 16:05:06', '2026-06-01 16:05:06'),
(3, 22, 15, 4, 'Proyecto Riego Finca El Palmar, Km 12', 'Sistema de riego en instalaci├│n', 'La bomba est├í instalada provisionalmente. Se retira cuando el cliente apruebe la instalaci├│n definitiva.', 'EN_OBRA', '2026-06-08', NULL, 4, NULL, NULL, '2026-06-01 16:05:06', '2026-06-01 16:05:06'),
(4, 27, 7, 5, 'Taller de mantenimiento, Planta Norte', 'Trabajos de desbaste en estructura met├ílica', 'Proyecto de 3 semanas. La amoladora se usa diariamente.', 'DEVUELTO', '2026-06-11', '2026-06-01 17:28:55', 5, 1, NULL, '2026-06-01 16:05:06', '2026-06-01 17:28:55'),
(5, 28, 52, 6, 'Obra Calle 5 #23, Bodega exterior', 'Construcci├│n de muro de contenci├│n', 'Se usaron 3 bolsas. Las 2 restantes est├ín en la bodega de la obra. Pendiente recoger.', 'PENDIENTE_DEV', '2026-05-28', NULL, 6, NULL, NULL, '2026-06-01 16:05:06', '2026-06-01 16:05:06'),
(6, 44, 62, 3, 'Obra Puente Los Maestros', 'Trabajo programado', 'Material asignado para obra en curso', 'EN_USO', '2026-06-04', NULL, 1, NULL, NULL, '2026-06-01 19:05:25', '2026-06-01 19:05:25'),
(7, 45, 61, 4, 'Local Sede Central - Piso 3', 'Trabajo programado', 'Material asignado para obra en curso', 'EN_USO', '2026-06-08', NULL, 1, NULL, NULL, '2026-06-01 19:05:25', '2026-06-01 19:05:25'),
(8, 46, 60, 5, 'Taller Mecánico Sur', 'Trabajo programado', 'Material asignado para obra en curso', 'EN_USO', '2026-06-15', NULL, 1, NULL, NULL, '2026-06-01 19:05:25', '2026-06-01 19:05:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','supervisor','operario') NOT NULL DEFAULT 'operario',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `username`, `email`, `password_hash`, `rol`, `created_at`, `activo`) VALUES
(1, 'Fernando', 'Fernando', 'fernando@sisge.com', '$2b$10$ywUwSEz9Ss0wtYe6FaOAMuXG4h0ZgjRrB06iDpSZqxXeb8kUvP7eG', 'admin', '2026-06-01 14:42:50', 1),
(2, 'Omar', 'Omar', 'omar@sisge.com', '$2b$10$.s.FliY5DV.S5G6v.Jcfq.C7Ekj3fprad50Y7bMosECEekWBgcPL.', 'admin', '2026-06-01 14:42:50', 1),
(3, 'Santiago', 'Santiago', 'santiago@sisge.com', '$2b$10$9R1scnfYC9ng4n8Km7UGx.fM5fKq.O7W4Yqa/X8MT5miQhqQy4Nmq', 'operario', '2026-06-01 14:42:50', 1),
(4, 'Alvaro', 'Alvaro', 'alvaro@sisge.com', '$2b$10$j53k8LQsWip4Xn2te7n9lOFMZSUMLITQR6gtQDPRq3uVRsAawxZQi', 'operario', '2026-06-01 14:42:50', 1),
(5, 'Rodolfo', 'rodolfo', 'rodolfo@sisge.com', '$2b$10$/gRdLFkrri7uZy3I71trrOjyrAJq0K/YIzzF0c9X7OG2MpjRiHJ8G', 'supervisor', '2026-06-01 14:42:50', 1),
(6, 'Antonio', 'Antonio', 'antonio@sisge.com', '$2b$10$Z7KENlVDGPUR55XZPAzqpeOcbiIk4w14ECOuiXIrgGslD706ZSus6', 'operario', '2026-06-01 14:42:50', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aud_fecha` (`fecha`),
  ADD KEY `idx_aud_modulo` (`modulo`),
  ADD KEY `idx_aud_usuario` (`id_usuario`),
  ADD KEY `idx_aud_accion` (`accion`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_movimientos_tipo` (`tipo`),
  ADD KEY `idx_movimientos_fecha` (`fecha`),
  ADD KEY `idx_movimientos_tecnico` (`id_tecnico`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_leida` (`id_usuario`,`leida`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_rol_modulo` (`rol`,`modulo`);

--
-- Indices de la tabla `permisos_usuario`
--
ALTER TABLE `permisos_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario_modulo` (`id_usuario`,`modulo`),
  ADD KEY `asignado_por` (`asignado_por`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_producto_subcategoria` (`id_subcategoria`),
  ADD KEY `idx_productos_categoria` (`id_categoria`),
  ADD KEY `idx_productos_stock` (`stock_actual`);

--
-- Indices de la tabla `sesiones_invalidas`
--
ALTER TABLE `sesiones_invalidas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_fecha_exp` (`fecha_exp`);

--
-- Indices de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_subcat_cat_nombre` (`id_categoria`,`nombre`);

--
-- Indices de la tabla `ubicaciones_material`
--
ALTER TABLE `ubicaciones_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_reportado_por` (`id_reportado_por`),
  ADD KEY `id_cerrado_por` (`id_cerrado_por`),
  ADD KEY `idx_ub_movimiento` (`id_movimiento`),
  ADD KEY `idx_ub_tecnico` (`id_tecnico`),
  ADD KEY `idx_ub_estado` (`estado`),
  ADD KEY `idx_fecha_esperada_dev` (`fecha_esperada_dev`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT de la tabla `permisos_usuario`
--
ALTER TABLE `permisos_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `sesiones_invalidas`
--
ALTER TABLE `sesiones_invalidas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT de la tabla `ubicaciones_material`
--
ALTER TABLE `ubicaciones_material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD CONSTRAINT `fk_movimiento_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `movimientos_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `movimientos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `movimientos_ibfk_3` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `permisos_usuario`
--
ALTER TABLE `permisos_usuario`
  ADD CONSTRAINT `permisos_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permisos_usuario_ibfk_2` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_subcategoria` FOREIGN KEY (`id_subcategoria`) REFERENCES `subcategorias` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_subcategoria`) REFERENCES `subcategorias` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  ADD CONSTRAINT `subcategorias_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `ubicaciones_material`
--
ALTER TABLE `ubicaciones_material`
  ADD CONSTRAINT `ubicaciones_material_ibfk_1` FOREIGN KEY (`id_movimiento`) REFERENCES `movimientos` (`id`),
  ADD CONSTRAINT `ubicaciones_material_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `ubicaciones_material_ibfk_3` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ubicaciones_material_ibfk_4` FOREIGN KEY (`id_reportado_por`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ubicaciones_material_ibfk_5` FOREIGN KEY (`id_cerrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
