const { seedBase, getSeed, cleanup } = require('../../setup');
const db = require('../../../src/config/db');
const UsuarioService = require('../../../src/services/usuarioService');

beforeAll(async () => {
  await cleanup();
  await seedBase();
});

afterAll(async () => {
  await cleanup();
});

describe('UsuarioService.crear', () => {
  test('crea un usuario correctamente', async () => {
    const user = await UsuarioService.crear({
      nombre: 'Juan Test', username: 'juantest', email: 'juan@test.com', password: 'test1234', rol: 'operario',
    });
    expect(user).toHaveProperty('id');
    expect(user.username).toBe('juantest');
    expect(user.rol).toBe('operario');
  });

  test('rechaza username duplicado', async () => {
    await expect(UsuarioService.crear({
      nombre: 'Otro', username: 'admintest', password: 'test1234', rol: 'operario',
    })).rejects.toThrow('ya está en uso');
  });

  test('rechaza email duplicado', async () => {
    await expect(UsuarioService.crear({
      nombre: 'Otro', username: 'otrousername', email: 'admin@test.com', password: 'test1234', rol: 'operario',
    })).rejects.toThrow('El email ya est');
  });
});

describe('UsuarioService.obtener', () => {
  test('obtiene usuario por id', async () => {
    const seed = getSeed();
    const user = await UsuarioService.obtener(seed.id_admin);
    expect(user.username).toBe('admintest');
  });

  test('lanza error si no existe', async () => {
    await expect(UsuarioService.obtener(99999)).rejects.toThrow('Usuario no encontrado');
  });
});

describe('UsuarioService.listar', () => {
  test('retorna lista de usuarios', async () => {
    const users = await UsuarioService.listar();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  test('retorna lista paginada', async () => {
    const result = await UsuarioService.listar({ page: 1, limit: 2 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result.data.length).toBeLessThanOrEqual(2);
  });
});

describe('UsuarioService.actualizar', () => {
  test('actualiza datos del usuario', async () => {
    const seed = getSeed();
    const updated = await UsuarioService.actualizar(seed.id_admin, { nombre: 'Admin Modificado' });
    expect(updated.nombre).toBe('Admin Modificado');
  });

  test('rechaza cambiar al último admin', async () => {
    const seed = getSeed();
    await expect(UsuarioService.actualizar(seed.id_admin, { rol: 'operario' }))
      .rejects.toThrow('No puedes cambiar el rol del último administrador');
  });
});

describe('UsuarioService.eliminar', () => {
  test('rechaza eliminar al último admin', async () => {
    const seed = getSeed();
    await expect(UsuarioService.eliminar(seed.id_admin, seed.id_admin))
      .rejects.toThrow('No puedes eliminar tu propia cuenta');
  });

  test('rechaza eliminar la propia cuenta', async () => {
    const seed = getSeed();
    await expect(UsuarioService.eliminar(seed.id_admin, seed.id_admin))
      .rejects.toThrow('No puedes eliminar tu propia cuenta');
  });
});
