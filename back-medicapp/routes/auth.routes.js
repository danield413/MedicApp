const { Router } = require('express');

// 1. Importar los controladores que ya creamos
const { 
  register, 
  login, 
  logout,
  renew, 
  newPassword,
  loginDomiciliario,
  forgotPassword
} = require('../controllers/auth.controller');

const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/renew', validateJWT, renew);
router.post('/new-password', validateJWT, newPassword);
router.post('/domiciliario/login', loginDomiciliario);
router.post('/forgot-password', forgotPassword);

module.exports = router;