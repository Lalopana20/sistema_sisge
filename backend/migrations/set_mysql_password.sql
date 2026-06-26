-- ============================================================
-- SISGE - Establecer contraseña segura en MySQL
-- ============================================================
-- IMPORTANTE: Ejecutar este script en phpMyAdmin o MySQL CLI
-- ============================================================

-- Establecer contraseña para el usuario root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'SisgeDB2024!@#';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar que el cambio se aplicó
SELECT User, Host FROM mysql.user WHERE User = 'root';

-- ============================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 1. Verifica que backend/.env tenga: DB_PASSWORD=SisgeDB2024!@#
-- 2. Reinicia el backend: npm run dev
-- 3. Verifica la conexión
-- ============================================================
