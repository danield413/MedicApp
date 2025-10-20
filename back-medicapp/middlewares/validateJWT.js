// ... (imports)

const validateJWT = async (req, res = response, next) => {
  // CAMBIO: Leer el token desde las cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: 'No hay token en la petición (cookie)',
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    // ... (el resto de la lógica para encontrar el usuario es igual)
    const usuario = await Usuario.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        error: 'Token no válido - usuario no existe en DB',
      });
    }

    req.usuario = usuario;    
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      error: 'Token no válido',
    });
  }
};

module.exports = {
  validateJWT,
};