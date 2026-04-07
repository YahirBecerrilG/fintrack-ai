const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// POST /api/auth/register
async function register(req, res) {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar si ya existe
    const existe = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo = $1', [correo]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hash de contraseña
    const hash = await bcrypt.hash(password, 12);

    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, correo',
      [nombre, correo, hash]
    );

    const usuario = result.rows[0];
    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1', [correo]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// GET /api/auth/me  (ruta protegida de prueba)
async function me(req, res) {
  try {
    const result = await pool.query(
      'SELECT id_usuario, nombre, correo, fecha_creacion FROM usuarios WHERE id_usuario = $1',
      [req.user.id]
    );
    res.json({ usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { register, login, me };