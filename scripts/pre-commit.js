#!/usr/bin/env node
const { execSync } = require('child_process')

function run (command) {
  try {
    execSync(command, { stdio: 'inherit', shell: true })
  } catch (error) {
    console.error(`Error executing command: "${command}"`)
    console.error(error.message)
    process.exit(1)
  }
}

const files = process.argv.slice(2)

if (files.length) {
  const all = files.join(' ')
  const js = files.filter(f => f.endsWith('.js')).join(' ')

  run(`pnpm exec prettier --write ${all}`)
  if (js) {
    run(`pnpm exec standard --fix ${js}`)
    run(`pnpm exec standard ${js}`)
  }
} else {
  run('pnpm format')
  run('pnpm lint:fix')
  run('pnpm lint')
}
