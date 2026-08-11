import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // ponytail: react-hooks v7 turns on the React Compiler rules, and
      // set-state-in-effect flags 3 pre-existing deliberate patterns
      // (App.tsx defers hero computation past first paint; RosterDashboard
      // and Combobox reset state when their inputs change). Kept as a warning
      // so the eslint 10 bump does not hinge on rewriting render behaviour.
      // Upgrade path: derive the state or key the component, then set to
      // 'error'.
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['api/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Type-aware promise-handling rules, scoped to app + serverless-function
    // source (not scripts/, which has no covering tsconfig — standalone dev
    // tooling, not app/test runtime surface).
    files: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
);
