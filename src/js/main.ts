// Single browser entry point. Bun bundles this (and its imports) for both the
// `bun ./src/index.html` dev server and the `bun build ./src/index.html`
// production build. Each module runs for its side effects, in the original
// load order: icons -> audio -> timer -> app.
import '#js/icons'
import '#js/audio'
import '#js/timer'
import '#js/app'
