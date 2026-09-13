import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mantine-ai-elements-css-layer',
      async writeBundle(options) {
        const directory = options.dir ?? 'dist';
        const css = await readFile(join(directory, 'styles.css'), 'utf8');
        await writeFile(
          join(directory, 'styles.layer.css'),
          `@layer mantine-ai-elements {\n${css}\n}`,
        );
      },
    },
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: (id) =>
        Object.keys(manifest.peerDependencies).some(
          (name) => id === name || id.startsWith(`${name}/`),
        ),
      output: { banner: '"use client";' },
    },
  },
});
