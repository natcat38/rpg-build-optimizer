---
type: Component
title: Share link
description: A self-contained URL encoding a full build snapshot, with no backend or stored state.
resource: ../../src/share
tags: [component, sharing]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

A share link is the entire **build snapshot** encoded into a URL — character, weapon, build
level, five full [artifacts](/domain/artifact.md), [constraints](/domain/constraint.md),
[objective](/domain/objective.md), and meta target. Because the optimiser and sharing run entirely in the browser,
the link itself is the storage: opening it reconstructs the exact state with no server call.

# Citations

[ADR-0005 — self-contained share links](../../docs/adr/0005-self-contained-share-links.md);
[ADR-0025 — static app plus one optional serverless function](../../docs/adr/0025-static-app-plus-one-serverless-function.md) (supersedes ADR-0001).
Source: [`src/share`](../../src/share).
