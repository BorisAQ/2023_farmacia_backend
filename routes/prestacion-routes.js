const express = require('express');
const { check } = require('express-validator');
const prestacionControllers = require('../controllers/prestacion-controller');
const checkAuth = require ('../middleware/check-auth');
const router = express.Router();

router.use(checkAuth);//protege los siguientes

router.get('/:pid', prestacionControllers.getPrestacionById);
router.get('/', prestacionControllers.getPrestaciones);

router.post(
  '/',
  [
    check('descripcion').not().isEmpty().isLength({ min: 5 }),    
    check('codigoSistema').isNumeric().not().isEmpty(),
    check ('costo').isNumeric().not().isEmpty()
  ],
  prestacionControllers.createPrestacion
);

router.patch(
  '/:pid',
  [
    check('descripcion').not().isEmpty().isLength({ min: 5 }),    
    check('codigoSistema').isNumeric().not().isEmpty(),
    check ('costo').isNumeric().not().isEmpty()
  ],
  prestacionControllers.updatePrestacion
);

router.delete('/:pid', prestacionControllers.deletePrestacion);

module.exports = router;
