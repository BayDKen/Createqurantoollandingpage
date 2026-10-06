## 2024-05-18 - Background processes clearing git working tree during package install failures
**Learning:** During pnpm installations that fail due to the unbypassable environment "diff size is unusually large" wrapper warning, the environment script may silently run a `git clean` or `git checkout .` / `git restore .` in the background, permanently erasing all uncommitted work in tracked source files.
**Action:** Always fully stage and commit local changes to tracked files before attempting to run `pnpm install` or other potentially destructive environment wrapper commands.
