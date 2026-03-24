import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pagosService } from '../services/api';

const Dashboard = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const response = await pagosService.getEstadisticas();
        if (response.success) {
          setEstadisticas(response.data);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const menuItems = [
    {
      id: 'alumnos',
      title: 'Gestionar Alumnos',
      description: 'Ver, agregar y editar alumnos',
      icon: '👥',
      color: 'blue'
    },
    {
      id: 'pagos',
      title: 'Registrar Pagos',
      description: 'Registrar pagos de cuotas y matrículas',
      icon: '💰',
      color: 'green'
    },
    {
      id: 'reportes',
      title: 'Ver Reportes',
      description: 'Estadísticas y listas de pagos',
      icon: '📊',
      color: 'purple'
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Saint Mary Institute</h1>
            <p>Bienvenida/o, {user?.nombre} {user?.apellido}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Estadísticas rápidas */}
      <section className="stats-section">
        <h2>Resumen del Mes</h2>
        {loading ? (
          <div className="loading">Cargando estadísticas...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{estadisticas?.totalalumnos || 0}</div>
              <div className="stat-label">Total de Alumnos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{estadisticas?.pagosrealizadosmes || 0}</div>
              <div className="stat-label">Pagos Este Mes</div>
            </div>
            <div className="stat-card alert">
              <div className="stat-number">{estadisticas?.pagospendientes || 0}</div>
              <div className="stat-label">Pagos Pendientes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatNumber(estadisticas?.totalrecaudadomes || 0)}
              </div>
              <div className="stat-label">Recaudación Mensual</div>
            </div>
          </div>
        )}
      </section>

      {/* Menú principal */}
      <section className="main-menu">
        <h2>¿Qué desea hacer?</h2>
        <div className="menu-grid">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-card menu-${item.color}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="menu-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="quick-buttons">
          <button 
            className="quick-btn"
            onClick={() => onNavigate('alumnos', { action: 'add' })}
          >
            ➕ Agregar Alumno
          </button>
          <button 
            className="quick-btn"
            onClick={() => onNavigate('pagos', { action: 'register' })}
          >
            💳 Registrar Pago
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;