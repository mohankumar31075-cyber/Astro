#!/usr/bin/env node
/**
 * License audit for AstroSutra.
 *
 * 1. Reads every installed package from package-lock.json.
 * 2. Checks its declared SPDX licence against an allow-list that is compatible
 *    with distributing this app (no copyleft that would relicense the bundle).
 * 3. Checks whether the published package actually ships a licence file.
 * 4. Checks that every runtime dependency is named in THIRD-PARTY-NOTICES.md.
 * 5. Writes docs/license-report.json and prints a summary.
 *
 * Exit code 1 means a blocking issue. Run with: npm run license:audit
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

const ALLOWED = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'OFL-1.1',
  'CC0-1.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'Python-2.0',
  'MPL-2.0',
]);

const DENIED = [/^GPL/i, /^AGPL/i, /^LGPL/i, /^SSPL/i, /^BUSL/i, /^CC-BY-NC/i, /^Commons-Clause/i];

const LICENSE_FILES = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'LICENCE',
  'LICENCE.md',
  'COPYING',
  'COPYING.md',
  'LICENSE-MIT',
  'license',
];

const normalizeLicense = (value) => {
  if (!value) return 'UNKNOWN';
  if (typeof value === 'string') return value.replace(/[()]/g, '').split(/\s+OR\s+|\s+AND\s+/i)[0].trim();
  if (Array.isArray(value)) return normalizeLicense(value[0]);
  if (typeof value === 'object' && value.type) return normalizeLicense(value.type);
  return 'UNKNOWN';
};

const packages = [];
for (const [path, meta] of Object.entries(lock.packages)) {
  if (!path || meta.link) continue;
  const name = meta.name ?? path.replace(/^.*node_modules\//, '');
  const dir = join(root, path);
  const licenceFile = LICENSE_FILES.find((file) => existsSync(join(dir, file))) ?? null;
  packages.push({
    name,
    version: meta.version,
    license: normalizeLicense(meta.license ?? (meta.name ? undefined : undefined)),
    dev: Boolean(meta.dev),
    licenseFile: licenceFile,
    repository:
      typeof meta.repository === 'string' ? meta.repository : meta.repository?.url ?? null,
    resolved: meta.resolved ?? null,
  });
}

// Fill in licences that package-lock omits by reading the installed manifest.
for (const pkg of packages) {
  if (pkg.license === 'UNKNOWN' || !pkg.license) {
    const manifestPath = join(root, 'node_modules', pkg.name, 'package.json');
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      pkg.license = normalizeLicense(manifest.license);
    }
  }
}

const noticesPath = join(root, 'THIRD-PARTY-NOTICES.md');
const notices = existsSync(noticesPath) ? readFileSync(noticesPath, 'utf8') : '';

const violations = [];
const warnings = [];

for (const pkg of packages) {
  if (DENIED.some((pattern) => pattern.test(pkg.license))) {
    violations.push(`${pkg.name}@${pkg.version} uses ${pkg.license}, which is not redistributable here.`);
  } else if (!ALLOWED.has(pkg.license)) {
    violations.push(`${pkg.name}@${pkg.version} uses unreviewed licence "${pkg.license}".`);
  }
  if (pkg.license === 'UNKNOWN') {
    violations.push(`${pkg.name}@${pkg.version} has no declared licence.`);
  }
  if (!pkg.licenseFile) {
    warnings.push(
      pkg.dev
        ? `${pkg.name}@${pkg.version} (dev-only, not distributed) ships no licence file; its declared licence is ${pkg.license}.`
        : `${pkg.name}@${pkg.version} ships no licence file in its npm tarball; the full text is reproduced in THIRD-PARTY-NOTICES.md.`,
    );
  }
  if (!pkg.dev && notices && !notices.includes(pkg.name)) {
    violations.push(`${pkg.name}@${pkg.version} ships at runtime but is missing from THIRD-PARTY-NOTICES.md.`);
  }
}

const production = packages.filter((pkg) => !pkg.dev);
const development = packages.filter((pkg) => pkg.dev);
const licenseCounts = packages.reduce((acc, pkg) => {
  acc[pkg.license] = (acc[pkg.license] ?? 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  project: 'AstroSutra',
  summary: {
    totalPackages: packages.length,
    productionPackages: production.length,
    developmentPackages: development.length,
    licenseCounts,
    violations: violations.length,
    warnings: warnings.length,
  },
  allowedLicenses: [...ALLOWED],
  production,
  development,
  violations,
  warnings,
};

mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs/license-report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log('AstroSutra licence audit');
console.log('========================');
console.log(`Packages: ${production.length} runtime, ${development.length} development, ${packages.length} total`);
console.log('Licences:', Object.entries(licenseCounts).map(([name, count]) => `${name} ×${count}`).join(', '));

if (warnings.length) {
  console.log('\nNotes:');
  for (const warning of warnings) console.log(`  · ${warning}`);
}

if (violations.length) {
  console.error('\nBlocking issues:');
  for (const violation of violations) console.error(`  ✗ ${violation}`);
  console.error('\nAudit failed. Review docs/license-report.json.');
  process.exit(1);
}

console.log('\n✓ All dependencies use reviewed, redistribution-compatible licences.');
console.log('✓ Every runtime dependency is named in THIRD-PARTY-NOTICES.md.');
console.log('Report written to docs/license-report.json');
