const express = require('express');
const utilitariosController = require ('../controllers/utilitarios-controller');
const checkAuth = require ('../middleware/check-auth');
const router = express.Router();


router.use(checkAuth);//protege los siguientes
router.get('/fechaActual', utilitariosController.getFechaActual);

module.exports = router;
