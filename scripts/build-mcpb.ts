import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');
const buildDir = join(repoRoot, 'build');
const serverDir = join(buildDir, 'server');

type StepRunner = (cwd: string) => void;

const run = (label: string, command: string, args: string[], cwd: string): void => {
  console.log(`\n▶ ${label}: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed (exit ${result.status ?? 'null'})`);
    process.exit(result.status ?? 1);
  }
};

const step = (label: string, fn: StepRunner): void => {
  console.log(`\n▶ ${label}`);
  fn(repoRoot);
};

step('Clean build/', () => {
  rmSync(buildDir, { recursive: true, force: true });
  mkdirSync(buildDir, { recursive: true });
});

run('Compile TypeScript', 'pnpm', ['exec', 'tsc'], repoRoot);

step('Stage server/ from dist/', () => {
  cpSync(distDir, serverDir, { recursive: true });
});

step('Stage manifest.json', () => {
  cpSync(join(repoRoot, 'manifest.json'), join(buildDir, 'manifest.json'));
});

const manifest = JSON.parse(readFileSync(join(repoRoot, 'manifest.json'), 'utf8')) as { version: string; name: string };

step('Stage production package.json', () => {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as Record<string, unknown>;
  const trimmed: Record<string, unknown> = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    type: pkg.type,
    main: 'server/index.js',
    dependencies: pkg.dependencies,
  };
  for (const key of Object.keys(trimmed)) {
    if (trimmed[key] === undefined) delete trimmed[key];
  }
  writeFileSync(join(buildDir, 'package.json'), JSON.stringify(trimmed, null, 2) + '\n');
});

run('Install production dependencies', 'npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], buildDir);

const mcpbFile = `${manifest.name}-${manifest.version}.mcpb`;
run('Pack .mcpb', 'pnpm', ['exec', 'mcpb', 'pack', buildDir, mcpbFile], repoRoot);

const mcpbPath = join(repoRoot, mcpbFile);
const sizeMb = (statSync(mcpbPath).size / 1024 / 1024).toFixed(2);
console.log(`\n✓ Built ${mcpbPath} (${sizeMb} MB)`);
