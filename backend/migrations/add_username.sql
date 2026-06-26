-- Migración: agregar columna username a la tabla usuarios
-- Ejecutar una sola vez en la base de datos sisge_almacen

-- 1. Agregar la columna (nullable primero para no romper filas existentes)
ALTER TABLE usuarios
  ADD COLUMN username VARCHAR(50) NULL UNIQUE AFTER nombre;

-- 2. Poblar username con el prefijo del email para usuarios existentes
--    (toma la parte antes del @, ej. "fernando@sisge.com" → "fernando")
UPDATE usuarios
SET username = SUBSTRING_INDEX(email, '@', 1)
WHERE username IS NULL;

-- 3. Hacer la columna NOT NULL una vez poblada
ALTER TABLE usuarios
  MODIFY COLUMN username VARCHAR(50) NOT NULL;

-- 4. (Opcional) Actualizar contraseñas de usuarios existentes si es necesario
--    Los usuarios existentes conservan su password_hash sin cambios.
