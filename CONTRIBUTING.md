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

## Changes and pull requests

Keep the public API composable and consistent with Mantine. Add or update stories for visible behavior and focused regression tests for behavioral changes. Run the checks above before submitting a pull request; run distribution verification when changing exports, dependencies, styling, or the build setup.

Preserve upstream attribution when adapting AI Elements code. Include a description of user-visible behavior and the relevant validation in your pull request.
