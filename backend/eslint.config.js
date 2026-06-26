const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      semi: ['error', 'always'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      indent: ['warn', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],
      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
      'prefer-const': 'warn',
      'no-var': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/',
      'logs/',
      'migrations/',
      'coverage/',
    ],
  },
];
