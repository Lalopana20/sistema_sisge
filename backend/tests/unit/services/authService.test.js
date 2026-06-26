const { seedBase, getSeed, cleanup } = require('../../setup');
const bcrypt = require('bcryptjs');
const db = require('../../../src/config/db');
const AuthService = require('../../../src/services/authService');

jest.mock('../../../src/utils/securityLogger', () => jest.fn());

beforeAll(async () => {
  await cleanup();
  await seedBase();
});

afterAll(async () => {
  await cleanup();
});

describe('AuthService.login', () => {
  test('loguea con credenciales correctas', async () => {
    const result = await AuthService.login('admintest', 'test1234');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('usuario');
    expect(result.usuario.username).toBe('admintest');
    expect(result.usuario.rol).toBe('admin');
    expect(result).toHaveProperty('permisos');
    expect(result).toHaveProperty('modulos_visibles');
  });

  test('rechaza login con password incorrecto', async () => {
    await expect(AuthService.login('admintest', 'wrongpass'))
      .rejects.toThrow('Credenciales incorrectas');
  });

  test('rechaza login con usuario inexistente', async () => {
    await expect(AuthService.login('noexiste', 'test1234'))
      .rejects.toThrow('Credenciales incorrectas');
  });

  test('rechaza login con username vacío', async () => {
    await expect(AuthService.login('', 'test1234'))
      .rejects.toThrow('Credenciales incorrectas');
  });
});

describe('AuthService.cambiarPassword', () => {
  test('cambia password correctamente', async () => {
    const seed = getSeed();
    const result = await AuthService.cambiarPassword(seed.id_admin, 'test1234', 'nuevaPass1');
    expect(result).toHaveProperty('mensaje');
    expect(result.mensaje).toContain('actualizada');
  });

  test('rechaza cambio con password actual incorrecta', async () => {
    const seed = getSeed();
    await expect(AuthService.cambiarPassword(seed.id_admin, 'wrongpass', 'nuevaPass1'))
      .rejects.toThrow('incorrecta');
  });

  test('rechaza cambio con usuario inexistente', async () => {
    await expect(AuthService.cambiarPassword(99999, 'test1234', 'nuevaPass1'))
      .rejects.toThrow('Usuario no encontrado');
  });
});

describe('AuthService.registrar', () => {
  test('registra un nuevo usuario', async () => {
    const id = await AuthService.registrar({
      nombre: 'Nuevo Test', username: 'nuevouser', password: 'test1234', rol: 'operario',
    });
    expect(id).toBeGreaterThan(0);
  });

  test('rechaza username duplicado', async () => {
    await expect(AuthService.registrar({
      nombre: 'Duplicado', username: 'admintest', password: 'test1234', rol: 'operario',
    })).rejects.toThrow('ya está en uso');
  });
});

describe('AuthService.obtenerPerfil', () => {
  test('obtiene datos del usuario por id', async () => {
    const seed = getSeed();
    const perfil = await AuthService.obtenerPerfil(seed.id_admin);
    expect(perfil.username).toBe('admintest');
    expect(perfil).not.toHaveProperty('password_hash');
  });

  test('lanza error si usuario no existe', async () => {
    await expect(AuthService.obtenerPerfil(99999)).rejects.toThrow('Usuario no encontrado');
  });
});
