import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    extends: [js.configs.recommended, reactRefresh.configs.vite, prettierConfig],

    plugins: {
      'unused-imports': unusedImports,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      /* Real bug prevention */
      eqeqeq: ['warn', 'always'],
      curly: ['warn', 'all'],

      /* Keep code clean automatically */
      'unused-imports/no-unused-imports': 'warn',

      /* Avoid annoying dev friction */
      'no-unused-vars': 'off',

      /* Useful without being preachy */
      'prefer-const': 'warn',

      /* Console logs are fine during development */
      'no-console': 'off',

      /* Allow flexible coding styles */
      'no-else-return': 'off',
      'no-nested-ternary': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
    },
  },
]);
