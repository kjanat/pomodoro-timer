#!/usr/bin/env node
const { execSync } = require('child_process')

let hasPnpm = true
try {
  execSync('pnpm -v', { stdio: 'ignore', shell: true })
} catch (_) {
  hasPnpm = false
  console.warn('pnpm not found, falling back to npm')
}

function runExec (cmd) {
  if (hasPnpm) {
    run(`pnpm exec ${cmd}`)
  } else {
    run(`npx ${cmd}`)
  }
}

function runScript (script) {
  if (hasPnpm) {
    run(`pnpm ${script}`)
  } else {
    run(`npm run ${script}`)
  }
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
  // Filter files to only those that Prettier can handle
  const prettierExtensions = [
    '.js',
    '.json',
    '.md',
    '.html',
    '.css',
    '.yml',
    '.yaml'
  ]
  const prettierFiles = files.filter(
    (f) =>
      prettierExtensions.some((ext) => f.endsWith(ext)) &&
      !f.includes('pnpm-lock.yaml')
  )
  const js = files.filter((f) => f.endsWith('.js'))

  if (prettierFiles.length) {
    runExec(`prettier --write ${prettierFiles.join(' ')}`)
  }
  if (js.length) {
    runExec(`standard --fix ${js.join(' ')}`)
    runExec(`standard ${js.join(' ')}`)
  }
} else {
  runScript('format')
  runScript('lint:fix')
  runScript('lint')
}
