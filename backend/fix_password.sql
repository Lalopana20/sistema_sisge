-- Ejecuta esto en phpMyAdmin si ya importaste sisge_almacen.sql antes
-- Actualiza la contraseña de TODOS los admins a: Admin123
--
-- ⚠️ Los emails reales de admin son fernando@sisge.com y omar@sisge.com,
--    NO admin@sisge.com (ese email no existe en el seed).

USE sisge_almacen;

UPDATE usuarios
SET password_hash = '$2b$10$wv2hCD0zntyFxy12OPyIV.kfpozfv45oFMzDzR.hPtdV25rhnCzry'
WHERE rol = 'admin';

-- Verificar
SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin';
