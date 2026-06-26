# SISGE — Sistema de Gestión de Almacén

Aplicación web para control de inventario (categorías, subcategorías, productos, movimientos y reportes).

> **Nota:** Aunque el proyecto está en `xampp/htdocs`, **no es PHP**. Solo se usa XAMPP para **MySQL**. La app corre con **Node.js**.

## Requisitos

- Node.js 18+
- MySQL (XAMPP u otro)
- npm

## Instalación rápida

### 1. Base de datos

1. Inicia MySQL en XAMPP.
2. Importa `backend/sisge_almacen.sql` en phpMyAdmin.

### 2. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run setup:usuarios
npm run setup:subcategorias
npm run setup:auditoria
npm run dev
```

API en **http://localhost:3000**

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Interfaz en **http://localhost:5173**

## Usuarios

| Usuario   | Email               | Contraseña | Rol        |
|-----------|---------------------|------------|------------|
| Fernando  | fernando@sisge.com  | Sisge26    | admin      |
| Omar      | omar@sisge.com      | Sisge26    | admin      |
| Santiago  | santiago@sisge.com  | Sisge2026  | operario   |
| Alvaro    | alvaro@sisge.com    | Sisge2026  | operario   |
| Rodolfo   | rodolfo@sisge.com   | Sisge2026  | operario   |
| Antonio   | antonio@sisge.com   | Sisge2026  | operario   |

## Roles y permisos

| Acción | admin | supervisor | operario |
|--------|:-----:|:----------:|:--------:|
| Dashboard, reportes, historial | ✓ | ✓ | ✓ |
| Movimientos | ✓ | ✓ | ✓ |
| Categorías / subcategorías / productos (crear-editar) | ✓ | ✓ | — |
| Eliminar categorías, productos, subcategorías | ✓ | — | — |
| Menú **Usuarios** (crear y asignar rol) | ✓ | — | — |
| Menú **Auditoría** (log del sistema) | ✓ | — | — |
| Cambiar contraseña (menú usuario) | ✓ | ✓ | ✓ |

## Funcionalidades implementadas

### Prioridad alta
- Mensajes de error claros en todas las pantallas
- Banner **Servidor desconectado** si la API no responde
- Validación: subcategoría debe pertenecer a la categoría del producto
- Scripts `setup:usuarios`, `setup:subcategorias` y `setup:auditoria`
- **Auditoría** del sistema (login, CRUD, movimientos) — solo admin
- **Notificaciones** unificadas: éxito, error, advertencia, info y confirmación (`notify.js`)

### Prioridad media
- Reporte **por producto** (pestaña en Reportes)
- **Paginación** en Productos, Historial y Reportes
- **Filtro por subcategoría** en Productos e Historial
- **Exportar CSV** desde Reportes e Historial
- **Cambiar contraseña** desde el menú del usuario (avatar)
- Pantalla **Usuarios** para administradores
- Pestañas **Categorías** y **Subcategorías**

### Pendiente (futuro)
- Auditoría de cambios (quién editó qué)
- PDF / Excel avanzado
- Códigos de barras, múltiples almacenes
- Tests automáticos y Docker

## Producción

1. Backend: `NODE_ENV=production`, `FRONTEND_URL` con la URL del frontend.
2. Frontend: `npm run build` y `VITE_API_URL` apuntando a la API real.

## Diagnóstico

- `GET http://localhost:3000/api/health`
- Backend en **3000**, frontend en **5173**
- Si fallan subcategorías: `npm run setup:subcategorias`
- Si falla auditoría: `npm run setup:auditoria`

## Estructura

```
sisge/
├── backend/     API Express + MySQL
└── frontend/    React + Vite + Ant Design
```
