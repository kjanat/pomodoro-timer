#!/usr/bin/env bash
set -e
pnpm format
pnpm lint:fix
pnpm lint
