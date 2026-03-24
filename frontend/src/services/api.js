const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función helper para manejo de respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en la respuesta del servidor');
  }
  
  return data;
};

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('saint_mary_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ======================
// AUTENTICACIÓN
// ======================

export const authService = {
  async login(emailOrUsername, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });
    
    const data = await handleResponse(response);
    
    // Guardar token en localStorage
    if (data.success && data.data.token) {
      localStorage.setItem('saint_mary_token', data.data.token);
      localStorage.setItem('saint_mary_user', JSON.stringify(data.data.usuario));
    }
    
    return data;
  },

  async verifyToken() {
    const token = localStorage.getItem('saint_mary_token');
    if (!token) throw new Error('No hay token');

    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    return handleResponse(response);
  },

  logout() {
    localStorage.removeItem('saint_mary_token');
    localStorage.removeItem('saint_mary_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('saint_mary_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ======================
// ALUMNOS
// ======================

export const alumnosService = {
  async getAll(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.curso) params.append('curso', filtros.curso);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    const url = `${API_BASE_URL}/alumnos${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async create(alumnoData) {
    const response = await fetch(`${API_BASE_URL}/alumnos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(alumnoData)
    });
    
    return handleResponse(response);
  },

  async update(id, alumnoData) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(alumnoData)
    });
    
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// ======================
// PAGOS
// ======================

export const pagosService = {
  async getAll(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.año) params.append('año', filtros.año);
    if (filtros.concepto) params.append('concepto', filtros.concepto);
    
    const url = `${API_BASE_URL}/pagos${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getByAlumno(alumnoId) {
    const response = await fetch(`${API_BASE_URL}/pagos/alumno/${alumnoId}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async create(pagoData) {
    const response = await fetch(`${API_BASE_URL}/pagos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pagoData)
    });
    
    return handleResponse(response);
  },

  async verificarPago(alumnoId, mes, año) {
    const response = await fetch(`${API_BASE_URL}/pagos/verificar-pago/${alumnoId}/${mes}/${año}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getEstadisticas(año) {
    const url = `${API_BASE_URL}/pagos/estadisticas${año ? `?año=${año}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};