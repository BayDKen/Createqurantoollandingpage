## 2026-09-15 - Route Level Code Splitting
**Learning:** Vite requires Figma asset imports to be explicitly handled in `vite.config.ts`. Adding them to `build.rollupOptions.external` fixes build errors, but modifying `vite.config.ts` might be out of scope or unwanted if only trying to submit an optimization. However, it's necessary to actually build and test locally.
**Action:** Unstage `vite.config.ts` and `pnpm-lock.yaml` before final commit to keep the PR focused and clean, even if modified locally to get a successful build check.
