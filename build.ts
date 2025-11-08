#!/usr/bin/env bun

// Build script for Pomodoro Timer
// Uses Bun's native HTML bundler and service worker compilation

import { rm } from 'node:fs/promises'

const OUT_DIR = './dist'

// Clean output directory
try {
  await rm(OUT_DIR, { recursive: true })
  console.log(`✓ Cleaned output directory: ${OUT_DIR}`)
} catch {
  // Ignore if directory does not exist
}

const result = await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  minify: true,
  target: 'browser',
  sourcemap: 'linked',
})

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    console.error(message)
  }
  process.exit(1)
}

// Generate service worker with precache manifest from build artifacts
const generateServiceWorker = async () => {
  // Read SW template
  const template = await Bun.file('./src/sw.template.ts').text()

  // Extract all built files for precaching
  const precacheFiles = result.outputs
    .filter((output) => output.kind !== 'sourcemap')
    .map((output) => {
      // Convert absolute path to relative path from dist
      const relativePath = output.path.replace(/.*\/dist/, '')
      return relativePath
    })

  // Add manifest.json to precache
  precacheFiles.push('/manifest.json')

  // Generate cache name with hash from first output
  const buildHash =
    result.outputs[0]?.hash?.slice(0, 8) || Date.now().toString()
  const cacheName = `pomodoro-timer-${buildHash}`

  // Inject values into template (match the exact strings including quotes)
  const swCode = template
    .replace("'__CACHE_NAME__'", `'${cacheName}'`)
    .replace('__PRECACHE_MANIFEST__ as string[]', JSON.stringify(precacheFiles))

  // Write temporary TS file for transpilation
  const tempSwPath = './dist/sw.temp.ts'
  await Bun.write(tempSwPath, swCode)

  // Transpile to JS using Bun.build
  const swBuild = await Bun.build({
    entrypoints: [tempSwPath],
    outdir: './dist',
    naming: 'sw.js',
    minify: true,
    target: 'browser',
  })

  if (!swBuild.success) {
    console.error('Service worker transpilation failed')
    for (const message of swBuild.logs) {
      console.error(message)
    }
    throw new Error('SW build failed')
  }

  // Clean up temp file
  await rm(tempSwPath)

  return { cacheName, precacheFiles }
}

const { cacheName, precacheFiles } = await generateServiceWorker()
console.log(`\n✓ Service worker generated with cache: ${cacheName}`)
console.log(`  Precaching ${precacheFiles.length} files`)

// Copy manifest.json to dist
try {
  await Bun.write('./dist/manifest.json', Bun.file('./src/manifest.json'))
} catch (error) {
  console.error('Failed to copy manifest.json:', error)
  process.exit(1)
}

// Print build summary
console.log('\n✓ Build completed successfully')
console.log('\nOutputs:')
for (const output of result.outputs) {
  const size = (output.size / 1024).toFixed(2)
  console.log(`  ${output.path} (${size} KB)`)
}

// Show SW size
const swFile = Bun.file('./dist/sw.js')
const swSize = (swFile.size / 1024).toFixed(2)
console.log(`  ${process.cwd()}/dist/sw.js (${swSize} KB)`)
