---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## TECH STACK

When selecting a development server, prefer actively maintained options without known vulnerabilities. For static sites, `http-server` is preferred over `live-server` due to security concerns.

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

Always create an `AGENTS.md` file with project details to aid autonomous agents in understanding the project. This file should include project overview, technology stack, architecture details, file structure, implementation details, development information, customization options, troubleshooting tips, and any security considerations or fixes applied. Document any security fixes applied, like replacing `live-server` with `http-server` due to CVE-2024-4068. Document the Dependabot configuration for automated dependency management and security monitoring.

## CODING STANDARDS

Add a Prettier "format" script to the `package.json` file with the command: `"format": "prettier --write \"src/**/*.{js,html,css,json}\" \"*.{js,json,md}\" --ignore-path .gitignore"`. This formats JavaScript, HTML, CSS, and JSON files in the `src` directory, and JSON and Markdown files in the root directory, using `.gitignore` to automatically ignore files that shouldn't be formatted. Use Prettier's default configuration, without creating Prettier config files.

## WORKFLOW & RELEASE RULES

When creating new projects, initialize git, publish the repository publicly to GitHub under the user `kjanat`. The repository name should be `pomodoro-timer`. Create a new branch for development and add a GitHub Pages workflow action. Use `pnpm` as the package manager. Automatic review assignment is handled via a CODEOWNERS file.

## DEBUGGING

When dealing with Dependabot alerts related to vulnerable dependencies, especially transitive ones, investigate the root dependency causing the issue and attempt to update it or find a suitable alternative that resolves the vulnerability. Configure Dependabot with a `dependabot.yml` file to automatically keep dependencies updated and catch security vulnerabilities early. The `dependabot.yml` file should be configured to monitor both `package.json` and GitHub Actions dependencies. The `reviewers` and `assignees` fields in `dependabot.yml` are deprecated, use a `CODEOWNERS` file instead to handle automatic review assignments.