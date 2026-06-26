@echo off
echo ========================================
echo PERMISOS DE OPERARIO
echo ========================================
C:\xampp\mysql\bin\mysql.exe -u root sisge_almacen -e "SELECT rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar FROM permisos WHERE rol = 'operario' ORDER BY modulo;"
echo.
echo ========================================
echo PERMISOS DE ADMIN
echo ========================================
C:\xampp\mysql\bin\mysql.exe -u root sisge_almacen -e "SELECT rol, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar FROM permisos WHERE rol = 'admin' ORDER BY modulo;"
pause
