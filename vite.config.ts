import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Pin the dev server port so it doesn't collide with sibling repos
    // checked out on the same machine. See #65.
    port: 5199,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    // Ignore local git worktrees (e.g. .worktrees/*) so a checked-out copy of
    // the repo isn't scanned and run with a second, conflicting React instance.
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    coverage: {
      provider: 'v8',
      // json-summary feeds the coverage-badge workflow.
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});
