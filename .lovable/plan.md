

## Issues

1. **Map overlaps header on scroll** — The Leaflet map container creates its own stacking context with high z-index, overlapping the sticky header (`z-50`). Need to ensure the map stays below the header.

2. **Layout too small at 100% zoom** — Fixed heights (`h-[500px]`/`h-[580px]`) and `max-w-7xl` constrain the layout, requiring 125% zoom. Need to use viewport-relative sizing and a wider container.

## Changes

### `src/components/DashboardHeader.tsx`
- Bump z-index from `z-50` to `z-[1000]` to guarantee it sits above Leaflet's internal z-indices (which go up to ~600+)

### `src/index.css`
- Add `.leaflet-container { z-index: 1; }` to keep the map in a low stacking layer
- Add `position: relative` to the leaflet container rule

### `src/pages/Index.tsx`
- Remove `max-w-7xl` constraint — use full-width with more padding instead (e.g., `px-6 lg:px-10`)
- Change map height from fixed `h-[500px] lg:h-[580px]` to viewport-relative `h-[60vh] lg:h-[75vh]` so it scales with screen size at 100% zoom
- Adjust info panel max-height similarly

