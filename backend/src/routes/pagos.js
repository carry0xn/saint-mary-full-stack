const express = require('express');
const joi = require('joi');
const Pago = require('../models/Pago');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Esquemas de validación
const crearPagoSchema = joi.object({
  alumnoId: joi.string().uuid().required().messages({
    'string.empty': 'ID del alumno es requerido',
    'string.guid': 'ID del alumno debe ser un UUID válido',
    'any.required': 'ID del alumno es requerido'
  }),
  montoAbonado: joi.number().positive().required().messages({
    'number.base': 'Monto debe ser un número',
    'number.positive': 'Monto debe ser mayor a 0',
    'any.required': 'Monto abonado es requerido'
  }),
  fechaPago: joi.date().max('now').required().messages({
    'date.base': 'Fecha de pago debe ser válida',
    'date.max': 'Fecha de pago no puede ser futura',
    'any.required': 'Fecha de pago es requerida'
  }),
  concepto: joi.string().valid('matricula', 'cuota_mensual').required().messages({
    'any.only': 'Concepto debe ser: matricula o cuota_mensual',
    'any.required': 'Concepto es requerido'
  }),
  mes: joi.number().integer().min(1).max(12).when('concepto', {
    is: 'cuota_mensual',
    then: joi.required(),
    otherwise: joi.optional()
  }).messages({
    'number.base': 'Mes debe ser un número',
    'number.integer': 'Mes debe ser un número entero',
    'number.min': 'Mes debe ser entre 1 y 12',
    'number.max': 'Mes debe ser entre 1 y 12',
    'any.required': 'Mes es requerido para cuotas mensuales'
  }),
  año: joi.number().integer().min(2020).max(2030).required().messages({
    'number.base': 'Año debe ser un número',
    'number.integer': 'Año debe ser un número entero',
    'number.min': 'Año debe ser 2020 o posterior',
    'number.max': 'Año no puede ser mayor a 2030',
    'any.required': 'Año es requerido'
  }),
  montoOriginal: joi.number().positive().required().messages({
    'number.base': 'Monto original debe ser un número',
    'number.positive': 'Monto original debe ser mayor a 0',
    'any.required': 'Monto original es requerido'
  }),
  descuentoAplicado: joi.number().min(0).max(100).default(0).messages({
    'number.base': 'Descuento debe ser un número',
    'number.min': 'Descuento no puede ser negativo',
    'number.max': 'Descuento no puede ser mayor a 100%'
  }),
  recargoAplicado: joi.number().min(0).max(100).default(0).messages({
    'number.base': 'Recargo debe ser un número',
    'number.min': 'Recargo no puede ser negativo',
    'number.max': 'Recargo no puede ser mayor a 100%'
  }),
  observaciones: joi.string().allow('', null).max(500).messages({
    'string.max': 'Observaciones no pueden tener más de 500 caracteres'
  }),
  metodoPago: joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'cheque').default('efectivo').messages({
    'any.only': 'Método de pago debe ser: efectivo, tarjeta, transferencia o cheque'
  })
});

// GET /api/pagos
router.get('/', async (req, res) => {
  try {
    const { alumnoId, mes, año, concepto } = req.query;
    
    const filtros = {};
    if (alumnoId) filtros.alumnoId = alumnoId;
    if (mes) filtros.mes = parseInt(mes);
    if (año) filtros.año = parseInt(año);
    if (concepto) filtros.concepto = concepto;
    
    const pagos = await Pago.getAll(filtros);

    res.json({
      success: true,
      message: 'Pagos obtenidos correctamente',
      data: pagos,
      total: pagos.length
    });

  } catch (error) {
    console.error('Get pagos error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
});

// GET /api/pagos/alumno/:alumnoId
router.get('/alumno/:alumnoId', async (req, res) => {
  try {
    const { alumnoId } = req.params;
    
    const pagos = await Pago.getByAlumnoId(alumnoId);

    res.json({
      success: true,
      message: 'Historial de pagos obtenido correctamente',
      data: pagos,
      total: pagos.length
    });

  } catch (error) {
    console.error('Get pagos by alumno error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de pagos'
    });
  }
});

// GET /api/pagos/estadisticas
router.get('/estadisticas', async (req, res) => {
  try {
    const { año } = req.query;
    const añoConsulta = año ? parseInt(año) : new Date().getFullYear();
    
    const estadisticas = await Pago.getEstadisticas(añoConsulta);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas correctamente',
      data: {
        ...estadisticas,
        año: añoConsulta,
        mes: new Date().getMonth() + 1
      }
    });

  } catch (error) {
    console.error('Get estadísticas error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// POST /api/pagos
router.post('/', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = crearPagoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { alumnoId, mes, año, concepto } = value;

    // Verificar si ya existe un pago mensual para este alumno en este mes/año
    if (concepto === 'cuota_mensual') {
      const existePago = await Pago.existePagoMensual(alumnoId, mes, año);
      if (existePago) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un pago de cuota mensual para ${año}/${mes.toString().padStart(2, '0')}`
        });
      }
    }

    const nuevoPago = await Pago.create(value);

    res.status(201).json({
      success: true,
      message: 'Pago registrado correctamente',
      data: nuevoPago
    });

  } catch (error) {
    console.error('Create pago error:', error.message);
    
    // Error de foreign key (alumno no existe)
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'El alumno especificado no existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar pago'
    });
  }
});

// GET /api/pagos/verificar-pago/:alumnoId/:mes/:año
router.get('/verificar-pago/:alumnoId/:mes/:año', async (req, res) => {
  try {
    const { alumnoId, mes, año } = req.params;
    
    const existePago = await Pago.existePagoMensual(alumnoId, parseInt(mes), parseInt(año));

    res.json({
      success: true,
      message: 'Verificación completada',
      data: {
        existePago,
        alumnoId,
        mes: parseInt(mes),
        año: parseInt(año)
      }
    });

  } catch (error) {
    console.error('Verificar pago error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al verificar pago'
    });
  }
});

module.exports = router;