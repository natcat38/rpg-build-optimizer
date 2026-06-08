import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    // Ignore local git worktrees (e.g. .worktrees/*) so a checked-out copy of
    // the repo isn't scanned and run with a second, conflicting React instance.
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
  },
});
