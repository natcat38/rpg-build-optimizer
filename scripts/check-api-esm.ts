/**
 * Serverless-function load check (run in CI via `npm run api:check`).
 *
 * Vercel runs `api/*.ts` as plain Node ESM (this package is `"type": "module"`),
 * which will not resolve an extensionless relative import. Vitest and the app's
 * bundler-mode `tsc` both accept those, so a missing `.js` once shipped a
 * `/api/explain` that crashed with FUNCTION_INVOCATION_FAILED on every request
 * while CI stayed green. This compiles `api/` with the real module settings
 * (`tsconfig.api.json`, NodeNext), imports the emitted handler under Node, and
 * calls it with a GET, which must answer 405 without touching the network.
 */
import { spawnSync } from 'child_process';
import { rmSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

// Inside the repo so the emitted files still resolve `node_modules` packages.
const OUT = resolve('node_modules/.tmp/api-esm');
rmSync(OUT, { recursive: true, force: true });

const tsc = spawnSync(
  process.execPath,
  [
    resolve('node_modules/typescript/bin/tsc'),
    '-p',
    'tsconfig.api.json',
    '--noEmit',
    'false',
    '--outDir',
    OUT,
    '--rootDir',
    '.',
    '--incremental',
    'false',
  ],
  { stdio: 'inherit' },
);
if (tsc.status !== 0) {
  console.error('api:check failed — tsc could not compile api/.');
  process.exit(1);
}

const handlerUrl = pathToFileURL(join(OUT, 'api', 'explain.js')).href;
let handler: (req: unknown, res: unknown) => Promise<void>;
try {
  handler = (await import(handlerUrl)).default;
} catch (err) {
  console.error(
    'api:check failed — api/explain.js does not load under Node ESM.\n' +
      'Relative imports reachable from api/ need explicit `.js` extensions.\n',
    err,
  );
  process.exit(1);
}

let status = 0;
let body: unknown;
const res = {
  status(code: number) {
    status = code;
    return res;
  },
  json(value: unknown) {
    body = value;
    return res;
  },
};
await handler({ method: 'GET', headers: {} }, res);
if (status !== 405) {
  console.error(
    `api:check failed — GET answered ${status} ${JSON.stringify(body)}, expected 405.`,
  );
  process.exit(1);
}
console.log('api:check ok — api/explain.js loads under Node ESM; GET -> 405.');
