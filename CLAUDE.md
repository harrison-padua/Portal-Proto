# Prototype repo

This repo is a prototype Angular app deployed to GitHub Pages. It exists so non-technical users (business analysts, designers) can iterate on UI ideas with Claude Code on the web and see results live, without running anything locally.

## What goes here
- One prototype per repo.
- Single-page-ish Angular app, mock data only, no backend.
- Persist with localStorage if needed.

## Stack
- Angular 21 standalone, signals, `@if`/`@for`.
- Tailwind v4 + daisyUI v5.
- **Padua UI** is followed by replicating documented daisyUI class patterns from the Padua Storybook (via MCP).

> The private package `@paduafg/ng-component-lib` is NOT installed. Use the underlying daisyUI classes shown in each Padua component's Storybook page.

## Rules for Claude
1. **Always consult the Padua UI Storybook MCP first.** Call `list-all-documentation`, then `get-documentation` for each component you'll use. Never invent props, classes, or variants.
2. **Follow Padua's daisyUI class patterns exactly** (`card bg-base-100 border border-base-300`, `btn btn-primary`, `input`, `checkbox`, etc.).
3. **Use Decision Guides** before picking components.
4. **Page shell:** sidebar + main per `PageStructure`. Page bg `bg-base-200`, content surfaces `bg-base-100` in cards. No shadows.
5. **No backend, no real APIs, no auth, no real data.** Mock everything.
6. **Don't install `@paduafg/ng-component-lib`** — private; CI has no auth.
7. **First job in a fresh prototype**: ensure `.github/workflows/deploy.yml` `--base-href` matches the new repo name.
8. **Always use Angular 21 best practice, including signal forms.**

## Local dev
```
npm install
npm start    # http://localhost:4200
```

## Deploy
Pushes to `main` trigger `.github/workflows/deploy.yml`, building and publishing to GitHub Pages. Latest push wins.

**One-time human setup per new prototype repo:**
- Settings → Pages → Source: **GitHub Actions**.
- Settings → Environments → `github-pages` → allow `main`.
