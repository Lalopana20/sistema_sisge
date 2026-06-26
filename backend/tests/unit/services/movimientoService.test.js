const { seedBase, getSeed, cleanup } = require('../../setup');
const db = require('../../../src/config/db');
const MovimientoService = require('../../../src/services/movimientoService');

beforeAll(async () => {
  await cleanup();
  await seedBase();
});

afterAll(async () => {
  await cleanup();
});

describe('MovimientoService.registrar', () => {
  test('registra una ENTRADA e incrementa stock', async () => {
    const seed = getSeed();
    const mov = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'ENTRADA', cantidad: 50 },
      seed.id_admin,
    );
    expect(mov).toBeDefined();
    expect(mov.tipo).toBe('ENTRADA');
    expect(Number(mov.cantidad)).toBe(50);
    expect(Number(mov.stock_anterior)).toBe(100);
    expect(Number(mov.stock_nuevo)).toBe(150);
  });

  test('registra una SALIDA y decrementa stock', async () => {
    const seed = getSeed();
    const mov = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'SALIDA', cantidad: 30 },
      seed.id_admin,
    );
    expect(mov.tipo).toBe('SALIDA');
    expect(Number(mov.stock_anterior)).toBe(150);
    expect(Number(mov.stock_nuevo)).toBe(120);
  });

  test('rechaza SALIDA con stock insuficiente', async () => {
    const seed = getSeed();
    await expect(MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'SALIDA', cantidad: 99999 },
      seed.id_admin,
    )).rejects.toThrow('Stock insuficiente');
  });

  test('registra DEVOLUCION referenciando un movimiento de SALIDA', async () => {
    const seed = getSeed();
    const mov = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'SALIDA', cantidad: 20 },
      seed.id_admin,
    );
    const dev = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'DEVOLUCION', cantidad: 5, id_movimiento_origen: mov.id },
      seed.id_admin,
    );
    expect(dev.tipo).toBe('DEVOLUCION');
    expect(Number(dev.stock_nuevo)).toBeGreaterThan(Number(dev.stock_anterior));
  });

  test('rechaza DEVOLUCION sin movimiento origen', async () => {
    const seed = getSeed();
    await expect(MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'DEVOLUCION', cantidad: 5 },
      seed.id_admin,
    )).rejects.toThrow('debe especificar');
  });

  test('rechaza DEVOLUCION con cantidad mayor a la despachada', async () => {
    const seed = getSeed();
    const mov = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'SALIDA', cantidad: 10 },
      seed.id_admin,
    );
    await expect(MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'DEVOLUCION', cantidad: 20, id_movimiento_origen: mov.id },
      seed.id_admin,
    )).rejects.toThrow('No puedes devolver más');
  });

  test('registra un AJUSTE fijando stock exacto', async () => {
    const seed = getSeed();
    const mov = await MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'AJUSTE', cantidad: 200 },
      seed.id_admin,
    );
    expect(mov.tipo).toBe('AJUSTE');
    expect(Number(mov.stock_nuevo)).toBe(200);
  });

  test('rechaza producto inexistente', async () => {
    await expect(MovimientoService.registrar(
      { id_producto: 99999, tipo: 'ENTRADA', cantidad: 10 },
      getSeed().id_admin,
    )).rejects.toThrow('Producto no encontrado');
  });

  test('rechaza tipo de movimiento inválido', async () => {
    const seed = getSeed();
    await expect(MovimientoService.registrar(
      { id_producto: seed.id_producto, tipo: 'INVALIDO', cantidad: 10 },
      seed.id_admin,
    )).rejects.toThrow('Tipo inválido');
  });
});

describe('MovimientoService.listar', () => {
  test('retorna lista con paginación', async () => {
    const result = await MovimientoService.listar({ page: 1, limit: 5 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
