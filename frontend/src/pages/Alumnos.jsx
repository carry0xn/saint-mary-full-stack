import React, { useState, useEffect } from 'react';
import { alumnosService } from '../services/api';

const Alumnos = ({ onNavigate }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    curso: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [alumnoSelected, setAlumnoSelected] = useState(null);

  // Cargar alumnos
  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const response = await alumnosService.getAll({
        search: searchTerm,
        ...filtros
      });
      
      if (response.success) {
        setAlumnos(response.data);
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al inicio y cuando cambien los filtros
  useEffect(() => {
    cargarAlumnos();
  }, [searchTerm, filtros]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (alumno) => {
    setAlumnoSelected(alumno);
    setShowForm(true);
  };

  const handleDelete = async (alumno) => {
    if (window.confirm(`¿Está seguro que desea marcar como inactivo a ${alumno.nombre} ${alumno.apellido}?`)) {
      try {
        await alumnosService.delete(alumno.id);
        cargarAlumnos(); // Recargar lista
      } catch (error) {
        alert('Error al eliminar alumno: ' + error.message);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setAlumnoSelected(null);
    cargarAlumnos();
  };

  if (showForm) {
    return (
      <AlumnoForm 
        alumno={alumnoSelected}
        onBack={() => {
          setShowForm(false);
          setAlumnoSelected(null);
        }}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="alumnos-container">
      {/* Header */}
      <header className="page-header">
        <h1>📚 Gestión de Alumnos</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            ➕ Agregar Alumno
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('dashboard')}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      {/* Filtros y búsqueda */}
      <section className="filters-section">
        <div className="search-box">
          <label htmlFor="search">🔍 Buscar por nombre, apellido o DNI:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Ej: Juan, García, 12345678"
            className="search-input"
          />
        </div>
        
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="estado">Estado:</label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="irregular">Irregulares</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              name="curso"
              value={filtros.curso}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Jardín 3">Jardín 3</option>
              <option value="Jardín 4">Jardín 4</option>
              <option value="Jardín 5">Jardín 5</option>
              <option value="1° Grado">1° Grado</option>
              <option value="2° Grado">2° Grado</option>
              <option value="3° Grado">3° Grado</option>
              <option value="4° Grado">4° Grado</option>
              <option value="5° Grado">5° Grado</option>
              <option value="6° Grado">6° Grado</option>
              <option value="7° Grado">7° Grado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lista de alumnos */}
      <section className="alumnos-list">
        {loading ? (
          <div className="loading">Cargando alumnos...</div>
        ) : alumnos.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron alumnos con esos criterios.</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <span>Mostrando {alumnos.length} alumno(s)</span>
            </div>
            
            <div className="alumnos-grid">
              {alumnos.map(alumno => (
                <div key={alumno.id} className={`alumno-card ${alumno.estado}`}>
                  <div className="alumno-header">
                    <h3>{alumno.nombre} {alumno.apellido}</h3>
                    <span className={`status-badge status-${alumno.estado}`}>
                      {alumno.estado}
                    </span>
                  </div>
                  
                  <div className="alumno-info">
                    <p><strong>DNI:</strong> {alumno.dni}</p>
                    <p><strong>Curso:</strong> {alumno.aniocurso}</p>
                    {alumno.observaciones && (
                      <p><strong>Observaciones:</strong> {alumno.observaciones}</p>
                    )}
                  </div>
                  
                  <div className="alumno-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={() => handleEdit(alumno)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn btn-pay"
                      onClick={() => onNavigate('pagos', { alumnoId: alumno.id, alumnoNombre: `${alumno.nombre} ${alumno.apellido}` })}
                    >
                      💰 Ver Pagos
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(alumno)}
                    >
                      ❌ Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

// Componente del formulario de alumno
const AlumnoForm = ({ alumno, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: alumno?.nombre || '',
    apellido: alumno?.apellido || '',
    dni: alumno?.dni || '',
    anioCurso: alumno?.aniocurso || '',
    observaciones: alumno?.observaciones || '',
    estado: alumno?.estado || 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (alumno) {
        // Actualizar
        response = await alumnosService.update(alumno.id, formData);
      } else {
        // Crear nuevo
        response = await alumnosService.create(formData);
      }

      if (response.success) {
        alert(`Alumno ${alumno ? 'actualizado' : 'creado'} correctamente`);
        onSuccess();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <header className="form-header">
        <h1>{alumno ? '✏️ Editar Alumno' : '➕ Agregar Nuevo Alumno'}</h1>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Volver a la Lista
        </button>
      </header>

      <form onSubmit={handleSubmit} className="alumno-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ej: Juan"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ej: Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dni">DNI *</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ej: 12345678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="anioCurso">Año/Curso *</label>
            <select
              id="anioCurso"
              name="anioCurso"
              value={formData.anioCurso}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleccionar curso</option>
              <option value="Jardín 3">Jardín 3</option>
              <option value="Jardín 4">Jardín 4</option>
              <option value="Jardín 5">Jardín 5</option>
              <option value="1° Grado">1° Grado</option>
              <option value="2° Grado">2° Grado</option>
              <option value="3° Grado">3° Grado</option>
              <option value="4° Grado">4° Grado</option>
              <option value="5° Grado">5° Grado</option>
              <option value="6° Grado">6° Grado</option>
              <option value="7° Grado">7° Grado</option>
            </select>
          </div>

          {alumno && (
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="activo">Activo</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            disabled={loading}
            rows="3"
            placeholder="Observaciones adicionales sobre el alumno..."
          />
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (alumno ? 'Actualizar' : 'Crear') + ' Alumno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Alumnos;