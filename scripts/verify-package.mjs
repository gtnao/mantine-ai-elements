import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = await mkdtemp(
  join(tmpdir(), 'mantine-ai-elements-consumer-'),
);
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
function run(args, cwd) {
  const result = spawnSync('pnpm', args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `pnpm ${args.join(' ')} failed`);
}

console.log(`Consumer verification: ${directory}`);
await cp(join(root, 'tests/consumer'), directory, { recursive: true });
await cp(
  join(root, 'src/stories/demo-transport.ts'),
  join(directory, 'app/demo-transport.ts'),
);
run(['pack', '--out', join(directory, 'mantine-ai-elements.tgz')], root);
run(['install', '--ignore-scripts'], directory);

const packageRoot = join(directory, 'node_modules/mantine-ai-elements');
const manifest = JSON.parse(
  await readFile(join(packageRoot, 'package.json'), 'utf8'),
);
assert.deepEqual(Object.keys(manifest.exports), [
  '.',
  './styles.css',
  './styles.layer.css',
]);
const js = await readFile(join(packageRoot, 'dist/index.js'), 'utf8');
assert.match(js, /^['"]use client['"];?/);
assert.doesNotMatch(js, /@repo\/|shadcn|react-dom\/client/);
const css = await readFile(join(packageRoot, 'dist/styles.css'), 'utf8');
const layerCss = await readFile(
  join(packageRoot, 'dist/styles.layer.css'),
  'utf8',
);
assert.ok(css.length > 0);
assert.ok(layerCss.includes(css));
assert.match(layerCss, /^@layer mantine-ai-elements/);
run(['build'], directory);

// Bind an available port before starting the production consumer.
const { createServer } = await import('node:net');
const probe = createServer();
await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const server = spawn(
  'pnpm',
  ['exec', 'next', 'start', '-p', String(port), '-H', '127.0.0.1'],
  {
    cwd: directory,
    env,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  },
);
let browser;
try {
  const url = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Consumer server failed to start');
  browser = await chromium.launch({
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(url);
  const input = page.getByRole('textbox', { name: 'Message' });
  await expect(input).toBeVisible();
  const border = await page
    .locator('form')
    .evaluate((form) => getComputedStyle(form).borderTopStyle);
  assert.equal(border, 'solid', 'Published CSS was not applied');
  const initialHeight = await input.evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  await input.fill('First\nSecond\nThird\nFourth\nFifth\nSixth');
  await expect
    .poll(() => input.evaluate((el) => el.getBoundingClientRect().height))
    .toBeGreaterThan(initialHeight);
  await input.fill('Hello');
  await input.press('Enter');
  await expect(page.getByTestId('user')).toHaveText('Hello');
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('status')).toHaveText('streaming');
  await input.fill('Next draft');
  await input.press('Enter');
  await expect(page.getByTestId('user')).toHaveCount(1);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.getByTestId('status')).toHaveText('ready');
  await expect(input).toHaveValue('Next draft');
  await input.press('Enter');
  await expect(page.getByTestId('user')).toHaveCount(2);
  await expect(page.getByTestId('status')).toHaveText('ready', {
    timeout: 15000,
  });
  await expect(page.getByTestId('assistant').last()).toContainText(
    'Next draft',
  );
  await input.fill('/error');
  await input.press('Enter');
  await expect(page.getByTestId('status')).toHaveText('error');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Demo transport error' }),
  ).toBeVisible();
  await page.screenshot({
    path: join(directory, 'consumer.png'),
    fullPage: true,
  });
  assert.deepEqual(errors, [], 'Browser errors');
  await writeFile(
    join(directory, 'result.json'),
    JSON.stringify({ passed: true, package: manifest.version }, null, 2),
  );
  if (process.env.PACKAGE_OUTPUT) {
    await cp(
      join(directory, 'mantine-ai-elements.tgz'),
      process.env.PACKAGE_OUTPUT,
    );
    console.log(`Verified tarball: ${process.env.PACKAGE_OUTPUT}`);
  }
  console.log(
    `Package, Next.js, CSS, hydration, streaming, stop, and error checks passed. Artifacts: ${directory}`,
  );
} finally {
  await browser?.close();
  if (server.pid) {
    if (process.platform === 'win32') server.kill();
    else {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {}
    }
  }
}
