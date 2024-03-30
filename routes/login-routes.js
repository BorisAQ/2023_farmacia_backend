const express = require('express');
const {check} = require ('express-validator');
const HttpError = require('../models/http-error');
const router = express.Router();
const loginControllers = require('../controllers/login-controller');

router.post ('/',loginControllers.login);

module.exports = router;
