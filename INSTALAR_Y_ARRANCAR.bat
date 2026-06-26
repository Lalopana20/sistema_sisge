@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo   SISGE - Instalacion y arranque del sistema
echo ============================================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no esta en el PATH.
    echo         Descargalo desde: https://nodejs.org  (version LTS recomendada)
    echo         Luego vuelve a ejecutar este script.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado: 
node --version

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no encontrado. Reinstala Node.js.
    pause
    exit /b 1
)

echo [OK] npm encontrado:
npm --version
echo.

:: Instalar dependencias del backend
echo [1/4] Instalando dependencias del backend...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del backend.
    pause
    exit /b 1
)
echo [OK] Backend instalado.
echo.

:: Instalar dependencias del frontend
echo [2/4] Instalando dependencias del frontend...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del frontend.
    pause
    exit /b 1
)
echo [OK] Frontend instalado.
echo.

:: Verificar .env del backend
if not exist "%~dp0backend\.env" (
    echo [3/4] Creando archivo .env del backend...
    copy "%~dp0backend\.env.example" "%~dp0backend\.env"
    echo [OK] .env creado. Edita backend\.env si necesitas cambiar la contrasena de MySQL.
) else (
    echo [3/4] .env ya existe - OK
)
echo.

:: Crear usuarios en la BD
echo [4/4] Configurando usuarios en la base de datos...
echo       (Asegurate de que XAMPP MySQL este corriendo)
cd /d "%~dp0backend"
call node scripts/setupUsuarios.js
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] No se pudieron crear los usuarios.
    echo              Verifica que MySQL este corriendo en XAMPP y que la BD sisge_almacen exista.
    echo              Importa primero: backend\migrations\EJECUTAR_PRIMERO_fix_completo.sql
)
echo.

echo ============================================================
echo   INSTRUCCIONES PARA ARRANCAR EL SISTEMA
echo ============================================================
echo.
echo   PASO 1: Importa el SQL en phpMyAdmin (si es primera vez):
echo           1. Abre http://localhost/phpmyadmin
echo           2. Importa: backend\sisge_almacen.sql
echo           3. Importa: backend\migrations\EJECUTAR_PRIMERO_fix_completo.sql
echo           4. (Opcional) Importa: backend\migrations\seed_datos.sql
echo.
echo   PASO 2: Abre DOS terminales y ejecuta:
echo           Terminal 1 (backend):  cd backend  ^&^&  npm run dev
echo           Terminal 2 (frontend): cd frontend ^&^&  npm run dev
echo.
echo   PASO 3: Abre el navegador en: http://localhost:5173
echo.
echo   CREDENCIALES POR DEFECTO:
echo     Admin:    Fernando / Sisge26
echo     Admin:    Omar     / Sisge26
echo     Operario: Santiago / Sisge2026
echo.
echo ============================================================
pause
