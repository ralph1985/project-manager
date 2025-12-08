// Generic release helper for any @project-manager/* package.
// - Bumps version with lerna (conventional commits) for the target package.
// - Builds the package if it has a build script.
// - Packs it into ./artifacts.
// - Commits version + changelog (if any) + tarball and tags it.
//
// Usage:
//   node scripts/release-package.js --pkg @project-manager/pm-i18n
// or set PKG env var.
const { execSync, spawnSync } = require('node:child_process');
const { existsSync, mkdirSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const args = process.argv.slice(2);
const pkgFlagIndex = args.findIndex(arg => arg === '--pkg');
const pkgName =
  process.env.PKG ||
  (pkgFlagIndex !== -1 ? args[pkgFlagIndex + 1] : null);

if (!pkgName) {
  console.error('Error: provide a package via --pkg @project-manager/<name> or PKG env var.');
  process.exit(1);
}

const root = resolve(__dirname, '..');
const shortName = pkgName.includes('/') ? pkgName.split('/')[1] : pkgName;
const pkgDir = resolve(root, 'packages', shortName);
const pkgJsonPath = resolve(pkgDir, 'package.json');
const artifactsDir = resolve(root, 'artifacts');

if (!existsSync(pkgJsonPath)) {
  console.error(`Error: package.json not found for ${pkgName} at ${pkgJsonPath}`);
  process.exit(1);
}

const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

function lernaVersion() {
  run(
    [
      'npx lerna version',
      '--conventional-commits',
      '--changelog-preset',
      'conventionalcommits',
      '--yes',
      '--no-git-tag-version',
      '--no-push',
      '--force-publish',
      pkgName,
    ].join(' ')
  );
}

function undoLernaCommit() {
  try {
    execSync('git reset --soft HEAD~1', { stdio: 'inherit', cwd: root });
  } catch (err) {
    console.warn('Warn: git reset --soft HEAD~1 failed, please check the repo state manually.');
  }
}

function buildIfAvailable() {
  const hasBuild = pkgJson.scripts && pkgJson.scripts.build;
  if (!hasBuild) {
    console.log(`Skip build: no build script in ${pkgName}`);
    return;
  }
  run(`npm run build --workspace ${pkgName}`);
}

function packPackage() {
  mkdirSync(artifactsDir, { recursive: true });
  const result = spawnSync(
    'npm',
    ['pack', `./packages/${shortName}`, '--pack-destination', './artifacts'],
    {
      cwd: root,
      env: { ...process.env, npm_config_cache: './.npm-cache' },
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `npm pack failed: ${result.stderr?.toString() || 'unknown error'}`
    );
  }

  const output = result.stdout?.toString().trim().split('\n').pop();
  if (!output) throw new Error('npm pack did not return a tarball name');
  return output.trim();
}

function stageAndCommit(tarballName, version) {
  const files = [
    'package-lock.json',
    `packages/${shortName}/package.json`,
  ];
  const changelog = `packages/${shortName}/CHANGELOG.md`;
  if (existsSync(resolve(root, changelog))) files.push(changelog);
  files.push(`artifacts/${tarballName}`);

  run(`git add ${files.join(' ')}`);
  run(`git commit -m "chore(release): ${shortName} v${version}"`);
  try {
    run(`git tag ${shortName}-v${version}`);
  } catch (err) {
    console.warn('Warn: could not create tag, please create it manually if needed.');
  }
}

function main() {
  lernaVersion();
  undoLernaCommit();
  buildIfAvailable();
  const tarball = packPackage();
  const version = JSON.parse(readFileSync(pkgJsonPath, 'utf8')).version;
  stageAndCommit(tarball, version);

  console.log('\nRelease generated:');
  console.log(`- package: ${pkgName}`);
  console.log(`- version: ${version}`);
  console.log(`- tarball: artifacts/${tarball}`);
  console.log('- commit and tag created automatically');
}

main();
