const { seedBase, getSeed, cleanup } = require('../../setup');
const db = require('../../../src/config/db');
const ProductoService = require('../../../src/services/productoService');

beforeAll(async () => {
  await cleanup();
  await seedBase();
});

afterAll(async () => {
  await cleanup();
});

describe('ProductoService.crear', () => {
  test('crea un producto correctamente', async () => {
    const seed = getSeed();
    const prod = await ProductoService.crear({
      nombre: 'Producto Nuevo', id_categoria: seed.id_categoria, stock_minimo: 5, unidad_medida: 'kg',
    });
    expect(prod).toHaveProperty('id');
    expect(prod.nombre).toBe('Producto Nuevo');
    expect(prod.categoria).toBe('Test Category');
  });

  test('rechaza categoría inexistente', async () => {
    await expect(ProductoService.crear({
      nombre: 'Prod Invalido', id_categoria: 99999,
    })).rejects.toThrow('categoría no existe');
  });
});

describe('ProductoService.obtener', () => {
  test('obtiene producto por id', async () => {
    const seed = getSeed();
    const prod = await ProductoService.obtener(seed.id_producto);
    expect(prod.nombre).toBe('Test Product');
  });

  test('lanza error si no existe', async () => {
    await expect(ProductoService.obtener(99999)).rejects.toThrow('Producto no encontrado');
  });
});

describe('ProductoService.listar', () => {
  test('retorna lista paginada', async () => {
    const result = await ProductoService.listar({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThanOrEqual(1);
  });
});

describe('ProductoService.actualizar', () => {
  test('actualiza datos del producto', async () => {
    const seed = getSeed();
    const updated = await ProductoService.actualizar(seed.id_producto, {
      nombre: 'Producto Editado', id_categoria: seed.id_categoria, stock_minimo: 20, unidad_medida: 'unidad',
    });
    expect(updated.nombre).toBe('Producto Editado');
    expect(Number(updated.stock_minimo)).toBe(20);
  });
});

describe('ProductoService.eliminar', () => {
  test('elimina producto (soft delete)', async () => {
    const seed = getSeed();
    await db.query('UPDATE productos SET stock_actual = 0 WHERE id = ?', [seed.id_producto]);
    const result = await ProductoService.eliminar(seed.id_producto);
    expect(result).toHaveProperty('mensaje');
    const prod = await ProductoService.obtener(seed.id_producto);
    expect(prod.activo).toBe(0);
  });
});
