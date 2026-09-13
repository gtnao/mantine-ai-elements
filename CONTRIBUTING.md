# Contributing

## Local development

Use Node.js 22.12+ and pnpm 11.8.0 (the version recorded in `package.json`).

```sh
pnpm install
pnpm dev
```

Open http://localhost:6006. Storybook includes a basic input, a theme/controlled-input example, and an AI SDK example with streaming, cancellation, and errors. The AI SDK example uses a deterministic browser transport; no server or API key is needed. Send `/error` to exercise the error state. Switch between light and dark themes in the toolbar.

Keep documentation and examples in English. Include IME composition handling when changing keyboard behavior.

## Project layout

- `src/PromptInput/`: the component, styles, tests, and stories.
- `src/stories/`: shared example utilities.
- `.storybook/`: the development UI configuration.
- `.storybook/content/`: English user guides, shared by Storybook Docs and the LLM-friendly outputs.
- `tests/consumer/`: a Next.js fixture for testing the packaged library.
- `scripts/verify-package.mjs`: builds and checks the distribution in that fixture.

The repository publishes one package. `pnpm-workspace.yaml` holds pnpm build-script permissions; it does not define a multi-package workspace. React and Mantine remain peer dependencies, and examples/testing utilities are excluded from the published library.

## Verification

```sh
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm build:storybook
```

To verify the actual distribution in a separate Next.js application:

```sh
pnpm exec playwright install chromium
pnpm verify:package
```

Alternatively, set `CHROME_PATH` to an installed Chrome executable. The verification script creates a temporary directory, packs and installs this library there, builds a production Next.js app, and runs browser checks for CSS, hydration, autosize, streaming, cancellation, and error handling. It requires registry access for the isolated installation and keeps its artifacts in the reported temporary directory. It does not publish anything.

## Testing a local package

Before npm publication, you can install a tarball in your own application. From this repository:

```sh
pnpm install --frozen-lockfile
pnpm pack
```

Then, from your application (with the supported peer dependencies installed):

```sh
pnpm add /path/to/mantine-ai-elements-0.1.0.tgz
```

This installs a local package file; it does not publish to npm. For a release, use the verified tarball procedure in [RELEASING.md](RELEASING.md).

## Changes and pull requests

Keep the public API composable and consistent with Mantine. Add or update stories for visible behavior and focused regression tests for behavioral changes. Run the checks above before submitting a pull request; run distribution verification when changing exports, dependencies, styling, or the build setup.

Preserve upstream attribution when adapting AI Elements code. Include a description of user-visible behavior and the relevant validation in your pull request.

GitHub Actions runs the checks on Node.js 22 and 24 and verifies the packed library on Linux. Release and documentation deployment instructions are in [RELEASING.md](RELEASING.md).
