const express = require('express');
const {check} = require ('express-validator');
const router = express.Router();
const usersControllers = require ('../controllers/user-controller');
const checkAuth = require ('../middleware/check-auth');

router.use(checkAuth);//protege los siguientes
router.get('/:uid', usersControllers.getUsersById);

router.patch(
    '/:uid',
    [  
        check ('name').not().isEmpty(),
        check ('email').normalizeEmail().isEmail(),
        check('password').isLength({min:6})
    ],
    usersControllers.updateUsuario
  );
router.get('/',usersControllers.getUsers );

router.get('/lista',usersControllers.getUsersList);

router.post ('/signup',
    [  
        check ('name').not().isEmpty(),
        check ('email').normalizeEmail().isEmail(),
        check('password').isLength({min:6})
    ],
usersControllers.signup);

module.exports = router;
