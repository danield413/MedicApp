// back-medicapp/routes/usuario.routes.js
const { Router } = require('express');
const { updateInfoBasica, updateResumenMedico, getMiResumenMedico, getInfoBasica } = require('../controllers/usuario.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

// Ruta para que el usuario obtenga su propio resumen médico
// GET /api/usuario/perfil/resumen-medico
router.get('/perfil/resumen-medico', validateJWT, getMiResumenMedico);

// Ruta para que el usuario actualice su información básica
// PUT /api/usuario/perfil/info-basica
router.put('/perfil/info-basica', validateJWT, updateInfoBasica);

// Ruta para obtener información básica por ID
// GET /api/usuario/perfil/info-basica/:id
router.get('/perfil/info-basica/:id', validateJWT, getInfoBasica);

// Ruta para que el usuario actualice su resumen médico
// PUT /api/usuario/perfil/resumen-medico
router.put('/perfil/resumen-medico', validateJWT, updateResumenMedico);

module.exports = router;