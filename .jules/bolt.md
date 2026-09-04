## 2026-09-04 - Handling Figma Asset build failures
**Learning:** The project uses special figma asset imports which break production builds if not externalized, and fixing this out-of-scope issue should not be included in a PR for performance optimization.
**Action:** Use manual and visual verification when build fails due to pre-existing figma asset issues in Vite configuration.
