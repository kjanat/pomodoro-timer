// Minimal static file server for the production build in dist/.
// Replaces http-server for `bun run preview`.
import { join, normalize } from 'node:path'

const DIST = normalize(join(import.meta.dir, '..', 'dist'))
const port = Number(process.env.PORT ?? 3000)

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'

    // Resolve within dist/ and guard against path traversal.
    const filePath = normalize(join(DIST, pathname))
    if (filePath !== DIST && !filePath.startsWith(DIST + '/')) {
      return new Response('Forbidden', { status: 403 })
    }

    const f = Bun.file(filePath)
    if (await f.exists()) return new Response(f)
    return new Response('Not Found', { status: 404 })
  }
})

console.log(`Preview server running at http://localhost:${port}`)
