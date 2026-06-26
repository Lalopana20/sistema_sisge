# ⚠️ CORRECCIONES DE SEGURIDAD URGENTES

## 🔴 ACCIÓN INMEDIATA REQUERIDA

### 1. Cambiar JWT_SECRET (CRÍTICO)

**Ejecuta este comando en Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Resultado ejemplo**: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

**Actualiza `backend/.env`**:
```env
JWT_SECRET=<pega_aqui_el_resultado_del_comando>
```

### 2. Establecer Contraseña de MySQL (CRÍTICO)

**Opción A: Desde phpMyAdmin**
1. Abre http://localhost/phpmyadmin
2. Ve a "Cuentas de usuario"
3. Edita el usuario "root"
4. Establece contraseña: `SisgeDB2024!@#`
5. Guarda

**Opción B: Desde MySQL CLI**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'SisgeDB2024!@#';
FLUSH PRIVILEGES;
```

**Actualiza `backend/.env`**:
```env
DB_PASSWORD=SisgeDB2024!@#
```

### 3. Actualizar Dependencias Vulnerables (CRÍTICO)

**Ejecuta**:
```bash
cd backend
npm uninstall xlsx
npm install --save-dev @types/node
npm audit fix
```

**Si persisten vulnerabilidades**:
```bash
npm audit fix --force
```

---

## 🟠 CORRECCIONES PRIORITARIAS (Esta Semana)

### 4. Implementar Rate Limiting

```bash
cd backend
npm install express-rate-limit
```

**Crear archivo**: `backend/src/middlewares/rateLimitMiddleware.js`
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 peticiones por 15 minutos
});

module.exports = { loginLimiter, apiLimiter };
```

**Actualizar**: `backend/src/routes/authRoutes.js`
```javascript
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/login', loginLimiter, ctrl.login);
```

### 5. Agregar Helmet

```bash
cd backend
npm install helmet
```

**Actualizar**: `backend/src/app.js`
```javascript
const helmet = require('helmet');

// Después de const app = express();
app.use(helmet());
```

### 6. Agregar Logging de Seguridad

**Crear carpeta**:
```bash
mkdir backend/logs
```

**Crear archivo**: `backend/src/utils/securityLogger.js`
```javascript
const fs = require('fs');
const path = require('path');

const logSecurity = (event, details) => {
  const log = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };
  
  const logPath = path.join(__dirname, '../../logs/security.log');
  const logDir = path.dirname(logPath);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(logPath, JSON.stringify(log) + '\n');
};

module.exports = logSecurity;
```

**Actualizar**: `backend/src/services/authService.js`
```javascript
const logSecurity = require('../utils/securityLogger');

// En el método login, después de validar contraseña
if (!valido) {
  logSecurity('LOGIN_FAILED', {
    username: usernameLower,
    timestamp: new Date().toISOString(),
  });
  throw httpError(401, 'Credenciales incorrectas');
}

// Después de login exitoso
logSecurity('LOGIN_SUCCESS', {
  username: usernameLower,
  userId: usuario.id,
  rol: usuario.rol,
});
```

### 7. Agregar Timeouts a DB

**Actualizar**: `backend/src/config/db.js`
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,  // ✅ 10 segundos
  acquireTimeout: 10000,  // ✅ 10 segundos
  timeout: 60000,         // ✅ 60 segundos
});
```

---

## ✅ Checklist de Verificación

Después de aplicar las correcciones, verifica:

- [ ] JWT_SECRET tiene 64 caracteres hexadecimales
- [ ] MySQL tiene contraseña establecida
- [ ] `npm audit` no muestra vulnerabilidades críticas
- [ ] Rate limiting funciona (prueba 6 logins fallidos)
- [ ] Helmet agrega headers de seguridad (verifica con DevTools)
- [ ] Se crean logs en `backend/logs/security.log`
- [ ] Conexiones DB tienen timeout configurado

---

## 🧪 Pruebas de Seguridad

### Probar Rate Limiting
```bash
# Hacer 6 peticiones rápidas al login
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo ""
done

# La 6ta debe devolver error 429
```

### Verificar Headers de Seguridad
```bash
curl -I http://localhost:3000/api/health

# Debe incluir:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Strict-Transport-Security: max-age=...
```

### Verificar Logs
```bash
cat backend/logs/security.log

# Debe mostrar eventos de login
```

---

## 📞 Soporte

Si encuentras problemas al aplicar estas correcciones:
1. Verifica que XAMPP esté corriendo
2. Reinicia el backend después de cada cambio
3. Revisa los logs de error en la consola
4. Consulta `AUDITORIA_SEGURIDAD.md` para más detalles

---

**IMPORTANTE**: Estas correcciones son URGENTES. Aplícalas antes de poner el sistema en producción.
