

## Problem

The blank screen is likely caused by the same `render2 is not a function` error from before. While the `bun.lock` was updated to reference `react-leaflet@4.2.1`, the Vite dependency cache (`.vite/deps/`) may still contain the old v5 code, or the lockfile edit didn't trigger a proper reinstall.

## Plan

1. **Move the leaflet CSS import** — The `@import` at line 1 of `index.css` may conflict with Tailwind's `@tailwind` directives. Change it to a `<link>` tag in `index.html` instead, which is more reliable.

2. **Ensure clean dependency resolution** — Delete and regenerate `bun.lock` so that the sandbox properly installs `react-leaflet@4.2.1` and `@react-leaflet/core@2.1.0`. This forces Vite to rebuild its dependency cache.

### Files to change

- **`index.html`** — Add `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />` in `<head>`
- **`src/index.css`** — Remove line 1 (`@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"`)
- **`bun.lock`** — Delete and let it regenerate to force a clean install

