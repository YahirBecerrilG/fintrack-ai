const express = require('express');
const router = express.Router();
const { getResumen } = require('../controllers/resumen.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, getResumen);

module.exports = router;