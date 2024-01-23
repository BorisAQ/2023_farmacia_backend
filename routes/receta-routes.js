const express = require('express');
const { check } = require('express-validator');
const recetaController = require('../controllers/receta-controller');
const checkAuth = require ('../middleware/check-auth');
const router = express.Router();

router.use(checkAuth);//protege los siguientes
router.get('/:sid/recetas', recetaController.getRecetasByService);
router.get('/:rid', recetaController.getRecetaById);

router.post(
  '/',
  [
    check ('servicio').not().isEmpty(),
    check ('persona').not().isEmpty(),
    check ('medicamentos').not().isEmpty(),
    check ('fecha').not().isEmpty().toDate(),
    check ('usuario').not().isEmpty()    
  ],
  recetaController.createReceta
);

router.patch(
  '/:rid',
  [
    check ('persona').not().isEmpty(),
    check ('medicamentos').not().isEmpty(),
    check ('fecha').not().isEmpty().toDate(),
    check ('usuario').not().isEmpty()    
  ],
  recetaController.updateReceta
);

router.delete('/:rid', recetaController.deleteReceta);

module.exports = router;
