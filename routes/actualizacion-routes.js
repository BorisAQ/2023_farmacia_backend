const express = require('express');
const { check } = require('express-validator');
const actualizacionControllers = require ('../controllers/actualizacion-controller')
const checkAuth = require ('../middleware/check-auth');
const router = express.Router();

router.use(checkAuth);//protege los siguientes

router.get('/', actualizacionControllers.getActualizacion);
router.post(
  '/',
  [
    check ('fechaActualizacion').not().isEmpty().toDate(),
  ],
  actualizacionControllers.createActualizacion
);

router.patch(
  '/',
  [
    check ('fechaActualizacion').not().isEmpty().toDate(),
  ],
  actualizacionControllers.updateActualizacion
);

module.exports = router;
