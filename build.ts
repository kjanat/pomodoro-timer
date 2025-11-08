#!/usr/bin/env bun

// Build script for Pomodoro Timer
// Uses Bun's native HTML bundler and service worker compilation

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

// Build service worker separately (can't be bundled with HTML)
const swResult = await Bun.build({
  entrypoints: ['./src/sw.ts'],
  outdir: './dist',
  naming: '[name].[ext]', // Keep as sw.js
  minify: true,
  target: 'browser',
})

if (!swResult.success) {
  console.error('Service worker build failed')
  for (const message of swResult.logs) {
    console.error(message)
  }
  process.exit(1)
}

// Copy manifest.json to dist
await Bun.write('./dist/manifest.json', Bun.file('./src/manifest.json'))

// Print build summary
console.log('✓ Build completed successfully')
console.log('\nOutputs:')
for (const output of [...result.outputs, ...swResult.outputs]) {
  const size = (output.size / 1024).toFixed(2)
  console.log(`  ${output.path} (${size} KB)`)
}
