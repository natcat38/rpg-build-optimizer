---
name: autocrlf-formatcheck-gotcha
description: "Why `npm run format:check` fails locally on Windows but passes in CI"
metadata: 
  node_type: memory
  type: project
  originSessionId: 47b4390b-dd27-425a-9f25-d0790b1d71e5
---

On this repo (Windows, `git config core.autocrlf=true`), `npm run format:check` (`prettier --check .`) fails locally on ~100 pre-existing files. This is a **CRLF artifact**, not a real failure: git checks out files as CRLF locally, Prettier's default `endOfLine: "lf"` flags them. CI (Linux, LF checkout) passes — every prior PR was green.

**Why:** Don't chase the local full-repo `format:check` failure or "fix" it by reformatting the whole tree (that would commit line-ending churn).

**How to apply:** To verify a branch is CI-clean, run Prettier only on the files the branch changed:
`git diff --name-only main...HEAD | grep -E '\.(ts|tsx|js|json|md)$' | grep -v package-lock | xargs npx prettier --check`
A truly content-vs-CRLF distinction: `prettier --write` the file then `git diff` — empty diff = line-ending-only (CI-safe); content diff = real formatting that must be committed. Specs/plans written with the Write tool are NOT auto-prettier'd, so they can carry real markdown-table/wrap issues that fail CI — prettier them before pushing.

**CI gate (confirmed 2026-06-22):** the GitHub Actions `verify` job runs full-repo `npm run format:check` (`prettier --check .`), which **includes Markdown**. So the changed-files check above MUST keep `.md` in the grep — never narrow it to just `.ts/.tsx` (doing so let an unformatted plan doc fail `verify` on PR #18). The `validate` job (typecheck/lint/test/build) is separate and won't catch formatting.
