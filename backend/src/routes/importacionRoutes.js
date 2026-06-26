const router  = require('express').Router();
const multer  = require('multer');
const ctrl    = require('../controllers/importacionController');
const auth    = require('../middlewares/authMiddleware');
const { verificarPermiso } = require('../middlewares/permisoMiddleware');

// Multer en memoria — sin escribir al disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (_req, file, cb) => {
    const permitidos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel',                                           // .xls
      'application/pdf',                                                    // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    const ext = file.originalname.split('.').pop().toLowerCase();
    const extPermitidas = ['xlsx', 'xls', 'pdf', 'docx'];

    if (permitidos.includes(file.mimetype) || extPermitidas.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Use .xlsx, .xls, .pdf o .docx'));
    }
  },
});

// Manejo de error de multer
const handleUpload = (req, res, next) => {
  upload.single('archivo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'El archivo supera el límite de 10 MB' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

router.get('/tablas',    auth, ctrl.tablas);
router.post('/preview',  auth, verificarPermiso('importar', 'ver'),    handleUpload, ctrl.preview);
router.post('/procesar', auth, verificarPermiso('importar', 'crear'),  handleUpload, ctrl.procesar);

module.exports = router;
