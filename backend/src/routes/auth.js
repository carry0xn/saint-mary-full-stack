const express = require('express');
const joi = require('joi');
const Usuario = require('../models/Usuario');

const router = express.Router();

// Esquemas de validación
const loginSchema = joi.object({
  emailOrUsername: joi.string().required().messages({
    'string.empty': 'Email o usuario es requerido',
    'any.required': 'Email o usuario es requerido'
  }),
  password: joi.string().min(3).required().messages({
    'string.empty': 'Contraseña es requerida',
    'string.min': 'Contraseña debe tener al menos 3 caracteres',
    'any.required': 'Contraseña es requerida'
  })
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { emailOrUsername, password } = value;

    // Autenticar usuario
    const { usuario, token } = await Usuario.authenticate(emailOrUsername, password);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          usuario: usuario.usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    
    // Errores específicos de autenticación
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      return res.status(401).json({
        success: false,
        message: 'Email/usuario o contraseña incorrectos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/verify-token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es requerido'
      });
    }

    const decoded = Usuario.verifyToken(token);
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        usuario: {
          id: decoded.id,
          email: decoded.email,
          usuario: decoded.usuario,
          nombre: decoded.nombre,
          apellido: decoded.apellido,
          rol: decoded.rol
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error.message);
    
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
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
    
    res.json({
      success: true,
      message: 'Perfil obtenido',
      data: {
        usuario: {
          id: decoded.id,
          email: decoded.email,
          usuario: decoded.usuario,
          nombre: decoded.nombre,
          apellido: decoded.apellido,
          rol: decoded.rol
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error.message);
    
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

module.exports = router;