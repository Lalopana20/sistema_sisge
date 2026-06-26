const { procesarArchivo, previsualizarArchivo, TABLAS } = require('../services/importacionService');
const audit = require('../helpers/auditoriaHelper');
const logger = require('../utils/logger');

const ImportacionController = {

  // GET /api/importar/tablas — devuelve las tablas soportadas
  async tablas(req, res) {
    const info = Object.entries(TABLAS).map(([key, cfg]) => ({
      key,
      label:    cfg.label,
      columnas: cfg.columnas,
      requeridos: cfg.requeridos,
    }));
    res.json({ success: true, data: info });
  },

  // POST /api/importar/preview — analiza el archivo sin insertar
  async preview(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
      }
      const resultado = await previsualizarArchivo({
        buffer:       req.file.buffer,
        mimetype:     req.file.mimetype,
        originalname: req.file.originalname,
      });
      res.json({ success: true, data: resultado });
    } catch (err) { next(err); }
  },

  // POST /api/importar/procesar — procesa e inserta los datos
  async procesar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
      }

      const tablaForzada = req.body.tabla || null;

      // JSON.parse con manejo de error para evitar crash con payload malformado
      let mapeoForzado = null;
      if (req.body.mapeo) {
        try {
          mapeoForzado = JSON.parse(req.body.mapeo);
          if (typeof mapeoForzado !== 'object' || Array.isArray(mapeoForzado)) {
            return res.status(400).json({ success: false, error: 'El campo mapeo debe ser un objeto JSON válido' });
          }
        } catch {
          return res.status(400).json({ success: false, error: 'El campo mapeo contiene JSON inválido' });
        }
      }

      const resultado = await procesarArchivo({
        buffer:       req.file.buffer,
        mimetype:     req.file.mimetype,
        originalname: req.file.originalname,
        tablaForzada,
        mapeoForzado,
        id_usuario:   req.usuario.id,
      });

      const totalInsertados = resultado.reduce((s, r) => s + (r.insertados || 0), 0);
      const totalErrores    = resultado.reduce((s, r) => s + (r.errores?.length || 0), 0);

      await audit.registrar(req, {
        accion:         'CREAR',
        modulo:         'importacion',
        entidad_nombre: req.file.originalname,
        detalle: {
          archivo:    req.file.originalname,
          tamaño:     req.file.size,
          insertados: totalInsertados,
          errores:    totalErrores,
          hojas:      resultado.map(r => ({ hoja: r.hoja, tabla: r.tabla, insertados: r.insertados })),
        },
      });

      logger.info('Importación completada', {
        archivo: req.file.originalname,
        insertados: totalInsertados,
        errores: totalErrores,
        usuario: req.usuario.username,
      });

      res.json({ success: true, data: resultado });
    } catch (err) { next(err); }
  },
};

module.exports = ImportacionController;
