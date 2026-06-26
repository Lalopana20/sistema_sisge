describe('Server module loading', () => {
  test('app module loads without errors', () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-1234567890123456';
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
    process.env.DB_USER = process.env.DB_USER || 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
    process.env.DB_NAME = process.env.DB_NAME || 'test_db';
    process.env.NODE_ENV = 'test';
    // Dotenv confundiría las variables, lo cargamos sin .env
    jest.resetModules();
    const app = require('../src/app');
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
