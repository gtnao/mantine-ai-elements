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
  join(root, 'src/stories/approval-transport.ts'),
  join(directory, 'app/approval-transport.ts'),
);
await cp(
  join(root, 'src/stories/demo-transport.ts'),
  join(directory, 'app/demo-transport.ts'),
);
await writeFile(
  join(directory, 'app/queue.tsx'),
  "'use client';\n" +
    (await readFile(join(root, 'src/stories/queue-chat.tsx'), 'utf8')).replace(
      "from '../index'",
      "from 'mantine-ai-elements'",
    ),
);
await cp(
  join(root, 'src/stories/task-stream.ts'),
  join(directory, 'app/task-stream.ts'),
);
await writeFile(
  join(directory, 'app/task-object.tsx'),
  "'use client';\n" +
    (await readFile(join(root, 'src/stories/task-object.tsx'), 'utf8')).replace(
      "from '../index'",
      "from 'mantine-ai-elements'",
    ),
);
await cp(
  join(root, 'src/stories/plan-stream.ts'),
  join(directory, 'app/plan-stream.ts'),
);
await writeFile(
  join(directory, 'app/plan-object.tsx'),
  "'use client';\n" +
    (await readFile(join(root, 'src/stories/plan-object.tsx'), 'utf8')).replace(
      "from '../index'",
      "from 'mantine-ai-elements'",
    ),
);
await writeFile(
  join(directory, 'app/chain-of-thought-chat.tsx'),
  "'use client';\n" +
    (
      await readFile(
        join(root, 'src/stories/chain-of-thought-chat.tsx'),
        'utf8',
      )
    ).replace("from '../index'", "from 'mantine-ai-elements'"),
);
await cp(
  join(root, 'src/stories/artifact-stream.ts'),
  join(directory, 'app/artifact-stream.ts'),
);
await writeFile(
  join(directory, 'app/artifact-object.tsx'),
  "'use client';\n" +
    (
      await readFile(join(root, 'src/stories/artifact-object.tsx'), 'utf8')
    ).replace("from '../index'", "from 'mantine-ai-elements'"),
);
for (const name of ['web-preview-document.ts', 'web-preview-stream.ts']) {
  await cp(join(root, 'src/stories', name), join(directory, 'app', name));
}
await writeFile(
  join(directory, 'app/web-preview-example.tsx'),
  "'use client';\n" +
    (
      await readFile(join(root, 'src/stories/web-preview-example.tsx'), 'utf8')
    ).replace("from '../index'", "from 'mantine-ai-elements'"),
);
await cp(
  join(root, 'src/stories/sandbox-transport.ts'),
  join(directory, 'app/sandbox-transport.ts'),
);
await writeFile(
  join(directory, 'app/sandbox-chat.tsx'),
  "'use client';\n" +
    (
      await readFile(join(root, 'src/stories/sandbox-chat.tsx'), 'utf8')
    ).replace("from '../index'", "from 'mantine-ai-elements'"),
);
await cp(
  join(root, 'src/stories/jsx-preview-transport.ts'),
  join(directory, 'app/jsx-preview-transport.ts'),
);
await writeFile(
  join(directory, 'app/jsx-preview-chat.tsx'),
  "'use client';\n" +
    (
      await readFile(join(root, 'src/stories/jsx-preview-chat.tsx'), 'utf8')
    ).replace("from '../index'", "from 'mantine-ai-elements'"),
);
for (const name of ['assistant-workflow.tsx', 'workflow-report.tsx']) {
  await writeFile(
    join(directory, 'app', name),
    "'use client';\n" +
      (await readFile(join(root, 'src/stories', name), 'utf8')).replace(
        "from '../index'",
        "from 'mantine-ai-elements'",
      ),
  );
}
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
  await expect(page.getByTestId('package-exports')).toHaveText(
    /^\d+ runtime exports available$/,
  );
  const input = page.getByRole('textbox', { name: 'Message', exact: true });
  await expect(input).toBeVisible();
  const border = await page
    .locator('form')
    .first()
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
  const suggestionsViewport = page.locator('.suggestion-viewport');
  await page
    .getByRole('button', { name: 'Explain streaming', exact: true })
    .focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const lastSuggestion = page.getByRole('button', {
    name: 'Summarize this conversation',
    exact: true,
  });
  await expect(lastSuggestion).toBeFocused();
  await expect
    .poll(() => suggestionsViewport.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('user').last()).toHaveText(
    'Summarize this conversation',
  );
  await expect(lastSuggestion).toBeDisabled();
  await expect(page.getByTestId('status')).toHaveText('ready', {
    timeout: 15000,
  });
  await expect(page.getByTestId('assistant').last()).toContainText(
    'Summarize this conversation',
  );

  const viewport = page.locator('.history-viewport');
  const distanceToBottom = () =>
    viewport.evaluate(
      (element) =>
        element.scrollHeight - element.clientHeight - element.scrollTop,
    );
  await expect.poll(distanceToBottom).toBeLessThan(3);
  await page.getByRole('button', { name: 'Append history' }).click();
  await expect.poll(distanceToBottom).toBeLessThan(3);
  await viewport.hover();
  await page.mouse.wheel(0, -500);
  const scrollButton = page.getByRole('button', { name: 'Scroll to bottom' });
  await expect(scrollButton).toBeVisible();
  const readingPosition = await viewport.evaluate(
    (element) => element.scrollTop,
  );
  await page.getByRole('button', { name: 'Append history' }).click();
  await expect.poll(distanceToBottom).toBeGreaterThan(300);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeCloseTo(readingPosition, 0);
  await scrollButton.click();
  await expect.poll(distanceToBottom).toBeLessThan(3);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download conversation' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'history.md');
  const downloadPath = await download.path();
  assert.ok(downloadPath);
  assert.match(
    await readFile(downloadPath, 'utf8'),
    /\*\*Assistant:\*\* History message 32/,
  );
  const codeExample = page.getByTestId('code-example');
  await expect(codeExample.locator('[data-highlighted]')).toBeVisible({
    timeout: 15000,
  });
  await expect(codeExample.locator('code')).toHaveText(
    'const greeting = "Hello";',
  );
  const token = codeExample.locator('.mantine-CodeBlock-token').first();
  const lightTokenColor = await token.evaluate(
    (element) => getComputedStyle(element).color,
  );
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-mantine-color-scheme', 'dark'),
  );
  await expect
    .poll(() => token.evaluate((element) => getComputedStyle(element).color))
    .not.toBe(lightTokenColor);
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-mantine-color-scheme', 'light'),
  );
  await codeExample.getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'python', exact: true }).click();
  await expect(codeExample.locator('code')).toHaveText('print("Hello")');
  await expect(codeExample.locator('[data-highlighted]')).toBeVisible();
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await codeExample.getByRole('button', { name: 'Copy code' }).click();
  await expect(
    codeExample.getByRole('button', { name: 'Copied', exact: true }),
  ).toBeVisible();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    'print("Hello")',
  );
  const shimmer = page.getByRole('heading', { name: 'Preparing an answer' });
  await expect(shimmer).toHaveCSS('animation-duration', '3s');
  await expect(shimmer).toHaveCSS('background-clip', 'text, text');
  const firstPosition = await shimmer.evaluate(
    (node) => getComputedStyle(node).backgroundPosition,
  );
  await expect
    .poll(() =>
      shimmer.evaluate((node) => getComputedStyle(node).backgroundPosition),
    )
    .not.toBe(firstPosition);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(shimmer).toHaveCSS('animation-name', 'none');
  await expect(shimmer).toHaveCSS('background-image', 'none');
  await page.emulateMedia({
    reducedMotion: 'no-preference',
    forcedColors: 'active',
  });
  await expect(shimmer).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ forcedColors: 'none' });

  const messageExample = page.getByTestId('message-example');
  await expect(
    messageExample.getByRole('heading', { name: 'Rendered answer' }),
  ).toBeVisible();
  await expect(messageExample.locator('.katex')).toBeVisible();
  await expect(
    messageExample.locator('[data-message-response="diagram"] svg'),
  ).toBeVisible({ timeout: 30000 });
  const table = messageExample.locator('[data-message-response="table"]');
  await table.getByRole('button', { name: 'Copy table', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Copy table as CSV' }).click();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /Name,Value[\s\S]*Total,42/,
  );
  await table.getByRole('button', { name: 'View fullscreen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await messageExample
    .getByRole('button', { name: 'Download diagram' })
    .click();
  const pngPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Download diagram as PNG' }).click();
  const png = await pngPromise;
  assert.equal(png.suggestedFilename(), 'diagram.png');
  const pngPath = await png.path();
  assert.ok(pngPath);
  assert.equal((await readFile(pngPath)).subarray(1, 4).toString(), 'PNG');
  await messageExample.getByRole('button', { name: 'Next branch' }).click();
  await expect(
    messageExample.getByText('An alternative answer.'),
  ).toBeVisible();
  await messageExample.getByRole('button', { name: 'Previous branch' }).click();
  await expect(
    messageExample.getByRole('heading', { name: 'Rendered answer' }),
  ).toBeVisible();
  const attachments = page.getByTestId('attachments-example');
  const attachmentImage = attachments.getByRole('img', {
    name: 'Preview image',
  });
  await expect
    .poll(() => attachmentImage.evaluate((node) => node.naturalWidth))
    .toBeGreaterThan(0);
  const attachmentVideo = attachments.locator('video');
  await expect
    .poll(() => attachmentVideo.evaluate((node) => node.videoWidth))
    .toBe(96);
  await expect(attachmentVideo).toHaveJSProperty('muted', true);
  await attachments
    .getByRole('button', { name: 'Remove Preview image' })
    .click();
  await expect(attachmentImage).toHaveCount(0);
  await attachments
    .getByText('Reference document', { exact: true })
    .locator('..')
    .locator('..')
    .focus();
  await expect(
    page.getByRole('dialog').filter({ hasText: 'Verified source details' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  const images = page.getByTestId('image-example');
  await images.scrollIntoViewIfNeeded();
  for (const name of ['Generated image', 'Image fallback', 'Next image']) {
    await expect
      .poll(() =>
        images
          .getByRole('img', { name, exact: true })
          .evaluate((node) => node.naturalWidth),
      )
      .toBe(24);
  }
  const fallbackImage = images.getByRole('img', { name: 'Image fallback' });
  await expect(fallbackImage).toHaveAttribute('data-fallback', 'true');
  await images.getByRole('button', { name: 'Replace image source' }).click();
  await expect(fallbackImage).not.toHaveAttribute('data-fallback');
  await expect(fallbackImage).toHaveAttribute('src', '/image-preview.svg');

  await expect(
    page.getByTestId('packaged-jsx').getByText('Packaged JSX'),
  ).toBeVisible();
  const jsxChat = page.getByTestId('packaged-jsx-chat');
  await jsxChat
    .getByRole('button', { name: 'Generate preview', exact: true })
    .click();
  await expect(jsxChat.getByRole('status')).toHaveText('Response complete.', {
    timeout: 15000,
  });
  await jsxChat
    .getByRole('button', { name: 'Preview count: 0', exact: true })
    .click();
  await expect(
    jsxChat.getByRole('button', { name: 'Preview count: 1', exact: true }),
  ).toBeVisible();
  await jsxChat
    .getByRole('button', { name: 'Invalid JSX', exact: true })
    .click();
  await expect(jsxChat.getByRole('status')).toHaveText('Response complete.', {
    timeout: 15000,
  });
  await expect(jsxChat.getByRole('alert')).toContainText('Preview failed');
  await jsxChat
    .getByRole('button', { name: 'Generate preview', exact: true })
    .click();
  await expect(jsxChat.getByRole('status')).toHaveText('Response complete.', {
    timeout: 15000,
  });
  await expect(jsxChat.getByRole('alert')).toHaveCount(0);
  await expect(
    jsxChat.getByRole('button', { name: 'Preview count: 0', exact: true }),
  ).toBeVisible();

  const sandbox = page.getByTestId('packaged-sandbox');
  const namedQueue = page.getByTestId('packaged-queue-named');
  await expect(
    namedQueue.getByText('Verify named exports', { exact: true }),
  ).toBeVisible();
  await expect(
    namedQueue.getByRole('button', { name: 'Unavailable action', exact: true }),
  ).toBeDisabled();
  await expect(
    namedQueue.getByRole('img', { name: 'Queue reference' }),
  ).toHaveJSProperty('naturalWidth', 24);
  await namedQueue.getByRole('button', { name: /Packaged tasks/ }).focus();
  await page.keyboard.press('Enter');
  await expect(
    namedQueue.getByText('Verify named exports', { exact: true }),
  ).not.toBeVisible();
  const workflow = page.getByTestId('packaged-assistant-workflow');
  await workflow
    .getByRole('textbox', { name: 'Workflow message' })
    .fill('Create a report');
  await workflow
    .getByRole('button', { name: 'Send message', exact: true })
    .click();
  await workflow.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(
    workflow.getByRole('button', { name: 'Copy report', exact: true }),
  ).toBeDisabled();
  await expect(
    workflow.getByRole('button', { name: 'Copy report', exact: true }),
  ).toBeEnabled({ timeout: 15000 });
  await expect(
    workflow.getByRole('region', { name: 'Report progress', exact: true }),
  ).toContainText('Report ready');
  await expect(
    workflow.getByRole('link', { name: 'Package verification', exact: true }),
  ).toHaveAttribute('href', 'https://example.com/team-notes/3');
  await workflow
    .getByRole('button', { name: 'Copy report', exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('Verify the packed library');
  await expect(
    sandbox.getByRole('button', { name: 'packaged.ts Completed' }),
  ).toBeVisible();
  await sandbox.getByRole('tab', { name: 'Code', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(sandbox.getByRole('tabpanel')).toHaveText('Packaged result');
  await expect(sandbox.getByText('Output', { exact: true })).toHaveCSS(
    'font-weight',
    '700',
  );
  const sandboxChat = page.getByTestId('packaged-sandbox-chat');
  await sandboxChat
    .getByRole('button', { name: 'Generate code', exact: true })
    .click();
  await expect(sandboxChat.getByRole('status')).toHaveText('Tool completed.', {
    timeout: 20000,
  });
  await sandboxChat.getByRole('tab', { name: 'Output', exact: true }).click();
  await expect(sandboxChat.getByRole('tabpanel')).toContainText('[2, 3, 5, 7]');
  await sandboxChat
    .getByRole('button', { name: 'Tool failure', exact: true })
    .click();
  await expect(sandboxChat.getByRole('status')).toHaveText('Tool failed.', {
    timeout: 20000,
  });
  await sandboxChat.getByRole('tab', { name: 'Output', exact: true }).click();
  await expect(sandboxChat.getByRole('alert')).toContainText(
    'Example execution service failed',
  );

  const webPreview = page.getByTestId('packaged-web-preview');
  await expect(
    webPreview.frameLocator('iframe').getByRole('heading'),
  ).toHaveText('Packaged frame');
  await expect(webPreview.getByTitle('Packaged preview')).toHaveCSS(
    'border-radius',
    '12px',
  );
  await expect(
    webPreview.getByRole('button', { name: 'Unavailable navigation' }),
  ).toBeDisabled();
  await expect(
    webPreview.getByRole('region', { name: 'Console' }),
  ).toContainText('No captured events');
  const generatedPreview = page.getByTestId('packaged-preview-example');
  await generatedPreview
    .getByRole('button', { name: 'Generate preview', exact: true })
    .click();
  await expect(generatedPreview.getByRole('status')).toHaveText(
    'Generated preview ready.',
    { timeout: 20000 },
  );
  const previewFrame = generatedPreview.frameLocator('iframe');
  await expect(previewFrame.getByRole('heading')).toHaveText(
    'Generated interactive preview',
  );
  await expect(previewFrame.getByText('Parent DOM isolated')).toBeVisible();
  await generatedPreview
    .getByRole('button', { name: 'Console', exact: true })
    .click();
  await expect(generatedPreview.getByRole('region')).toContainText(
    'Frame load event received.',
  );
  await previewFrame.getByRole('button', { name: 'Count: 0' }).click();
  await expect(previewFrame.getByRole('button')).toHaveText('Count: 1');

  const snippet = page.getByTestId('packaged-snippet');
  const command = snippet.getByRole('textbox', { name: 'Packaged command' });
  await expect(command).toHaveValue('pnpm add mantine-ai-elements');
  await expect(command).toHaveAttribute('readonly');
  await expect(command).toHaveCSS('font-weight', '700');
  await snippet.getByText('$', { exact: true }).click();
  await expect(command).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    snippet.getByRole('button', { name: 'Copy', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    snippet.getByRole('button', { name: 'Copied', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('pnpm add mantine-ai-elements');

  const artifact = page.getByTestId('packaged-artifact');
  await expect(
    artifact.getByRole('heading', { name: 'Packaged artifact' }),
  ).toBeVisible();
  await expect(
    artifact.getByRole('link', { name: 'Artifact reference' }),
  ).toHaveAttribute('href', '/reference');
  await expect(artifact.locator('.mantine-ArtifactAction-icon')).toHaveCSS(
    'font-weight',
    '700',
  );
  await expect(
    artifact.getByRole('button', { name: 'Close', exact: true }),
  ).toBeDisabled();
  await expect(artifact.getByRole('region')).toHaveText('Document content');
  const artifactObject = page.getByTestId('packaged-artifact-object');
  await artifactObject
    .getByRole('button', { name: 'Generate report', exact: true })
    .click();
  await expect(artifactObject.getByRole('status')).toHaveText('Report ready.', {
    timeout: 20000,
  });
  await expect(
    artifactObject.getByRole('button', { name: 'Copy report' }),
  ).toBeEnabled();
  const artifactDownload = page.waitForEvent('download');
  await artifactObject.getByRole('button', { name: 'Download report' }).click();
  const reportDownload = await artifactDownload;
  assert.equal(reportDownload.suggestedFilename(), 'chat-report.md');
  assert.match(
    await readFile(await reportDownload.path(), 'utf8'),
    /# Chat interface implementation report/,
  );
  await artifactObject.getByRole('button', { name: 'Close report' }).click();
  await expect(artifactObject.getByRole('region')).toHaveCount(0);
  await artifactObject.getByRole('button', { name: 'Reopen report' }).click();
  await expect(artifactObject.getByRole('region')).toContainText(
    'Chat interface implementation report',
  );

  const progressPanel = page.getByTestId('packaged-chain');
  await progressPanel
    .getByRole('button', { name: 'Packaged progress' })
    .focus();
  await page.keyboard.press('Enter');
  await expect(progressPanel.getByRole('region')).toBeVisible();
  await expect(
    progressPanel.getByRole('link', { name: 'Packaged source' }),
  ).toHaveAttribute('href', '/reference');
  await expect(
    progressPanel.getByText('Packaged source', { exact: true }),
  ).toHaveCSS('font-weight', '700');
  await expect(progressPanel.getByText('Preview caption')).toBeVisible();
  const progressChat = page.getByTestId('packaged-chain-chat');
  await progressChat
    .getByRole('button', { name: 'Run search', exact: true })
    .click();
  await expect(progressChat.getByRole('status')).toHaveText(
    'Response finished.',
    { timeout: 20000 },
  );
  await expect(progressChat.getByTestId('search-step')).toHaveAttribute(
    'data-status',
    'complete',
  );
  await expect(progressChat.getByTestId('reply-step')).toHaveAttribute(
    'data-status',
    'complete',
  );
  await progressChat.getByRole('button', { name: 'Request failure' }).click();
  await expect(progressChat.getByRole('alert')).toContainText(
    'Demo transport error',
  );
  await expect(progressChat.getByTestId('reply-step')).toHaveAttribute(
    'data-status',
    'pending',
  );

  const plan = page.getByTestId('packaged-plan');
  await expect(
    plan.getByRole('heading', { name: 'Packaged plan' }),
  ).toBeVisible();
  await expect(plan.getByText('Persistent footer')).toBeVisible();
  await expect(plan.getByRole('region')).not.toBeVisible();
  await plan.getByRole('button', { name: 'Toggle plan' }).focus();
  await page.keyboard.press('Enter');
  await expect(plan.getByRole('region')).toBeVisible();
  await expect(plan.locator('.mantine-PlanContent-body')).toHaveCSS(
    'padding-inline-start',
    '23px',
  );
  const planObject = page.getByTestId('packaged-plan-object');
  const selectPlan = planObject.getByRole('button', { name: 'Use this plan' });
  await expect(selectPlan).toBeDisabled();
  await planObject
    .getByRole('button', { name: 'Generate plan', exact: true })
    .click();
  await expect(planObject.locator('.mantine-Shimmer-root')).toHaveCount(2);
  await expect(planObject.getByRole('status')).toHaveText(
    'Plan ready for review.',
    { timeout: 15000 },
  );
  await expect(planObject.locator('.mantine-Shimmer-root')).toHaveCount(0);
  await selectPlan.click();
  await expect(planObject.getByRole('status')).toHaveText(
    'Selected plan: Build an accessible chat interface',
  );

  const task = page.getByTestId('packaged-task');
  const taskTrigger = task.getByRole('button', { name: 'Packaged task' });
  await taskTrigger.focus();
  await taskTrigger.press('Enter');
  const taskRegion = task.getByRole('region', { name: 'Packaged task' });
  await expect(taskRegion).toBeVisible();
  await expect(taskRegion.locator('.mantine-Task-body')).toHaveCSS(
    'border-inline-start-width',
    '3px',
  );
  await expect(task.getByText('package.json', { exact: true })).toHaveCSS(
    'display',
    'inline-flex',
  );
  const taskObject = page.getByTestId('packaged-task-object');
  await taskObject
    .getByRole('button', { name: 'Generate tasks', exact: true })
    .click();
  await expect(taskObject.getByRole('status')).toHaveText('Report complete.', {
    timeout: 15000,
  });
  await expect(
    taskObject.getByText('src/Task/Task.test.tsx', { exact: true }),
  ).toBeVisible();
  await taskObject.getByRole('button', { name: 'Invalid report' }).click();
  await expect(taskObject.getByRole('status')).toHaveText(
    'Report validation failed.',
  );
  await expect(taskObject.getByRole('alert')).toBeVisible();
  await taskObject.getByRole('button', { name: 'Clear', exact: true }).click();

  const queue = page.getByTestId('packaged-queue-chat');
  const queueDraft = queue.getByRole('textbox', { name: 'Queue draft' });
  await queueDraft.fill('A packaged draft');
  await queue.getByRole('button', { name: 'Add to queue' }).click();
  await queue.getByRole('checkbox', { name: 'Fail next send' }).check();
  const queuedSend = queue.getByRole('button', {
    name: 'Send A packaged draft',
    exact: true,
  });
  await queuedSend.focus();
  await queuedSend.press('Enter');
  await expect(queue.getByRole('alert')).toContainText(
    'Simulated network failure',
  );
  await expect(
    queue.getByRole('list', { name: 'Drafts' }).getByRole('listitem'),
  ).toHaveCount(1);
  await queuedSend.click();
  await expect(queue.getByRole('status')).toHaveText(
    'Reply completed. The draft was removed from the queue.',
    { timeout: 20000 },
  );
  await expect(queue.locator('[data-role="user"]')).toHaveCount(1);
  await expect(queue.getByText('No queued drafts.')).toBeVisible();

  const checkpoint = page.getByTestId('packaged-checkpoint');
  await expect(checkpoint).toHaveCSS('display', 'flex');
  await expect(checkpoint.getByRole('separator')).toHaveCSS('opacity', '0.4');
  await expect(checkpoint.locator('svg')).toHaveCSS('width', '24px');
  const checkpointTrigger = checkpoint.getByRole('button', {
    name: 'Packaged checkpoint',
  });
  await expect(checkpointTrigger).toHaveAttribute('type', 'button');
  await checkpointTrigger.scrollIntoViewIfNeeded();
  await checkpointTrigger.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(checkpointTrigger).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveText('Restore the saved chat');
  await checkpointTrigger.blur();
  await expect(page.getByRole('tooltip')).toHaveCount(0);

  const openInTrigger = page.getByRole('button', {
    name: 'Open packaged query',
  });
  await openInTrigger.focus();
  await openInTrigger.press('Enter');
  const openInMenu = page.getByRole('menu').filter({ hasText: 'Services' });
  await expect(openInMenu).toHaveCSS('border-radius', '17px');
  await expect(openInMenu).toHaveCSS('opacity', '1');
  await openInMenu.focus();
  await openInMenu.press('ArrowDown');
  await expect(
    openInMenu.getByRole('menuitem', { name: 'Open in Claude', exact: true }),
  ).toBeFocused();
  await expect(
    openInMenu.getByRole('menuitem', { name: 'Open in ChatGPT', exact: true }),
  ).not.toHaveAttribute('href');
  const claudeHref = await openInMenu
    .getByRole('menuitem', { name: 'Open in Claude', exact: true })
    .getAttribute('href');
  expect(new URL(claudeHref).searchParams.get('q')).toBe(
    'A packaged query & Unicode 日本語',
  );
  await openInMenu.press('Escape');
  await expect(openInTrigger).toBeFocused();
  const contextExample = page.getByTestId('context-example');
  await contextExample
    .getByRole('button', { name: 'Report usage', exact: true })
    .click();
  await contextExample
    .getByRole('button', { name: '46.9%', exact: true })
    .focus();
  const usageDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Estimated total' });
  await expect(usageDialog.getByText('$0.042', { exact: true })).toBeVisible();
  await expect(usageDialog.getByText('Cache').locator('..')).toContainText(
    '3K',
  );
  await expect(usageDialog.locator('.mantine-Context-footer')).toHaveCSS(
    'padding',
    '21px',
  );
  await usageDialog.press('Escape');
  await contextExample
    .getByRole('button', { name: 'Server cost', exact: true })
    .focus();
  await expect(
    page.getByRole('dialog').getByText('$1.25', { exact: true }),
  ).toBeVisible();
  await page.getByRole('dialog').press('Escape');
  await contextExample
    .getByRole('button', { name: 'Unknown model', exact: true })
    .focus();
  await expect(
    page.getByRole('dialog').getByText('—', { exact: true }),
  ).toBeVisible();
  await page.getByRole('dialog').press('Escape');
  await contextExample
    .getByRole('button', { name: 'Bundled catalog', exact: true })
    .focus();
  await expect(page.getByRole('dialog').getByText(/^\$[0-9]/)).toBeVisible();
  await page.getByRole('dialog').press('Escape');
  const citation = page.getByTestId('inline-citation');
  await citation.getByRole('button').focus();
  const citationDialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Packaged source one' });
  await expect(citationDialog.getByText('1/2', { exact: true })).toBeVisible();
  await expect(
    citationDialog.locator('.mantine-InlineCitationCarousel-header'),
  ).toHaveCSS('padding', '19px');
  await citationDialog
    .getByRole('button', { name: 'Next', exact: true })
    .click();
  await expect(citationDialog.getByText('2/2', { exact: true })).toBeVisible();
  await expect(citation.locator('div')).toHaveCount(0);
  await citationDialog.press('Escape');
  await expect(citationDialog).toHaveCount(0);
  const sources = page.getByTestId('sources');
  const sourcesTrigger = sources.getByRole('button', { name: 'Used 1 source' });
  await sourcesTrigger.focus();
  await sourcesTrigger.press('Enter');
  await expect(sources.getByRole('link')).toHaveAttribute(
    'href',
    'https://example.com/reference',
  );
  await expect(sources.getByRole('link')).toHaveAttribute('rel', 'noreferrer');
  await expect(sourcesTrigger).toHaveCSS('color', 'rgb(10, 20, 30)');
  await sourcesTrigger.press('Space');
  await expect(sources.getByRole('link')).toHaveCount(0);
  const question = page.getByTestId('question');
  await expect(question.getByRole('button', { name: 'Answer' })).toBeDisabled();
  await question.getByRole('radio', { name: 'Search', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    question.getByRole('radio', { name: 'Export', exact: true }),
  ).toHaveAttribute('aria-checked', 'true');
  await question
    .getByRole('textbox', { name: 'Details' })
    .fill('  Keep tests  ');
  await question.getByRole('button', { name: 'Answer' }).click();
  await expect(question.getByRole('status')).toHaveText(
    '{"selectedValues":["export"],"text":"Keep tests"}',
  );
  await expect(question.getByRole('textbox', { name: 'Details' })).toHaveValue(
    '  Keep tests  ',
  );
  const confirmation = page.getByTestId('confirmation-chat');
  await confirmation.getByRole('button', { name: 'Request approval' }).click();
  await expect(
    confirmation.getByRole('button', { name: 'Approve', exact: true }),
  ).toBeEnabled();
  await confirmation
    .getByRole('button', { name: 'Approve', exact: true })
    .click();
  await expect(
    confirmation.getByText('Approved', { exact: true }),
  ).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'lookup Completed' }),
  ).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'Request approval' }),
  ).toBeEnabled();
  await confirmation.getByRole('button', { name: 'Request approval' }).click();
  await confirmation
    .getByRole('button', { name: 'Reject', exact: true })
    .click();
  await expect(
    confirmation.getByText('Rejected', { exact: true }),
  ).toBeVisible();
  await expect(
    confirmation.getByRole('button', { name: 'lookup Denied' }),
  ).toBeVisible();
  const tool = page.getByTestId('tool');
  const toolHeader = tool.getByRole('button', { name: 'lookup Completed' });
  await expect(toolHeader).toHaveAttribute('aria-expanded', 'true');
  await expect(tool.getByRole('region').locator('code').last()).toHaveText(
    'false',
  );
  await expect(
    tool.getByRole('region').locator(':scope > div').first(),
  ).toHaveCSS('padding', '21px');
  await toolHeader.focus();
  await toolHeader.press('Enter');
  await expect(tool.getByRole('region')).toHaveCount(0);
  await toolHeader.press('Space');
  await expect(tool.getByRole('region')).toBeVisible();
  const reasoning = page.getByTestId('reasoning');
  const reasoningTrigger = reasoning.getByRole('button', {
    name: 'Thought for 3 seconds',
  });
  await expect(reasoningTrigger).toHaveAttribute('aria-expanded', 'false');
  await reasoningTrigger.focus();
  await reasoningTrigger.press('Enter');
  await expect(reasoning.getByRole('region')).toBeVisible();
  await expect(reasoning.locator('strong')).toHaveText('packaged');
  await expect(reasoningTrigger).toHaveCSS('color', 'rgb(120, 20, 150)');
  await reasoningTrigger.press('Space');
  await expect(reasoning.getByRole('region')).toHaveCount(0);
  const prompt = page.getByTestId('prompt-attachments');
  await prompt.scrollIntoViewIfNeeded();
  const draft = prompt.getByRole('textbox', { name: 'Attachment draft' });
  await prompt.getByRole('button', { name: 'Insert shared draft' }).click();
  await expect(draft).toHaveValue('Shared draft');
  const search = prompt.getByRole('combobox', { name: 'Find reference' });
  await search.fill('manual');
  await expect(prompt.getByRole('option', { name: 'Guide' })).toHaveCSS(
    'border-radius',
    '13px',
  );
  await search.press('Enter');
  await expect(prompt.getByTestId('reference-count')).toHaveText('1');
  await expect(draft).toHaveValue('Shared draft');
  await search.fill('missing');
  await expect(prompt.getByText('No reference', { exact: true })).toBeVisible();
  await search.fill('');
  await prompt.getByRole('combobox', { name: 'Attachment model' }).click();
  await page.getByRole('option', { name: 'detailed', exact: true }).click();
  await expect(
    prompt.getByRole('combobox', { name: 'Attachment model' }),
  ).toHaveValue('detailed');
  const modelTrigger = prompt.getByRole('button', { name: 'Pick a model' });
  await modelTrigger.click();
  const modelDialog = page.getByRole('dialog', {
    name: 'Choose attachment model',
  });
  const modelSearch = modelDialog.getByRole('combobox', {
    name: 'Filter attachment models',
  });
  await expect(modelSearch).toBeFocused();
  await modelSearch.fill('missing');
  await expect(modelDialog.getByText('No matching models')).toBeVisible();
  await modelSearch.fill('thorough');
  await expect(modelDialog.getByRole('option')).toHaveCSS(
    'padding-top',
    '15px',
  );
  await expect
    .poll(() =>
      modelDialog
        .getByRole('img', { name: 'local logo' })
        .evaluate((node) => node.naturalWidth),
    )
    .toBe(24);
  await modelSearch.press('Enter');
  await expect(modelDialog).not.toBeVisible();
  await expect(modelTrigger).toBeFocused();
  await expect(
    prompt.getByRole('combobox', { name: 'Attachment model' }),
  ).toHaveValue('detailed');
  await modelTrigger.click();
  await page.keyboard.press('Escape');
  await expect(modelDialog).not.toBeVisible();
  await expect(modelTrigger).toBeFocused();
  await prompt.getByRole('button', { name: 'Add to prompt' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('menuitem', { name: 'Add photos or files' }).click();
  await (await chooser).setFiles({
    name: 'readme.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('package attachment'),
  });
  await page.keyboard.press('Escape');
  await expect(prompt.getByText('readme.txt', { exact: true })).toBeVisible();
  await draft.fill('retry');
  await draft.press('Enter');
  await expect(prompt.getByTestId('attachment-error')).toHaveText(
    'Retry requested',
  );
  await expect(draft).toHaveValue('retry');
  await expect(prompt.getByText('readme.txt', { exact: true })).toBeVisible();
  await draft.fill('');
  await draft.press('Enter');
  await expect(prompt.getByTestId('attachment-status')).toHaveText('streaming');
  await draft.fill('Next attachment draft');
  await prompt.getByRole('button', { name: 'Stop attachments' }).click();
  await expect(prompt.getByTestId('attachment-status')).toHaveText('ready');
  await expect(draft).toHaveValue('Next attachment draft');
  await expect(prompt.getByText('readme.txt', { exact: true })).toHaveCount(0);
  await expect(prompt.getByTestId('reference-count')).toHaveText('0');
  const sentFiles = JSON.parse(
    await prompt.getByTestId('sent-files').textContent(),
  );
  assert.equal(
    sentFiles[0].url,
    `data:text/plain;base64,${Buffer.from('package attachment').toString('base64')}`,
  );
  assert.equal(sentFiles[0].id, undefined);
  await draft.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(['paste'], 'paste.txt', { type: 'text/plain' }),
    );
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(prompt.getByText('paste.txt', { exact: true })).toBeVisible();
  await prompt.locator('form').evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['drop'], 'drop.txt', { type: 'text/plain' }));
    transfer.items.add(
      new File(['excess'], 'excess.txt', { type: 'text/plain' }),
    );
    element.dispatchEvent(
      new DragEvent('drop', {
        dataTransfer: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(prompt.getByTestId('attachment-error')).toHaveText('max_files');
  await expect(prompt.getByText('drop.txt', { exact: true })).toBeVisible();
  await expect(prompt.getByText('excess.txt', { exact: true })).toHaveCount(0);
  await draft.fill('');
  await draft.press('Backspace');
  await expect(prompt.getByText('drop.txt', { exact: true })).toHaveCount(0);

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
