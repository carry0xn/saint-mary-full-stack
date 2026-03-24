const express = require('express');
const joi = require('joi');
const Alumno = require('../models/Alumno');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Esquemas de validación
const crearAlumnoSchema = joi.object({
  nombre: joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nombre es requerido',
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede tener más de 100 caracteres',
    'any.required': 'Nombre es requerido'
  }),
  apellido: joi.string().min(2).max(100).required().messages({
    'string.empty': 'Apellido es requerido',
    'string.min': 'Apellido debe tener al menos 2 caracteres',
    'string.max': 'Apellido no puede tener más de 100 caracteres',
    'any.required': 'Apellido es requerido'
  }),
  dni: joi.string().min(7).max(20).required().messages({
    'string.empty': 'DNI es requerido',
    'string.min': 'DNI debe tener al menos 7 caracteres',
    'string.max': 'DNI no puede tener más de 20 caracteres',
    'any.required': 'DNI es requerido'
  }),
  anioCurso: joi.string().required().messages({
    'string.empty': 'Año/Curso es requerido',
    'any.required': 'Año/Curso es requerido'
  }),
  observaciones: joi.string().allow('', null).max(500).messages({
    'string.max': 'Observaciones no pueden tener más de 500 caracteres'
  })
});

const actualizarAlumnoSchema = crearAlumnoSchema.keys({
  estado: joi.string().valid('activo', 'irregular', 'inactivo').messages({
    'any.only': 'Estado debe ser: activo, irregular o inactivo'
  })
});

// GET /api/alumnos
router.get('/', async (req, res) => {
  try {
    const { search, curso, estado } = req.query;
    
    let alumnos;
    
    if (search) {
      alumnos = await Alumno.search(search);
    } else if (curso) {
      alumnos = await Alumno.getByCurso(curso);
    } else {
      alumnos = await Alumno.getAll();
    }
    
    // Filtrar por estado si se especifica
    if (estado) {
      alumnos = alumnos.filter(alumno => alumno.estado === estado);
    }

    res.json({
      success: true,
      message: 'Alumnos obtenidos correctamente',
      data: alumnos,
      total: alumnos.length
    });

  } catch (error) {
    console.error('Get alumnos error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alumnos'
    });
  }
});

// GET /api/alumnos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alumno = await Alumno.getById(id);
    
    if (!alumno) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Alumno obtenido correctamente',
      data: alumno
    });

  } catch (error) {
    console.error('Get alumno error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alumno'
    });
  }
});

// POST /api/alumnos
router.post('/', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = crearAlumnoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const nuevoAlumno = await Alumno.create(value);

    res.status(201).json({
      success: true,
      message: 'Alumno creado correctamente',
      data: nuevoAlumno
    });

  } catch (error) {
    console.error('Create alumno error:', error.message);
    
    // Error de DNI duplicado
    if (error.code === '23505' && error.constraint === 'alumnos_dni_key') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un alumno con ese DNI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear alumno'
    });
  }
});

// PUT /api/alumnos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos de entrada
    const { error, value } = actualizarAlumnoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const alumnoActualizado = await Alumno.update(id, value);
    
    if (!alumnoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Alumno actualizado correctamente',
      data: alumnoActualizado
    });

  } catch (error) {
    console.error('Update alumno error:', error.message);
    
    // Error de DNI duplicado
    if (error.code === '23505' && error.constraint === 'alumnos_dni_key') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un alumno con ese DNI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar alumno'
    });
  }
});

// DELETE /api/alumnos/:id (Soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alumnoEliminado = await Alumno.softDelete(id);
    
    if (!alumnoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Alumno ${alumnoEliminado.nombre} ${alumnoEliminado.apellido} marcado como inactivo`,
      data: alumnoEliminado
    });

  } catch (error) {
    console.error('Delete alumno error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar alumno'
    });
  }
});

module.exports = router;