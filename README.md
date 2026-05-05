# prototype-template

A GitHub-template repo for spinning up Angular prototypes that auto-deploy to GitHub Pages. Built so non-technical users (BAs, designers) can iterate on UI ideas with Claude Code on the web — no local setup.

**👉 If you're a BA or designer starting a new prototype, read [PROTOTYPING.md](./PROTOTYPING.md).**

## What's in here

- Angular 21 (standalone, signals, `@if`/`@for`).
- Tailwind v4 + daisyUI v5 (corporate theme).
- Padua UI design language followed via documented daisyUI class patterns (Padua Storybook MCP is the source of truth).
- GitHub Actions workflow that builds and publishes to GitHub Pages on every push to `main`.
- `CLAUDE.md` — the rules Claude follows when working in this repo.

## Quick start

1. Click **Use this template** → create your repo.
2. **Settings → Pages → Source: GitHub Actions.**
3. Open your repo in Claude on the web (`claude.ai/code`) and start asking for changes.

Full walkthrough in [PROTOTYPING.md](./PROTOTYPING.md).

## Local dev (optional)

```bash
npm install
npm start    # http://localhost:4200
```
