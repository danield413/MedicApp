// back-medicapp/routes/usuario.routes.js
const { Router } = require('express');
const { updateInfoBasica, updateResumenMedico, getMiResumenMedico, getInfoBasica } = require('../controllers/usuario.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.get('/perfil/resumen-medico', validateJWT, getMiResumenMedico);
router.put('/perfil/info-basica', validateJWT, updateInfoBasica);
router.get('/perfil/info-basica/:id', validateJWT, getInfoBasica);
router.put('/perfil/resumen-medico', validateJWT, updateResumenMedico);

module.exports = router;