# 🔔 FASE 3: SISTEMA DE NOTIFICACIONES AUTOMÁTICAS

## 📋 RESUMEN

La Fase 3 implementa un **sistema de notificaciones proactivas** que alertará automáticamente a los usuarios cuando ocurran eventos importantes en el inventario, transformando el sistema de reactivo a proactivo.

---

## 🎯 OBJETIVO

**Antes:** Los usuarios debían revisar manualmente el sistema para detectar problemas.

**Ahora:** El sistema notifica automáticamente cuando algo requiere atención.

---

## 🚀 CARACTERÍSTICAS IMPLEMENTADAS

### 1. 📦 Notificación de Stock Bajo

**Trigger:** Después de registrar un movimiento de SALIDA

**Condición:** Si `stock_nuevo <= stock_minimo`

**Destinatarios:** Administradores y supervisores

**Comportamiento:**
- Se verifica automáticamente después de cada SALIDA
- Se crea una notificación para cada admin/supervisor
- Incluye enlace directo al producto

**Ejemplo de notificación:**
```
📦 Stock bajo: Cable UTP Cat6
El producto "Cable UTP Cat6" tiene stock bajo.
Stock actual: 15 metros
Stock mínimo: 20 metros
→ Ver producto
```

---

### 2. ✅ Notificación de Stock Recuperado (Opcional)

**Trigger:** Después de registrar ENTRADA o DEVOLUCIÓN

**Condición:** Si el stock estaba bajo del mínimo y ahora se recupera

**Destinatarios:** Administradores y supervisores

**Comportamiento:**
- Se verifica después de cada ENTRADA/DEVOLUCIÓN
- Solo notifica si el stock anteriormente estaba bajo

**Ejemplo de notificación:**
```
✅ Stock recuperado: Cable UTP Cat6
El producto "Cable UTP Cat6" ha recuperado su stock mínimo.
Stock actual: 25 metros
```

---

### 3. ⏰ Alerta de Devolución Vencida

**Trigger:** Tarea cron que se ejecuta diariamente a las 8:00 AM

**Condición:** Material sin devolver por más de 7 días

**Destinatarios:**
- **Técnico responsable:** Recibe notificación personal
- **Supervisores y administradores:** Reciben resumen del técnico

**Comportamiento:**
- Revisa tabla `ubicaciones_material`
- Busca registros con `estado != 'DEVUELTO'` y `dias_fuera >= 7`
- Crea notificaciones específicas para cada rol

**Ejemplo para técnico:**
```
⏰ Devolución vencida - Acción requerida
Tienes material pendiente de devolución:
Material: Taladro Bosch GSB 13 RE
Días sin devolver: 10 días
Por favor, devuelve el material lo antes posible.
→ Ver ubicación
```

**Ejemplo para supervisor:**
```
⚠️ Juan Pérez tiene material vencido
El técnico Juan Pérez tiene material sin devolver:
Material: Taladro Bosch GSB 13 RE
Cantidad: 1 unidades
Días vencido: 10 días
→ Ver ubicaciones de Juan
```

---

### 4. 🚨 Alerta de Material EXTRAVIADO

**Trigger:** Inmediatamente al marcar una ubicación como EXTRAVIADO

**Destinatarios:** Solo administradores

**Comportamiento:**
- Se ejecuta automáticamente en el método `_ajustarStockExtraviado()`
- Después de ajustar el stock negativamente
- Incluye detalles de la pérdida y técnico responsable

**Ejemplo de notificación:**
```
🚨 Material extraviado reportado
Se ha reportado material extraviado:
Material: Sierra Circular Makita
Cantidad: 1
Técnico responsable: Juan Pérez
Ubicación registrada: Obra Los Pinos - Sector B
→ Ver ubicación
```

---

## 🏗️ ARQUITECTURA

```
┌─────────────────────────────────────────────────┐
│           TRIGGERS DE EVENTOS                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Movimiento SALIDA  →  ¿Stock bajo?             │
│  Movimiento ENTRADA →  ¿Stock recuperado?        │
│  Ubicación EXTRAVIADO  →  Notificar admin       │
│  Cron diario (8 AM)  →  Revisar vencimientos    │
│                                                  │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│      SERVICIO DE NOTIFICACIONES                  │
│   notificacionService.js                         │
├─────────────────────────────────────────────────┤
│                                                  │
│  • obtenerDestinatarios(roles)                   │
│  • notificarStockBajo(producto)                  │
│  • notificarStockRecuperado(producto)            │
│  • notificarDevolucionVencida(ubi, tipo)        │
│  • notificarMaterialExtraviado(ubi, cant)       │
│                                                  │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│          BASE DE DATOS (MySQL)                   │
│       Tabla: notificaciones                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  • id_usuario (destinatario)                     │
│  • tipo (STOCK_BAJO, DEVOLUCION_VENCIDA, etc)   │
│  • titulo (encabezado corto)                     │
│  • mensaje (descripción detallada)               │
│  • url (enlace para acción)                      │
│  • leida (boolean)                               │
│  • created_at (timestamp)                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

### **Nuevos Archivos**

#### 1. `src/tasks/alertasTask.js` ✨
**Propósito:** Tarea cron para alertas diarias de devoluciones vencidas

**Funciones principales:**
- `procesarAlertasDevolucion()` - Lógica principal de alertas
- `iniciarTareaAlertas()` - Configurar cron schedule
- `ejecutarManualmente()` - Para testing

**Configuración:**
- Horario: 8:00 AM diario (`0 8 * * *`)
- Zona horaria: America/Lima (ajustable)
- Días límite: 7 días sin devolver

---

### **Archivos Modificados**

#### 1. `src/services/notificacionService.js` 🔧
**Cambios:**
- Agregado constante `TIPOS` con tipos de notificación
- Agregado método `obtenerDestinatarios(roles)`
- Agregado método `notificarStockBajo(producto)`
- Agregado método `notificarStockRecuperado(producto)`
- Agregado método `notificarDevolucionVencida(ubicacion, tipo)`
- Agregado método `notificarMaterialExtraviado(ubicacion, cantidad)`

#### 2. `src/services/movimientoService.js` 🔧
**Cambios:**
- Importado `NotificacionService`
- Agregada verificación de stock bajo después de SALIDA
- Agregada verificación de stock recuperado después de ENTRADA/DEVOLUCIÓN
- Notificaciones se ejecutan de forma asíncrona con `setImmediate()`

#### 3. `src/services/ubicacionService.js` 🔧
**Cambios:**
- Importado `NotificacionService` y `logger`
- Agregada notificación en método `_ajustarStockExtraviado()`
- Notificación se ejecuta después de ajustar el stock

#### 4. `src/tasks/cronTasks.js` 🔧
**Cambios:**
- Importado `iniciarTareaAlertas` desde `alertasTask.js`
- Agregada inicialización de tarea de alertas en `iniciarTareas()`
- Agregado manejo de errores para la nueva tarea

---

## 📊 TIPOS DE NOTIFICACIÓN

```javascript
const TIPOS = {
  STOCK_BAJO: 'STOCK_BAJO',
  STOCK_RECUPERADO: 'STOCK_RECUPERADO',
  DEVOLUCION_VENCIDA: 'DEVOLUCION_VENCIDA',
  DEVOLUCION_PROXIMA: 'DEVOLUCION_PROXIMA',  // Reservado para futura implementación
  MATERIAL_EXTRAVIADO: 'MATERIAL_EXTRAVIADO',
  INFO: 'INFO',
};
```

---

## 🔄 FLUJOS COMPLETOS

### **Flujo 1: Stock Bajo**

```
1. Usuario registra SALIDA de 50 metros de cable
   ↓
2. movimientoService.registrar()
   - Valida stock suficiente
   - Actualiza: stock_anterior (70) → stock_nuevo (20)
   - stock_minimo = 25
   ↓
3. Detecta: stock_nuevo (20) <= stock_minimo (25)
   ↓
4. Ejecuta (asíncrono): notificarStockBajo(producto)
   ↓
5. Obtiene admins y supervisores activos
   ↓
6. Crea notificación para cada uno:
   {
     tipo: 'STOCK_BAJO',
     titulo: '📦 Stock bajo: Cable UTP Cat6',
     mensaje: 'El producto... tiene stock bajo...',
     url: '/productos/15'
   }
   ↓
7. Admin/Supervisor entra al sistema
   ↓
8. Ve badge 🔔 (1) en navbar
   ↓
9. Click → Lista de notificaciones
   ↓
10. Click en notificación → Navega a /productos/15
   ↓
11. Registra ENTRADA para reabastecer
```

---

### **Flujo 2: Material Extraviado**

```
1. Admin marca ubicación como EXTRAVIADO
   ↓
2. ubicacionService.actualizar()
   - Detecta cambio: estado → 'EXTRAVIADO'
   - Llama: _ajustarStockExtraviado()
   ↓
3. _ajustarStockExtraviado()
   - Calcula cantidad extraviada (no devuelta)
   - Crea movimiento AJUSTE negativo
   - Actualiza stock del producto
   ↓
4. Ejecuta (asíncrono): notificarMaterialExtraviado()
   ↓
5. Obtiene todos los administradores
   ↓
6. Crea notificación para cada admin:
   {
     tipo: 'MATERIAL_EXTRAVIADO',
     titulo: '🚨 Material extraviado reportado',
     mensaje: 'Se ha reportado... Técnico: Juan...',
     url: '/ubicaciones/42'
   }
   ↓
7. Administradores reciben alerta inmediata
```

---

### **Flujo 3: Alertas Diarias (Cron)**

```
1. Servidor inicia → index.js
   ↓
2. Después de 3 segundos → iniciarTareas()
   ↓
3. cronTasks.js ejecuta iniciarTareaAlertas()
   ↓
4. Se configura cron schedule: '0 8 * * *'
   ↓
5. Cada día a las 8:00 AM:
   ↓
6. procesarAlertasDevolucion()
   - Consulta UbicacionModel.alertas(7)
   - Obtiene ubicaciones con dias_fuera >= 7
   ↓
7. Para cada ubicación:
   a) notificarDevolucionVencida(ubi, 'tecnico')
      → Notifica al técnico responsable
   
   b) notificarDevolucionVencida(ubi, 'supervisor')
      → Notifica a supervisores y admins
   ↓
8. Log de resultados:
   "✅ Proceso completado: 4 notificación(es) enviada(s)"
```

---

## ⚙️ CONFIGURACIÓN

### **Zona Horaria**

Para cambiar la zona horaria de las alertas, edita `src/tasks/alertasTask.js`:

```javascript
const task = cron.schedule(CRON_SCHEDULE, async () => {
  await procesarAlertasDevolucion();
}, {
  scheduled: true,
  timezone: 'America/Lima', // 👈 Cambiar aquí
});
```

**Zonas horarias comunes:**
- `America/Lima` - Perú
- `America/Mexico_City` - México
- `America/Bogota` - Colombia
- `America/Buenos_Aires` - Argentina
- `America/Santiago` - Chile

---

### **Días Límite para Alertas**

Para cambiar el umbral de días antes de alertar, edita `src/tasks/alertasTask.js`:

```javascript
const DIAS_LIMITE_ALERTA = 7; // 👈 Cambiar aquí (ej: 5, 10, 14)
```

---

### **Horario de Ejecución**

Para cambiar el horario de las alertas diarias, edita `src/tasks/alertasTask.js`:

```javascript
const CRON_SCHEDULE = '0 8 * * *'; // 👈 Cambiar aquí
```

**Ejemplos:**
- `0 8 * * *` - 8:00 AM todos los días
- `0 9 * * 1-5` - 9:00 AM lunes a viernes
- `0 */6 * * *` - Cada 6 horas
- `30 14 * * *` - 2:30 PM todos los días

---

## 🧪 TESTING

### **Probar Alertas Manualmente**

```bash
# En la consola de Node.js del servidor
const alertasTask = require('./src/tasks/alertasTask');
await alertasTask.ejecutarManualmente();
```

O crear un script de testing:

```javascript
// scripts/testAlertas.js
require('dotenv').config();
const { ejecutarManualmente } = require('../src/tasks/alertasTask');

(async () => {
  console.log('🧪 Probando alertas de devolución vencida...');
  await ejecutarManualmente();
  console.log('✅ Test completado');
  process.exit(0);
})();
```

```bash
node scripts/testAlertas.js
```

---

### **Probar Notificación de Stock Bajo**

1. Identifica un producto con `stock_actual = stock_minimo + 10`
2. Registra una SALIDA de 11 unidades
3. Verifica que se cree la notificación en la tabla

```sql
SELECT * FROM notificaciones 
WHERE tipo = 'STOCK_BAJO' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### **Probar Notificación de Material Extraviado**

1. Crea una ubicación con estado 'EN_USO'
2. Actualiza el estado a 'EXTRAVIADO' vía API o interfaz
3. Verifica la notificación:

```sql
SELECT * FROM notificaciones 
WHERE tipo = 'MATERIAL_EXTRAVIADO' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📈 MÉTRICAS Y LOGS

### **Logs Importantes**

```
[info] Stock bajo notificado para producto 15 (Cable UTP Cat6) a 3 usuario(s)
[info] Devolución vencida notificada (tecnico) para ubicación 42 a 1 usuario(s)
[info] Material extraviado notificado para ubicación 42 a 2 administrador(es)
[info] ⏰ Iniciando proceso de alertas diarias...
[info] ✅ Proceso completado: 6 notificación(es) enviada(s)
```

### **Consultas Útiles**

```sql
-- Notificaciones creadas hoy por tipo
SELECT tipo, COUNT(*) AS total
FROM notificaciones
WHERE DATE(created_at) = CURDATE()
GROUP BY tipo;

-- Notificaciones no leídas por usuario
SELECT u.nombre, COUNT(*) AS no_leidas
FROM notificaciones n
JOIN usuarios u ON n.id_usuario = u.id
WHERE n.leida = FALSE
GROUP BY u.id, u.nombre
ORDER BY no_leidas DESC;

-- Ubicaciones que generarán alerta mañana
SELECT u.id, p.nombre AS producto, t.nombre AS tecnico,
       DATEDIFF(CURDATE(), DATE(m.fecha)) AS dias_fuera
FROM ubicaciones_material u
JOIN productos p ON u.id_producto = p.id
JOIN usuarios t ON u.id_tecnico = t.id
JOIN movimientos m ON u.id_movimiento = m.id
WHERE u.estado != 'DEVUELTO'
  AND DATEDIFF(CURDATE(), DATE(m.fecha)) >= 6
ORDER BY dias_fuera DESC;
```

---

## 🎯 BENEFICIOS

### **Para Administradores:**
- ✅ Reciben alertas inmediatas de stock bajo
- ✅ Pueden planear compras con anticipación
- ✅ Se enteran al instante de material extraviado
- ✅ Monitorean devoluciones vencidas por técnico

### **Para Supervisores:**
- ✅ Hacen seguimiento a técnicos con material vencido
- ✅ Reciben alertas de stock crítico
- ✅ Mejoran control del inventario en campo

### **Para Técnicos:**
- ✅ Reciben recordatorios automáticos de devolución
- ✅ Evitan sanciones por olvidos
- ✅ Mantienen historial limpio

### **Para el Negocio:**
- ✅ Reduce pérdidas por material extraviado
- ✅ Mejora rotación de inventario
- ✅ Previene quiebres de stock
- ✅ Aumenta responsabilidad del personal

---

## 🔮 MEJORAS FUTURAS (Opcional)

### **1. Notificación de Devolución Próxima**
Alertar 2 días antes de que venza el plazo de devolución.

### **2. Integración con Email/SMS**
Enviar notificaciones también por correo electrónico.

### **3. Notificaciones Push en el Frontend**
Mostrar alertas en tiempo real sin recargar la página.

### **4. Configuración por Usuario**
Permitir a cada usuario elegir qué notificaciones recibir.

### **5. Resumen Semanal**
Enviar reporte semanal con estadísticas del inventario.

---

## 📚 ENDPOINTS DE API

### **Listar Notificaciones del Usuario**
```
GET /api/notificaciones
Headers: Authorization: Bearer {token}
Query params: page, limit

Response:
{
  "success": true,
  "data": {
    "data": [...],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### **Contar No Leídas**
```
GET /api/notificaciones/no-leidas
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { "total": 3 }
}
```

### **Marcar como Leída**
```
PATCH /api/notificaciones/:id
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { "mensaje": "Notificación marcada como leida" }
}
```

### **Marcar Todas como Leídas**
```
PATCH /api/notificaciones
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { "mensaje": "Se marcaron 5 notificación(es) como leidas" }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Servicio de notificaciones extendido
- [x] Método `obtenerDestinatarios()`
- [x] Método `notificarStockBajo()`
- [x] Método `notificarStockRecuperado()`
- [x] Método `notificarDevolucionVencida()`
- [x] Método `notificarMaterialExtraviado()`
- [x] Integración con `movimientoService` (stock bajo/recuperado)
- [x] Integración con `ubicacionService` (material extraviado)
- [x] Tarea cron para alertas diarias
- [x] Configuración de zona horaria
- [x] Logs informativos
- [x] Documentación completa

---

## 🚀 PRÓXIMOS PASOS

1. **Reiniciar el servidor backend** para activar las tareas cron
2. **Probar notificaciones** manualmente (ver sección Testing)
3. **Verificar logs** para confirmar que las tareas se ejecutan
4. **Monitorear** durante unos días para ajustar configuración
5. **Frontend:** Implementar badge de notificaciones y panel

---

## 📞 SOPORTE

Si encuentras algún problema:
- Revisa los logs en `backend/logs/combined.log`
- Verifica que la tabla `notificaciones` existe
- Confirma que hay usuarios con rol `admin` o `supervisor`
- Verifica que la zona horaria es correcta

---

**Fecha de implementación:** Junio 3, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Implementado y documentado
