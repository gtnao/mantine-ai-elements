# Releasing

Stable releases are staged for approval by `.github/workflows/publish.yml` when a GitHub Release is published. A maintainer must then approve the staged package on npm with 2FA before it becomes publicly available. The release tag must be `v` followed by the version in `package.json`. Prereleases are not published by this workflow.

## One-time setup

1. Enable GitHub Pages in repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. `pages.yml` publishes the Storybook documentation from `main`.
2. Complete the first npm publication with the maintainer account, following the bootstrap steps below.
3. In the npm package settings, configure a GitHub Actions Trusted Publisher with:

| Field | Value |
| --- | --- |
| Organization or user | `gtnao` |
| Repository | `mantine-ai-elements` |
| Workflow filename | `publish.yml` |
| Environment | Leave empty |
| Allowed actions | Staged publishing only; leave direct `npm publish` unchecked |

The workflow uses GitHub-hosted runners, Node.js 24, npm 11.15.0 (staged publishing requires 11.15.0 or later), npm's OIDC support, and `id-token: write`. No npm token is stored in GitHub. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Once CI has run, make `Checks (Node 22)`, `Checks (Node 24)`, and `Package consumer` required checks for `main` in a GitHub ruleset. Maintain release permissions on the repository accordingly.

## First publication

Prepare the release commit, including its version, changelog, and installation documentation, and push it to GitHub. Wait for CI to pass. Use the same commit to generate and verify the tarball:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm test
pnpm build:storybook
pnpm exec playwright install chromium
PACKAGE_OUTPUT=mantine-ai-elements-0.1.0.tgz pnpm verify:package
npm publish ./mantine-ai-elements-0.1.0.tgz --access public --registry=https://registry.npmjs.org
```

The publish command requires an authenticated npm account and may request browser-based 2FA. It makes version 0.1.0 publicly available. Publish the verified tarball, not an unverified directory build.

Configure the trusted publisher after the package exists, then create the corresponding GitHub Release from the same commit. If that exact tarball is already on npm, the workflow skips publication; if the contents differ, it fails instead of claiming a successful release. Rebuilds with different tool versions may differ, so subsequent releases should use CI for their initial publication.

## Subsequent releases

1. Update `package.json` and `CHANGELOG.md`, document breaking changes and migration steps, and run the checks.
2. Merge/push the release commit and wait for CI.
3. Create a GitHub Release with tag `v<version>` targeting that commit, and include the changelog entry in the release notes.
4. The publish workflow rechecks the code, documentation, and the packed library in a production Next.js app. It submits the same verified tarball to npm staging. A successful workflow does not mean that the package is publicly available.
5. On npmjs.com, open **Staged Packages**, review the package name, version, and provenance against the release commit, then click **Approve** and complete 2FA. You can also inspect it with `npm stage view <stage-id>` and approve it with `npm stage approve <stage-id> --registry=https://registry.npmjs.org` using npm 11.15.0 or later.
6. Confirm the approved version is available with `npm view mantine-ai-elements version --registry=https://registry.npmjs.org`.

Before rerunning a failed workflow, check **Staged Packages**: an upload may already have succeeded. A pending staged version reserves that version number, so another upload can fail. Review and approve the existing stage if it is correct; reject an incorrect stage before preparing a replacement. Never enable direct publishing to bypass this step. An already published identical tarball is skipped; different contents for a published version require a new version.

See [npm staged publishing](https://docs.npmjs.com/staged-publishing/) for the review and approval process.

## Documentation

Human-readable guides live in `.storybook/content/`. The same Markdown is rendered by Storybook Docs and copied to the public `markdown/` directory. `pnpm docs:generate` creates `llms.txt` and `llms-full.txt`; generated files are not committed.

The site follows `main` and is labeled as development documentation. Update the supported versions and feature limitations with each release. The deployment URL is `https://gtnao.github.io/mantine-ai-elements/`; the LLM index is under that path at `llms.txt`. If the site moves, update `package.json`'s homepage or set `DOCS_BASE_URL` when building.
