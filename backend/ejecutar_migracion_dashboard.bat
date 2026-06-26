@echo off
echo ========================================
echo  SISGE - Migracion Dashboard C2
echo ========================================
echo.
echo Este script ejecutara la migracion:
echo   - add_precio_unitario.sql
echo.
echo Necesario para el Dashboard mejorado
echo ========================================
echo.
pause

echo.
echo Ejecutando migracion...
echo.

cd /d "%~dp0"

"C:\xampp\mysql\bin\mysql.exe" -u root -p sisge_almacen < "migrations\add_precio_unitario.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  MIGRACION COMPLETADA CON EXITO
    echo ========================================
    echo.
    echo El campo precio_unitario ha sido agregado
    echo El Dashboard C2 esta listo para usar
    echo.
) else (
    echo.
    echo ========================================
    echo  ERROR EN LA MIGRACION
    echo ========================================
    echo.
    echo Por favor verifica:
    echo   1. MySQL esta corriendo
    echo   2. La contrasena es correcta
    echo   3. La base de datos sisge_almacen existe
    echo.
)

pause
