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
      // Floors set ~1pt under the whole-repo numbers as of 2026-09 (95.2%
      // statements / 88.6% branches / 96.1% functions / 96.7% lines — see
      // docs/runbooks/testing.md and tech-debt TD-6/TD-7) so a real
      // regression fails CI, but normal noise (a line or two shifting as
      // code changes) doesn't. Raise these as coverage improves; never lower
      // them to make a PR pass.
      thresholds: {
        statements: 94,
        branches: 87,
        functions: 95,
        lines: 95,
      },
    },
  },
});
