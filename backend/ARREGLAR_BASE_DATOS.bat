@echo off
echo ========================================
echo  SISGE - ARREGLAR BASE DE DATOS
echo ========================================
echo.
echo Este script ejecutara TODAS las migraciones
echo necesarias para que el sistema funcione:
echo.
echo   1. add_mejoras_v2.sql (columna activo)
echo   2. add_ubicaciones.sql (tabla ubicaciones_material)
echo   3. add_precio_unitario.sql (para dashboard)
echo.
echo ========================================
echo.
pause

echo.
echo [1/3] Agregando columna 'activo' a tablas...
echo.

"C:\xampp\mysql\bin\mysql.exe" -u root -p sisge_almacen < "migrations\add_mejoras_v2.sql"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Columna 'activo' agregada
) else (
    echo [ERROR] Fallo al agregar columna 'activo'
)

echo.
echo [2/3] Creando tabla ubicaciones_material...
echo.

"C:\xampp\mysql\bin\mysql.exe" -u root -p sisge_almacen < "migrations\add_ubicaciones.sql"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Tabla ubicaciones_material creada
) else (
    echo [ERROR] Fallo al crear tabla ubicaciones_material
)

echo.
echo [3/3] Agregando campo precio_unitario...
echo.

"C:\xampp\mysql\bin\mysql.exe" -u root -p sisge_almacen < "migrations\add_precio_unitario.sql"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Campo precio_unitario agregado
) else (
    echo [ERROR] Fallo al agregar precio_unitario
)

echo.
echo ========================================
echo  PROCESO COMPLETADO
echo ========================================
echo.
echo Si no hubo errores, reinicia el backend:
echo   cd backend
echo   npm run dev
echo.
echo Y recarga el dashboard en el navegador.
echo.
pause
