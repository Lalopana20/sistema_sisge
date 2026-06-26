// Recibe un schema Joi y devuelve un middleware que valida req.body
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,   // elimina campos no declarados en el schema
  });
  if (error) {
    const mensajes = error.details.map(d => d.message);
    return res.status(400).json({ errores: mensajes });
  }
  req.body = value; // usar el valor limpio y con defaults aplicados
  next();
};

module.exports = validate;
