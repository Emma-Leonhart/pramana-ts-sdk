import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

writeFileSync(
  join(root, 'dist', 'cjs', 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
);

writeFileSync(
  join(root, 'dist', 'esm', 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
);

console.log('Wrote dist/cjs/package.json (commonjs) and dist/esm/package.json (module)');
