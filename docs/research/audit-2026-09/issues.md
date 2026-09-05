# Audit findings → issues (2026-09-06)

Maps each row of `README.md`'s consolidated prioritized findings table to the
GitHub issue filed for it. All filed with the `needs-triage` label; none
close/edit/comment on existing issues (`gh issue list --limit 100 --state all`
was checked first — no duplicates existed).

## P1 (one issue each)

| Pri | Area | Source report | Issue |
|---|---|---|---|
| P1 | Domain data | architecture #2 | [#90](https://github.com/natcat38/rpg-build-optimizer/issues/90) |
| P1 | Design/AI feature | hallmark-audit #1 | [#91](https://github.com/natcat38/rpg-build-optimizer/issues/91) |
| P1 | Design/icons | hallmark-audit #2 | [#92](https://github.com/natcat38/rpg-build-optimizer/issues/92) |
| P1 | Testing | accessibility #5 | [#93](https://github.com/natcat38/rpg-build-optimizer/issues/93) |

## P2 (one issue each)

| Pri | Area | Source report | Issue |
|---|---|---|---|
| P2 | Testing infra | tech-debt TD-6 + TD-7 | [#94](https://github.com/natcat38/rpg-build-optimizer/issues/94) |
| P2 | Testing gaps | testing-strategy §5 (items 1-4) | [#95](https://github.com/natcat38/rpg-build-optimizer/issues/95) |
| P2 | Testing gaps | testing-strategy §5 (items 5-10) | [#96](https://github.com/natcat38/rpg-build-optimizer/issues/96) |
| P2 | Architecture | architecture #1 | [#97](https://github.com/natcat38/rpg-build-optimizer/issues/97) |
| P2 | YAGNI | ponytail-audit #1 | [#98](https://github.com/natcat38/rpg-build-optimizer/issues/98) |
| P2 | Design | hallmark-audit #3 | [#99](https://github.com/natcat38/rpg-build-optimizer/issues/99) |
| P2 | Design system | hallmark-audit #4 | [#100](https://github.com/natcat38/rpg-build-optimizer/issues/100) |

## P3 (batched by area)

| Batch | Rows covered | Issue |
|---|---|---|
| Accessibility | accessibility #1, #2, #3, #7, #8 | [#101](https://github.com/natcat38/rpg-build-optimizer/issues/101) |
| Design-system/copy/i18n | accessibility #9, web-design-guidelines (i18n), web-design-guidelines (copy), hallmark-audit #5 | [#102](https://github.com/natcat38/rpg-build-optimizer/issues/102) |
| Architecture/code-hygiene/test-hygiene | architecture #3, architecture #4, tech-debt TD-1, testing-strategy §3 | [#103](https://github.com/natcat38/rpg-build-optimizer/issues/103) |
| Dependencies/CI | tech-debt TD-3, TD-4, TD-9 | [#104](https://github.com/natcat38/rpg-build-optimizer/issues/104) |

## Skipped

- **tech-debt TD-8** — README says no action needed now; not filed.
- Items under "Not carried into the table" in `README.md` (accessibility #6,
  hallmark-audit #6, web-design-guidelines URL-state note, tech-debt TD-5) —
  not filed, per the source report's own verdict.
