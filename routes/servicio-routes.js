const express = require('express');
const { check } = require('express-validator');
const servicioControllers = require('../controllers/servicio-controller');
const checkAuth = require ('../middleware/check-auth');
const router = express.Router();
router.use(checkAuth);//protege los siguientes
router.get('/:sid', servicioControllers.getServicioById);
router.get('/', servicioControllers.getServicios);


router.post(
  '/',
  [
    check('name')
      .not()
      .isEmpty(),
    check('codigoSistema').isNumeric().not().isEmpty()
  ],
  servicioControllers.createServicio
);

router.patch(
  '/:sid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('codigoSistema').isNumeric().not().isEmpty()
  ],
  servicioControllers.updateServicio
);

router.delete('/:sid', servicioControllers.deleteServicio);

module.exports = router;
