import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Estados posibles
const AuthStates = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
};

// Contexto
const AuthContext = createContext();

// Reducer para manejar el estado
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: AuthStates.LOADING };
    
    case 'LOGIN_SUCCESS':
      return {
        status: AuthStates.AUTHENTICATED,
        user: action.payload.user,
        error: null
      };
    
    case 'LOGOUT':
      return {
        status: AuthStates.UNAUTHENTICATED,
        user: null,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        status: AuthStates.UNAUTHENTICATED,
        error: action.payload
      };
    
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  status: AuthStates.LOADING,
  user: null,
  error: null
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('saint_mary_token');
        if (!token) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        // Verificar si el token es válido
        const response = await authService.verifyToken();
        if (response.success) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: response.data.usuario }
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Auth check failed:', error.message);
        authService.logout();
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (emailOrUsername, password) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      const response = await authService.login(emailOrUsername, password);
      
      if (response.success) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user: response.data.usuario }
        });
        return { success: true };
      } else {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: response.message || 'Error en el login'
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error de conexión';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Función de logout
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Valores que se proporcionan al contexto
  const contextValue = {
    // Estado
    status: state.status,
    user: state.user,
    error: state.error,
    
    // Helpers
    isLoading: state.status === AuthStates.LOADING,
    isAuthenticated: state.status === AuthStates.AUTHENTICATED,
    
    // Funciones
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;