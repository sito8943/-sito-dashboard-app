## Summary

- What changed:
- Why:

## Validation

- [ ] `npm run lint`
- [ ] `npm run docs:check`
- [ ] `npm run test`
- [ ] `npm run build`

## Documentation checklist

- [ ] If public behavior changed, I updated `README.md`.
- [ ] If agent rules changed, I updated `AGENTS.md` and kept `CLAUDE.md` aligned.
- [ ] I kept `.sito/*` as upstream/internal reference and did not treat it as canonical `@sito/dashboard-app` integration docs.
- [ ] Provider-order examples remain aligned to `ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider` (`NavbarProvider` when needed).
- [ ] `IconButton` examples are context-aware (`@sito/dashboard` vs `@sito/dashboard-app`).
