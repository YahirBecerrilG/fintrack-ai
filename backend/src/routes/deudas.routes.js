const express = require('express');
const router  = express.Router();
const {
  getAll, create, update, remove,
  getPlan, registrarPago, getPagos
} = require('../controllers/deudas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/',               getAll);
router.post('/',              create);
router.put('/:id',            update);
router.delete('/:id',         remove);
router.get('/:id/plan',       getPlan);
router.post('/:id/pagos',     registrarPago);
router.get('/:id/pagos',      getPagos);

module.exports = router;