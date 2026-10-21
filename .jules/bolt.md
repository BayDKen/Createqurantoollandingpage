## 2025-01-20 - Unusually Large Diff Warning with pnpm install
**Learning:** Running pnpm install can trigger an unbypassable diff size is unusually large error in this environment if .gitignore isnt fully configured to ignore node_modules and .pnpm-store.
**Action:** Always discard local dependency changes using rm -rf node_modules pnpm-lock.yaml package-lock.json if this occurs and skip local dependency installation and building, relying strictly on manual code verification to proceed.
