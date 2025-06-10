#!/usr/bin/env node
const { execSync } = require('child_process')

function run (command) {
  execSync(command, { stdio: 'inherit', shell: true })
}

run('pnpm format')
run('pnpm lint:fix')
run('pnpm lint')
