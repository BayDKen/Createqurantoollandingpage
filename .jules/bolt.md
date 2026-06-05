## 2024-06-05 - Missing .gitignore and Vite build errors with figma:asset
**Learning:** This codebase lacks a proper `.gitignore` (which can cause operations like `pnpm install` to trigger automatic workspace resets due to massive diffs) and the `vite.config.ts` requires specific `rollupOptions.external` configuration for `figma:asset/*` imports to prevent production build failures.
**Action:** Always verify `.gitignore` contains build/dependency directories and ensure Vite configuration accounts for Figma-specific assets before building.
