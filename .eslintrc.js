module.exports = {
  root: true,

  env: {
    node: true,
  },
  extends: [
    // 'plugin:vue/recommended',
    // '@vue/airbnb',
    // 'eslint:recommended',
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 'off',
    'no-unused-expressions': 'off',
    'max-len': [2, {
      code: 150, tabWidth: 4, ignoreUrls: true, ignoreComments: true,
    }],
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
      rules: {
        'max-lines-per-function': 0,
        'max-nested-callbacks': 0,
        'max-lines': 0,
      },
    },
    {
      files: ['**/__mocks__/*.ts', '**/__mocks__/*.js'],
      rules: {
        'max-lines-per-function': 0,
        'max-nested-callbacks': 0,
        'max-lines': 0,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
      extends: [
        '@vue/typescript/recommended',
      ],
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {

        '@typescript-eslint/indent': 'off', // So there is no conflict between indents of others
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
      },
    },
  ],
};
