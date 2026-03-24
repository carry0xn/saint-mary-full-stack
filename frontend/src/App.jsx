import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
// import Pagos from './pages/Pagos';
// import Reportes from './pages/Reportes';
import './App.css';

// Componente principal de la aplicación
const MainApp = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageProps, setPageProps] = useState({});

  // Función para navegar entre páginas
  const navigate = (page, props = {}) => {
    setCurrentPage(page);
    setPageProps(props);
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando Saint Mary Institute...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Renderizar página según currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      
      case 'alumnos':
        return <Alumnos onNavigate={navigate} {...pageProps} />;
      
      // case 'pagos':
      //   return <Pagos onNavigate={navigate} {...pageProps} />;
      
      // case 'reportes':
      //   return <Reportes onNavigate={navigate} {...pageProps} />;
      
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
};

// Componente raíz con providers
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
