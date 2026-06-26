const REQUIRED_VARS = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  // DB_PASSWORD puede ser vacío en desarrollo con XAMPP sin contraseña
  'DB_NAME',
];

const OPTIONAL_VARS = {
  PORT:          { default: 3000,   pattern: /^\d+$/ },
  DB_PORT:       { default: 3306,   pattern: /^\d+$/ },
  DB_PASSWORD:   { default: '' },   // vacío es válido en XAMPP sin contraseña
  NODE_ENV:      { default: 'development', pattern: /^(development|production|test)$/ },
  JWT_EXPIRES_IN:{ default: '8h',   pattern: /^\d+[smhd]$/ },
  FRONTEND_URL:  { default: 'http://localhost:5173' },
};

// DB_PASSWORD puede ser undefined o vacío — ambos son válidos en desarrollo
const missing = REQUIRED_VARS.filter(v => process.env[v] === undefined || process.env[v] === null);
if (missing.length) {
  throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
  throw new Error('JWT_SECRET debe tener al menos 16 caracteres');
}

Object.entries(OPTIONAL_VARS).forEach(([key, cfg]) => {
  if (!process.env[key]) {
    process.env[key] = String(cfg.default);
  } else if (cfg.pattern && !cfg.pattern.test(process.env[key])) {
    throw new Error(`Variable de entorno ${key}=${process.env[key]} no válida`);
  }
});
