#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

const child = spawn(
  'npx',
  ['ts-node', '--compiler-options', '{"module":"CommonJS"}', 'prisma/seed/index.ts', '--reset'],
  {
    cwd: path.join(__dirname, '..'),
    stdio: ['inherit', 'pipe', 'pipe'],
  }
);

let out = '';
let err = '';
child.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
child.stderr.on('data', (d) => { err += d; process.stderr.write(d); });
child.on('close', (code) => {
  if (code !== 0) {
    console.error('Exit code:', code);
    if (out) console.error('stdout:', out);
    if (err) console.error('stderr:', err);
  }
  process.exit(code);
});
child.on('error', (e) => {
  console.error('Spawn error:', e);
  process.exit(1);
});
