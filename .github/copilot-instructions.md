---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## TECH STACK

When selecting a development server, prefer actively maintained options without known vulnerabilities. For static sites, `http-server` is preferred over `live-server` due to security concerns (CVE-2024-4068). Prettier version `^3.5.3` should be used for code formatting. StandardJS version `^17.1.2` should be used for JavaScript linting.

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

Always create an `AGENTS.md` file with project details to aid autonomous agents in understanding the project. This file should include project overview, technology stack, architecture details, file structure, implementation details, development information, customization options, troubleshooting tips, and any security considerations or fixes applied. Document any security fixes applied, like replacing `live-server` with `http-server` due to CVE-2024-4068. Document the Dependabot configuration for automated dependency management and security monitoring. If a custom domain is added to the GitHub Pages project, update all relevant files (e.g., `README.md`, `package.json`, `AGENTS.md`, `index.html`) to reflect the new domain. Document the use of `pre-commit run --all-files` and the local installation of pre-commit hooks in `AGENTS.md` and `README.md`.

## CODING STANDARDS

Add a Prettier "format" script to the `package.json` file with the command: `"format": "prettier --write \"src/**/*.{js,html,css,json}\" \"*.{js,json,md}\" --ignore-path .gitignore"`. This formats JavaScript, HTML, CSS, and JSON files in the `src` directory, and JSON and Markdown files in the root directory, using `.gitignore` to automatically ignore files that shouldn't be formatted. Use Prettier's default configuration, without creating Prettier config files. Ensure that the `pnpm-lock.yaml` file is up to date with `package.json`. When styling input fields, ensure the `color` property is explicitly set to `var(--text-primary)` to ensure proper contrast in both light and dark modes. Use StandardJS for JavaScript linting alongside Prettier for formatting. Add the following linting scripts to `package.json`: `"lint": "standard"` and `"lint:fix": "standard --fix"`. Configure StandardJS to recognize browser and service worker globals. Due to potential style conflicts between Prettier (which defaults to double quotes and semicolons) and StandardJS (which enforces single quotes and no semicolons), run `pnpm lint:fix` after `pnpm format` to ensure StandardJS compliance. To prevent Prettier from attempting to format unsupported file types, the pre-commit hook or format script should be modified to only pass supported file types (e.g., `.js`, `.html`, `.css`, `.json`, `.md`, `.yml`, `.yaml`) to Prettier. The `pnpm-lock.yaml` file should also be excluded from Prettier formatting.

## WORKFLOW & RELEASE RULES

When creating new projects, initialize git, publish the repository publicly to GitHub under the user `kjanat`. The repository name should be `pomodoro-timer`. Create a new branch for development and add a GitHub Pages workflow action. Use `pnpm` as the package manager. Automatic review assignment is handled via a CODEOWNERS file. When deploying to GitHub Pages, update relevant files (e.g., `README.md`, `package.json`) to reflect any custom domains used. Also ensure a `CNAME` file exists in the repository's root. Update any Open Graph or Twitter meta tags in the HTML. The workflow should follow the order: `pnpm format`, then `pnpm lint:fix`, then `pnpm lint`. Use `pre-commit run --all-files` to run pre-commit hooks against all files in the project.

## DEBUGGING

When dealing with Dependabot alerts related to vulnerable dependencies, especially transitive ones, investigate the root dependency causing the issue and attempt to update it or find a suitable alternative that resolves the vulnerability. Configure Dependabot with a `dependabot.yml` file to automatically keep dependencies updated and catch security vulnerabilities early. The `dependabot.yml` file should be configured to monitor both `package.json` and GitHub Actions dependencies. The `reviewers` and `assignees` fields in `dependabot.yml` are deprecated, use a `CODEOWNERS` file instead to handle automatic review assignments. If pnpm installation fails due to deprecated subdependencies, especially with `standard`, try adding pnpm overrides in `package.json` for problematic dependencies or using `npm` for the initial install followed by `pnpm import` to generate the `pnpm-lock.yaml`. If pre-commit.ci fails due to a missing `node` executable, ensure that the pre-commit configuration is not using local hooks that depend on Node.js without explicitly specifying a Node.js environment in the pre-commit configuration.
