const express  = require('express');
const router   = express.Router();
const { analyze, chat, optimizeDebt, getHistory } = require('../controllers/ai.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/analyze',       analyze);
router.post('/chat',          chat);
router.post('/optimize-debt', optimizeDebt);
router.get('/history',        getHistory);

module.exports = router;