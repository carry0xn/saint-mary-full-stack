const { getDB } = require('../config/database');

// Datos mock para testing
let MOCK_ALUMNOS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    observaciones: 'Alumno ejemplar',
    aniocurso: '3° Grado',
    estado: 'activo',
    fechainscripcion: '2025-03-01',
    createdat: '2025-03-01T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'María',
    apellido: 'García',
    dni: '23456789',
    observaciones: 'Hermana de Pedro García',
    aniocurso: '5° Grado',
    estado: 'activo',
    fechainscripcion: '2025-03-01',
    createdat: '2025-03-01T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre: 'Pedro',
    apellido: 'García',
    dni: '34567890',
    observaciones: 'Hermano de María García',
    aniocurso: '2° Grado',
    estado: 'activo',
    fechainscripcion: '2025-03-01',
    createdat: '2025-03-01T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    nombre: 'Ana',
    apellido: 'López',
    dni: '45678901',
    observaciones: 'Nueva estudiante',
    aniocurso: '1° Grado',
    estado: 'activo',
    fechainscripcion: '2026-02-15',
    createdat: '2026-02-15T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    nombre: 'Carlos',
    apellido: 'Martínez',
    dni: '56789012',
    observaciones: 'Alumno avanzado',
    aniocurso: '6° Grado',
    estado: 'irregular',
    fechainscripcion: '2024-03-01',
    createdat: '2024-03-01T10:00:00Z'
  }
];

class Alumno {
  // Obtener todos los alumnos activos
  static async getAll() {
    // Si estamos en modo testing, usar datos mock
    if (process.env.TESTING_MODE === 'true') {
      return MOCK_ALUMNOS.filter(alumno => alumno.estado !== 'inactivo');
    }

    const db = getDB();
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion,
        created_at as createdAt
      FROM alumnos 
      WHERE estado != 'inactivo'
      ORDER BY apellido, nombre
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Obtener alumno por ID
  static async getById(id) {
    // Si estamos en modo testing, usar datos mock
    if (process.env.TESTING_MODE === 'true') {
      return MOCK_ALUMNOS.find(alumno => alumno.id === id);
    }

    const db = getDB();
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion,
        created_at as createdAt
      FROM alumnos 
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Buscar alumnos (por nombre, apellido o DNI)
  static async search(searchTerm) {
    // Si estamos en modo testing, usar datos mock
    if (process.env.TESTING_MODE === 'true') {
      const term = searchTerm.toLowerCase();
      return MOCK_ALUMNOS.filter(alumno => 
        alumno.estado !== 'inactivo' && (
          alumno.nombre.toLowerCase().includes(term) ||
          alumno.apellido.toLowerCase().includes(term) ||
          alumno.dni.includes(searchTerm)
        )
      );
    }

    const db = getDB();
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion
      FROM alumnos 
      WHERE estado != 'inactivo'
        AND (
          LOWER(nombre) LIKE LOWER($1) OR 
          LOWER(apellido) LIKE LOWER($1) OR 
          dni LIKE $1
        )
      ORDER BY apellido, nombre
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(query, [searchPattern]);
    return result.rows;
  }

  // Crear nuevo alumno
  static async create(alumnoData) {
    // Si estamos en modo testing, simular creación
    if (process.env.TESTING_MODE === 'true') {
      const nuevoAlumno = {
        id: `550e8400-e29b-41d4-a716-${Date.now()}`,
        ...alumnoData,
        estado: 'activo',
        fechainscripcion: new Date().toISOString().split('T')[0],
        createdat: new Date().toISOString()
      };
      MOCK_ALUMNOS.push(nuevoAlumno);
      return nuevoAlumno;
    }

    const db = getDB();
    const { nombre, apellido, dni, observaciones, anioCurso } = alumnoData;
    
    const query = `
      INSERT INTO alumnos (nombre, apellido, dni, observaciones, año_curso)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion,
        created_at as createdAt
    `;
    
    const values = [nombre, apellido, dni, observaciones || null, anioCurso];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Actualizar alumno
  static async update(id, alumnoData) {
    // Si estamos en modo testing, simular actualización
    if (process.env.TESTING_MODE === 'true') {
      const index = MOCK_ALUMNOS.findIndex(alumno => alumno.id === id);
      if (index === -1) return null;
      
      MOCK_ALUMNOS[index] = {
        ...MOCK_ALUMNOS[index],
        ...alumnoData,
        updatedat: new Date().toISOString()
      };
      return MOCK_ALUMNOS[index];
    }

    const db = getDB();
    const { nombre, apellido, dni, observaciones, anioCurso, estado } = alumnoData;
    
    const query = `
      UPDATE alumnos 
      SET 
        nombre = $1, 
        apellido = $2, 
        dni = $3, 
        observaciones = $4, 
        año_curso = $5, 
        estado = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion,
        updated_at as updatedAt
    `;
    
    const values = [nombre, apellido, dni, observaciones, anioCurso, estado || 'activo', id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Marcar como inactivo (soft delete)
  static async softDelete(id) {
    // Si estamos en modo testing, simular eliminación
    if (process.env.TESTING_MODE === 'true') {
      const index = MOCK_ALUMNOS.findIndex(alumno => alumno.id === id);
      if (index === -1) return null;
      
      MOCK_ALUMNOS[index].estado = 'inactivo';
      return {
        id: MOCK_ALUMNOS[index].id,
        nombre: MOCK_ALUMNOS[index].nombre,
        apellido: MOCK_ALUMNOS[index].apellido
      };
    }

    const db = getDB();
    const query = `
      UPDATE alumnos 
      SET estado = 'inactivo', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nombre, apellido
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Obtener alumnos por curso
  static async getByCurso(anioCurso) {
    // Si estamos en modo testing, usar datos mock
    if (process.env.TESTING_MODE === 'true') {
      return MOCK_ALUMNOS.filter(alumno => 
        alumno.aniocurso === anioCurso && alumno.estado !== 'inactivo'
      );
    }

    const db = getDB();
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        dni, 
        observaciones, 
        año_curso as anioCurso, 
        estado,
        fecha_inscripcion as fechaInscripcion
      FROM alumnos 
      WHERE año_curso = $1 AND estado != 'inactivo'
      ORDER BY apellido, nombre
    `;
    const result = await db.query(query, [anioCurso]);
    return result.rows;
  }
}

module.exports = Alumno;