const express = require('express');

const { check } = require('express-validator');
const personaController = require('../controllers/persona-controller');

const checkAuth = require ('../middleware/check-auth');
const router = express.Router();


router.use(checkAuth);//protege los siguientes

router.get('/', personaController.getPersonas);


router.post(
  '/',
  [
    check('apellidosNombres')
      .not()
      .isEmpty(),
    check('matricula').not().isEmpty(),
    check('fechaVigencia').not().isEmpty().toDate(),
    check('codigoSistema').isNumeric().not().isEmpty()
  ],
  personaController.createPersona
);

module.exports = router;
