const { getDB } = require('../config/database');

// Datos mock para testing - estadísticas simuladas
const MOCK_ESTADISTICAS = {
  totalalumnos: 5,
  pagosrealizadosmes: 12,
  pagospendientes: 2,
  totalrecaudadomes: 450000
};

class Pago {
  // Obtener todos los pagos con información del alumno
  static async getAll(filtros = {}) {
    // Si estamos en modo testing, retornar array vacío por ahora
    if (process.env.TESTING_MODE === 'true') {
      return [];
    }

    const db = getDB();
    
    let query = `
      SELECT 
        p.id, 
        p.monto_abonado as montoAbonado,
        p.fecha_pago as fechaPago,
        p.concepto,
        p.mes,
        p.año,
        p.descuento_aplicado as descuentoAplicado,
        p.recargo_aplicado as recargoAplicado,
        p.monto_original as montoOriginal,
        p.observaciones,
        p.metodo_pago as metodoPago,
        p.created_at as createdAt,
        a.nombre as alumnoNombre,
        a.apellido as alumnoApellido,
        a.dni as alumnoDni,
        a.año_curso as alumnoCurso
      FROM pagos p
      JOIN alumnos a ON p.alumno_id = a.id
    `;
    
    const conditions = [];
    const values = [];
    let valueIndex = 1;

    if (filtros.alumnoId) {
      conditions.push(`p.alumno_id = $${valueIndex}`);
      values.push(filtros.alumnoId);
      valueIndex++;
    }

    if (filtros.mes) {
      conditions.push(`p.mes = $${valueIndex}`);
      values.push(filtros.mes);
      valueIndex++;
    }

    if (filtros.año) {
      conditions.push(`p.año = $${valueIndex}`);
      values.push(filtros.año);
      valueIndex++;
    }

    if (filtros.concepto) {
      conditions.push(`p.concepto = $${valueIndex}`);
      values.push(filtros.concepto);
      valueIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.fecha_pago DESC, a.apellido, a.nombre';

    const result = await db.query(query, values);
    return result.rows;
  }

  // Obtener pagos por alumno
  static async getByAlumnoId(alumnoId) {
    // Si estamos en modo testing, retornar array vacío por ahora
    if (process.env.TESTING_MODE === 'true') {
      return [];
    }

    const db = getDB();
    const query = `
      SELECT 
        p.id, 
        p.monto_abonado as montoAbonado,
        p.fecha_pago as fechaPago,
        p.concepto,
        p.mes,
        p.año,
        p.descuento_aplicado as descuentoAplicado,
        p.recargo_aplicado as recargoAplicado,
        p.monto_original as montoOriginal,
        p.observaciones,
        p.metodo_pago as metodoPago,
        p.created_at as createdAt
      FROM pagos p
      WHERE p.alumno_id = $1
      ORDER BY p.año DESC, p.mes DESC, p.fecha_pago DESC
    `;
    const result = await db.query(query, [alumnoId]);
    return result.rows;
  }

  // Crear nuevo pago
  static async create(pagoData) {
    // Si estamos en modo testing, simular creación
    if (process.env.TESTING_MODE === 'true') {
      return {
        id: `pago-${Date.now()}`,
        ...pagoData,
        createdAt: new Date().toISOString()
      };
    }

    const db = getDB();
    const { 
      alumnoId, 
      montoAbonado, 
      fechaPago, 
      concepto, 
      mes, 
      año, 
      descuentoAplicado = 0,
      recargoAplicado = 0,
      montoOriginal,
      observaciones,
      metodoPago = 'efectivo'
    } = pagoData;
    
    const query = `
      INSERT INTO pagos (
        alumno_id, 
        monto_abonado, 
        fecha_pago, 
        concepto, 
        mes, 
        año,
        descuento_aplicado,
        recargo_aplicado,
        monto_original,
        observaciones,
        metodo_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, 
        monto_abonado as montoAbonado,
        fecha_pago as fechaPago,
        concepto,
        mes,
        año,
        descuento_aplicado as descuentoAplicado,
        recargo_aplicado as recargoAplicado,
        monto_original as montoOriginal,
        observaciones,
        metodo_pago as metodoPago,
        created_at as createdAt
    `;
    
    const values = [
      alumnoId, 
      montoAbonado, 
      fechaPago, 
      concepto, 
      mes, 
      año,
      descuentoAplicado,
      recargoAplicado,
      montoOriginal,
      observaciones,
      metodoPago
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Verificar si un alumno ya pagó en un mes específico
  static async existePagoMensual(alumnoId, mes, año) {
    // Si estamos en modo testing, siempre retornar false para permitir pagos
    if (process.env.TESTING_MODE === 'true') {
      return false;
    }

    const db = getDB();
    const query = `
      SELECT id 
      FROM pagos 
      WHERE alumno_id = $1 AND mes = $2 AND año = $3 AND concepto = 'cuota_mensual'
      LIMIT 1
    `;
    const result = await db.query(query, [alumnoId, mes, año]);
    return result.rows.length > 0;
  }

  // Obtener estadísticas básicas
  static async getEstadisticas(año = new Date().getFullYear()) {
    // Si estamos en modo testing, retornar datos mock
    if (process.env.TESTING_MODE === 'true') {
      return MOCK_ESTADISTICAS;
    }

    const db = getDB();
    const mes = new Date().getMonth() + 1; // Mes actual (1-12)
    
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM alumnos WHERE estado = 'activo') as totalAlumnos,
        (SELECT COUNT(*) FROM pagos WHERE EXTRACT(MONTH FROM fecha_pago) = $1 AND año = $2) as pagosRealizadosMes,
        (SELECT COUNT(DISTINCT alumno_id) 
         FROM alumnos a 
         LEFT JOIN pagos p ON a.id = p.alumno_id 
         AND p.mes = $1 AND p.año = $2 AND p.concepto = 'cuota_mensual'
         WHERE a.estado = 'activo' AND p.id IS NULL) as pagosPendientes,
        (SELECT COALESCE(SUM(monto_abonado), 0) 
         FROM pagos WHERE EXTRACT(MONTH FROM fecha_pago) = $1 AND año = $2) as totalRecaudadoMes
    `;
    
    const result = await db.query(query, [mes, año]);
    return result.rows[0];
  }
}

module.exports = Pago;