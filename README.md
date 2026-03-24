# Saint Mary Institute - Sistema de Gestión de Pagos

Sistema completo para la gestión de pagos y alumnos del Saint Mary Institute, desarrollado con Node.js, Express, React y PostgreSQL.

## 🚀 Características Principales

- ✅ **Gestión de Alumnos** - CRUD completo con información detallada
- ✅ **Sistema de Autenticación** - Login seguro con JWT
- ✅ **Dashboard Estadísticas** - Resumen de pagos y alumnos  
- ✅ **Interfaz Amigable** - Diseño responsive para profesores
- ✅ **Modo Testing** - Desarrollo sin base de datos
- ✅ **Dockerizado** - Deploy fácil con contenedores

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **joi** para validación de datos

### Frontend  
- **React** + **Vite**
- **Context API** para manejo de estado
- **CSS3** con diseño responsive
- **Fetch API** para comunicación con backend

### Infraestructura
- **Docker** + **Docker Compose**
- **PostgreSQL 15** Alpine

## 📋 Requisitos Previos

- Node.js 18+ 
- NPM o Yarn
- Docker (para producción)
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd saint-mary-students
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup  
```bash
cd frontend
npm install
```

### 4. Variables de Entorno
El backend incluye un archivo `.env` preconfigurado con:
- Modo testing habilitado
- JWT Secret
- Configuración PostgreSQL para Docker

## 🚦 Ejecución

### Modo Testing (Sin Base de Datos)
Perfecto para desarrollo y pruebas:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

### Modo Producción (Con Docker)
```bash
docker-compose up -d
```

## 🔑 Credenciales de Testing  

Para probar el sistema en modo testing:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 📊 Funcionalidades Disponibles

### Dashboard
- Estadísticas de alumnos totales
- Pagos realizados del mes
- Pagos pendientes
- Total recaudado mensual

### Gestión de Alumnos
- Lista completa de estudiantes
- Agregar nuevos alumnos
- Editar información existente
- Cambiar estado (activo/inactive)
- Sistema de búsqueda y filtros

### Sistema de Autenticación
- Login seguro con JWT
- Protección de rutas
- Sesiones persistentes

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000  
- **Documentación API:** http://localhost:3000/api/health

## 📁 Estructura del Proyecto

```
saint-mary-students/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── config/         # Configuración DB
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas API
│   │   └── services/       # Servicios auxiliares
│   ├── .env                # Variables de entorno
│   └── server.js           # Punto de entrada
├── frontend/               # Aplicación React 
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Context API
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # API calls
│   │   └── assets/         # Recursos estáticos
│   └── public/             # Archivos públicos
├── database/               # Scripts SQL
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🔄 Flujo de Desarrollo

1. **Testing Mode:** Desarrollo con datos mock
2. **Database Mode:** Conectar PostgreSQL real
3. **Production:** Deploy con Docker

## 🐳 Docker Deployment

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Solo base de datos
docker-compose up database

# Logs en tiempo real
docker-compose logs -f
```

## 📝 Notas Importantes

- El proyecto incluye datos mock para pruebas inmediatas
- La base de datos PostgreSQL está lista para producción
- El sistema está diseñado para profesores no técnicos
- Todas las rutas están protegidas con autenticación JWT

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

Proyecto desarrollado para Saint Mary Institute
- 📧 Email: admin@saintmary.edu
- 🌐 Web: [Saint Mary Institute](#)

---
⭐ **¡Si te gusta este proyecto, danos una estrella!** ⭐