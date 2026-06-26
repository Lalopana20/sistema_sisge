const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'ID inválido: debe ser un número entero positivo' });
  }
  req.params.id = id;
  next();
};

module.exports = validateId;
