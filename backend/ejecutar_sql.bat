@echo off
echo Ejecutando migracion SQL...
C:\xampp\mysql\bin\mysql.exe -u root sisge_almacen < migrations\add_permisos_y_tablas.sql
if %errorlevel% equ 0 (
    echo.
    echo ✓ Migracion ejecutada exitosamente
    echo.
    echo Verificando tablas creadas...
    C:\xampp\mysql\bin\mysql.exe -u root sisge_almacen -e "SHOW TABLES;"
    echo.
    echo Verificando permisos...
    C:\xampp\mysql\bin\mysql.exe -u root sisge_almacen -e "SELECT COUNT(*) as total FROM permisos;"
) else (
    echo.
    echo × Error ejecutando la migracion
)
pause
