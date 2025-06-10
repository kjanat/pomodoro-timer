#!/usr/bin/env node
const { execSync } = require('child_process')

let pnpmCmd = 'pnpm'
try {
  execSync(`${pnpmCmd} -v`, { stdio: 'ignore', shell: true })
} catch (_) {
  pnpmCmd = 'npx --yes pnpm'
  console.warn('pnpm not found, using npx pnpm')
}

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

  run(`${pnpmCmd} exec prettier --write ${all}`)
  if (js) {
    run(`${pnpmCmd} exec standard --fix ${js}`)
    run(`${pnpmCmd} exec standard ${js}`)
  }
} else {
  run(`${pnpmCmd} format`)
  run(`${pnpmCmd} lint:fix`)
  run(`${pnpmCmd} lint`)
}
