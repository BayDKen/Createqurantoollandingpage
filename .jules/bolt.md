## 2026-09-09 - figma:asset build errors
**Learning:** vite.config.ts must handle figma:asset imports by adding them to build.rollupOptions.external.
**Action:** Add figma:asset to build.rollupOptions.external in vite.config.ts if it is not present.
