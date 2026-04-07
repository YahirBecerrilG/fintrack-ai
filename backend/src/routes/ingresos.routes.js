const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/ingresos.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken); // todas las rutas protegidas

router.get('/',     getAll);
router.post('/',    create);
router.put('/:id',  update);
router.delete('/:id', remove);

module.exports = router;