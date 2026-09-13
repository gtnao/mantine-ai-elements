import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';

const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));
const tarball = readFileSync(process.env.PACKAGE_TARBALL);
const integrity = `sha512-${createHash('sha512').update(tarball).digest('base64')}`;
let published;
try {
  published = JSON.parse(
    execFileSync(
      'npm',
      [
        'view',
        `${name}@${version}`,
        'dist.integrity',
        '--json',
        '--registry=https://registry.npmjs.org',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ),
  );
} catch (error) {
  let response;
  try {
    response = JSON.parse(String(error.stdout));
  } catch {
    throw error;
  }
  if (response.error?.code !== 'E404') throw error;
}
if (published !== undefined && published !== integrity) {
  throw new Error(
    `${name}@${version} already exists with different contents; use a new version`,
  );
}
const shouldPublish = published === undefined;
appendFileSync(process.env.GITHUB_OUTPUT, `publish=${shouldPublish}\n`);
console.log(
  shouldPublish
    ? 'Version is not published yet'
    : 'Identical tarball is already published',
);
