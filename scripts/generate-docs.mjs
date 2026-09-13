import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('.docs-public/', root);
const manifest = JSON.parse(
  await readFile(new URL('package.json', root), 'utf8'),
);
const base = new URL(process.env.DOCS_BASE_URL ?? manifest.homepage);
assert.ok(base.pathname.endsWith('/'), 'Docs base URL must end with /');
const source = new URL('.storybook/content/', root);
const files = (await readdir(source))
  .filter((name) => name.endsWith('.md'))
  .sort();
assert.ok(files.length, 'Missing documentation');
await rm(output, { recursive: true, force: true });
await mkdir(new URL('markdown/', output), { recursive: true });
const links = [];
const sections = [];
for (const name of files) {
  const text = await readFile(new URL(name, source), 'utf8');
  const title = /^# (.+)$/m.exec(text)?.[1];
  assert.ok(title, `Missing title: ${name}`);
  for (const [, target] of text.matchAll(/\]\(\.\/([^)#]+)(?:#[^)]*)?\)/g)) {
    assert.ok(
      files.includes(target),
      `Broken documentation link in ${name}: ${target}`,
    );
  }
  await writeFile(new URL(`markdown/${name}`, output), text);
  links.push(
    `- [${title}](${new URL(`markdown/${name}`, base)}): ${title} for Mantine AI Elements.`,
  );
  sections.push(text);
}
const intro = `# Mantine AI Elements\n\n> Composable AI SDK components with Mantine styling.\n\nRepository main-branch documentation; package.json version: ${manifest.version}. Features may precede an npm release. Text-only PromptInput; no attachment support.\n`;
await writeFile(
  new URL('llms.txt', output),
  `${intro}\n## Documentation\n\n${links.join('\n')}\n\n## Optional\n\n- [Complete documentation](${new URL('llms-full.txt', base)}): All guides in one text file.\n`,
);
await writeFile(
  new URL('llms-full.txt', output),
  `${intro}\n${sections.join('\n\n---\n\n')}`,
);
await writeFile(new URL('.nojekyll', output), '');
console.log(
  `Generated Markdown and LLM documentation in ${fileURLToPath(output)}`,
);
