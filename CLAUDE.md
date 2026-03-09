# Project Guidelines

This repository publishes `@sito/dashboard-app`.
Agents must follow the files below before making changes.

@AGENTS.md
@.sito/dashboard.md
@README.md

When a change affects the public API or documented behavior:

- update `CHANGELOG.md`
- keep `AGENTS.md` and `CLAUDE.md` aligned
- prefer examples that use the public package entrypoint (`@sito/dashboard-app`)
- keep `Onboarding` docs aligned with the current public API: `steps` are structured objects with `title`, `body`, optional `content`, `image`, and `alt`, not internal translation keys
