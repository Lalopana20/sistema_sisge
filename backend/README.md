# SISGE — Backend API

API REST para el Sistema de Gestión de Almacén de SISGE.

## Requisitos
- Node.js >= 18
- MySQL >= 5.7 (XAMPP)

## Instalación

```bash
npm install
```

## Configuración
Copia `.env.example` a `.env` y ajusta credenciales de MySQL y JWT.

Variables importantes:
- `FRONTEND_URL` — origen permitido en CORS (ej. `http://localhost:5173`)
- `JWT_SECRET` — clave secreta para tokens (cambiar en producción)

## Base de datos
Importa `sisge_almacen.sql` en phpMyAdmin.

## Ejecutar

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

## Endpoints principales
- POST   /api/auth/login
- GET    /api/productos
- POST   /api/movimientos
- GET    /api/reportes/dashboard

## Usuario por defecto
- Email: admin@sisge.com
- Password: Admin123
