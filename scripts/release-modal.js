// Release helper for @project-manager/pm-modal.
// - Runs lerna version (conventional commits) on the modal package.
// - Builds the package.
// - Packs it into ./artifacts and updates Palomares dependency URL.
// Env: LIT_MODAL_ARTIFACT_BASE to override the base URL used in the dependency.
const { execSync, spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const modalPkgPath = resolve(root, 'packages/pm-modal/package.json');
const artifactsDir = resolve(root, 'artifacts');
const artifactBase =
  process.env.LIT_MODAL_ARTIFACT_BASE ||
  'https://raw.githubusercontent.com/ralph1985/project-manager/main/artifacts';

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
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
      '@project-manager/pm-modal'
    ].join(' ')
  );
}

function undoLernaCommit() {
  try {
    // Leave the version/changelog changes staged to include the tarball in one commit.
    execSync('git reset --soft HEAD~1', { stdio: 'inherit', cwd: root });
  } catch (err) {
    console.warn('Warn: git reset --soft HEAD~1 failed, please check the repo state manually.');
  }
}

function buildModal() {
  run('npm run build --workspace @project-manager/pm-modal');
}

function packModal() {
  mkdirSync(artifactsDir, { recursive: true });
  const result = spawnSync(
      'npm',
      [
        'pack',
        './packages/pm-modal',
        '--pack-destination',
        './artifacts'
      ],
    {
      cwd: root,
      env: { ...process.env, npm_config_cache: './.npm-cache' }
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
    'packages/pm-modal/package.json',
    'packages/pm-modal/CHANGELOG.md',
    `artifacts/${tarballName}`
  ];
  run(`git add ${files.join(' ')}`);
  run(`git commit -m "chore(release): pm-modal v${version}"`);
  try {
    run(`git tag pm-modal-v${version}`);
  } catch (err) {
    console.warn('Warn: could not create tag, please create it manually if needed.');
  }
}
function main() {
  lernaVersion();
  undoLernaCommit();
  buildModal();
  const tarball = packModal();
  const modalPkg = JSON.parse(readFileSync(modalPkgPath, 'utf8'));
  stageAndCommit(tarball, modalPkg.version);

  console.log('\nRelease generated:');
  console.log(`- version: ${modalPkg.version}`);
  console.log(`- tarball: artifacts/${tarball}`);
  console.log('- commit and tag created automatically');
}

main();
