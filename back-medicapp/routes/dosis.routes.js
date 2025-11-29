// back-medicapp/routes/dosis.routes.js
const { Router } = require('express');
const { getDosis, createDosis, updateDosis } = require('../controllers/dosis.controller');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.get('/:id', getDosis);
router.post('/', validateJWT, createDosis);
router.put('/:id', updateDosis);

module.exports = router;