const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Datos mock para testing
const MOCK_USERS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@saintmary.edu',
    usuario: 'admin',
    password_hash: '$2b$10$GYZ8invOqOyMJxTAEla41.2StNQ2UMJiyoo/8wnA9tzY0QSEbAbrm', // admin123
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: 'admin',
    activo: true
  }
];

class Usuario {
  // Buscar usuario por email o username
  static async findByEmailOrUsername(emailOrUsername) {
    // Si estamos en modo testing, usar datos mock
    if (process.env.TESTING_MODE === 'true') {
      return MOCK_USERS.find(user => 
        user.email === emailOrUsername || user.usuario === emailOrUsername
      );
    }

    const db = getDB();
    const query = `
      SELECT 
        id, 
        email, 
        usuario, 
        password_hash, 
        nombre, 
        apellido, 
        rol, 
        activo,
        created_at as createdAt
      FROM usuarios 
      WHERE (email = $1 OR usuario = $1) AND activo = true
    `;
    const result = await db.query(query, [emailOrUsername]);
    return result.rows[0];
  }

  // Verificar password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generar JWT token
  static generateToken(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  // Autenticar usuario
  static async authenticate(emailOrUsername, password) {
    const usuario = await this.findByEmailOrUsername(emailOrUsername);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await this.verifyPassword(password, usuario.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    // No retornar el hash de la contraseña
    const { password_hash, ...usuarioSinPassword } = usuario;
    
    return {
      usuario: usuarioSinPassword,
      token: this.generateToken(usuario)
    };
  }

  // Crear nuevo usuario (para futuras expansiones)
  static async create(usuarioData) {
    // Si estamos en modo testing, simular creación
    if (process.env.TESTING_MODE === 'true') {
      const nuevoUsuario = {
        id: Date.now().toString(),
        ...usuarioData,
        password_hash: undefined,
        activo: true,
        createdAt: new Date()
      };
      return nuevoUsuario;
    }

    const db = getDB();
    const { email, usuario, password, nombre, apellido, rol = 'admin' } = usuarioData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO usuarios (email, usuario, password_hash, nombre, apellido, rol)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, 
        email, 
        usuario, 
        nombre, 
        apellido, 
        rol, 
        activo,
        created_at as createdAt
    `;
    
    const values = [email, usuario, password_hash, nombre, apellido, rol];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Verificar si el token es válido
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

module.exports = Usuario;