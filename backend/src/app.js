const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const app = express();

// Middlewares de seguridad
const isProduction = process.env.NODE_ENV === 'production';

// Parsear orígenes permitidos una sola vez (soporta múltiples separados por coma)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const origenesPermitidos = FRONTEND_URL.split(',').map((o) => o.trim());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // unsafe-inline necesario para Ant Design / Vite en dev; en prod se debe usar nonces
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Se elimina unsafe-eval y unsafe-inline de scripts para prevenir XSS
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      // connectSrc incluye todos los orígenes permitidos (soporta múltiples en producción)
      connectSrc: ["'self'", ...origenesPermitidos],
    },
  },
  // HSTS solo en producción con HTTPS; en desarrollo causa problemas con HTTP
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
}));

app.use(compression());
app.use(cookieParser());

// Límite aumentado para importación de archivos (Excel, PDF, Word)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS — usa los mismos orígenes ya parseados arriba para helmet
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origenesPermitidos.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Rate limit general
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
app.use('/api/', apiLimiter);

// Rutas
const authRoutes          = require('./routes/authRoutes');
const categoriaRoutes     = require('./routes/categoriaRoutes');
const subcategoriaRoutes  = require('./routes/subcategoriaRoutes');
const productoRoutes      = require('./routes/productoRoutes');
const movimientoRoutes    = require('./routes/movimientoRoutes');
const reporteRoutes       = require('./routes/reporteRoutes');
const usuarioRoutes       = require('./routes/usuarioRoutes');
const auditoriaRoutes     = require('./routes/auditoriaRoutes');
const ubicacionRoutes     = require('./routes/ubicacionRoutes');
const permisoRoutes       = require('./routes/permisoRoutes');
const importacionRoutes   = require('./routes/importacionRoutes');
const notificacionRoutes  = require('./routes/notificacionRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const actividadRoutes     = require('./routes/actividadRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');

app.use('/api/auth',           authRoutes);
app.use('/api/categorias',     categoriaRoutes);
app.use('/api/subcategorias',  subcategoriaRoutes);
app.use('/api/productos',      productoRoutes);
app.use('/api/movimientos',    movimientoRoutes);
app.use('/api/reportes',       reporteRoutes);
app.use('/api/usuarios',       usuarioRoutes);
app.use('/api/auditoria',      auditoriaRoutes);
app.use('/api/ubicaciones',    ubicacionRoutes);
app.use('/api/permisos',       permisoRoutes);
app.use('/api/importar',       importacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/actividad',      actividadRoutes);
app.use('/api/configuracion',  configuracionRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API SISGE Almacén funcionando', version: '1.0.0' });
});

app.get('/api/health', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.json({ status: 'ok', timestamp: new Date() });
  }
  try {
    const db   = require('./config/db');
    const conn = await db.getConnection();
    conn.release();
    res.json({ status: 'ok', db: 'conectada', timestamp: new Date() });
  } catch {
    res.status(500).json({ status: 'error', db: 'desconectada' });
  }
});

// Middleware de errores
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;
