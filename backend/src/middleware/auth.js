const Usuario = require('../models/Usuario');

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }

    const token = authHeader.substring(7);
    const decoded = Usuario.verifyToken(token);
    
    // Agregar información del usuario a la request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      usuario: decoded.usuario,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};