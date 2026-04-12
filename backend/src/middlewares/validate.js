function validateFields(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || val === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Campos requeridos: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

function validatePositiveNumber(field) {
  return (req, res, next) => {
    const val = parseFloat(req.body[field]);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({
        error: `El campo "${field}" debe ser un número mayor a 0`,
      });
    }
    next();
  };
}

module.exports = { validateFields, validatePositiveNumber };