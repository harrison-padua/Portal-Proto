# Prototyping with Claude — A guide for BAs and designers

This is a step-by-step guide for spinning up a brand-new prototype from this template, asking Claude to build it, and seeing it live in your browser. You don't need to install anything on your computer.

---

## 1. Create your prototype repo

1. Go to this template repo on GitHub: **harrison-padua/prototype-template**.
2. Click the green **Use this template** button → **Create a new repository**.
3. Name your repo something descriptive — e.g. `customer-onboarding-prototype`. Keep it under the same `harrison-padua` org so it has the right MCP access.
4. Set it to **Public** (GitHub Pages on free tier requires public repos).
5. Click **Create repository**.

> One repo = one prototype. If you want to try a totally different idea, create a new repo from the template.

## 2. Turn on GitHub Pages

This is a one-time setup, and it has to be done by a human (Claude can't do it).

1. In your new repo, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**. (Not "Deploy from a branch".)
3. Go to **Settings** → **Environments**.
4. Click **github-pages** (it appears after the first deploy attempt — if you don't see it yet, skip ahead and come back).
5. Under **Deployment branches and tags**, make sure `main` is allowed.

## 3. Open Claude on the web

1. Go to **claude.ai/code**.
2. Connect your GitHub account if you haven't already.
3. Pick your new repo from the list.
4. You're now in a Claude session that can read and edit your repo.

> **Bookmark this URL.** This is your "design tool" from now on.

## 4. Brief Claude

In the chat, describe what you want to build. Be specific about:

- **What it is**: "a customer onboarding flow with three steps".
- **What's on each screen**: "step 1 is name + email, step 2 is company info, step 3 is a summary".
- **How it should feel**: "use the Padua UI components".
- **Mock data**: "use fake customers, no real backend".

Example brief:

> Build a task list app. Each task has a title, a priority (low/medium/high), and a done checkbox. Users can add new tasks and delete existing ones. Persist tasks in localStorage so they survive a refresh. Use the Padua UI Storybook for the component patterns.

Claude will look up the right Padua UI components, write the code, commit it, and push to `main`.

## 5. Wait for the deploy (~1–2 minutes)

Every push to `main` kicks off a GitHub Action that builds your app and publishes it to GitHub Pages.

- Watch progress in your repo's **Actions** tab.
- When it goes green, your prototype is live at:

  **`https://harrison-padua.github.io/<your-repo-name>/`**

- Bookmark that URL too. Refresh it whenever Claude pushes a change.

## 6. Iterate

Just keep talking to Claude:

- "Add a 'due date' field to each task."
- "Move the priority dropdown to the right of the title."
- "Use a softer color for completed tasks."
- "I don't like that — try it as a kanban board instead."

After each change, wait for the green check in **Actions**, then refresh your prototype URL.

---

## Common problems

### "My deploy is red in the Actions tab."
Click the failing run for the error. The most common causes:
- **`--base-href` mismatch**: the build path doesn't match your repo name. The workflow uses `${{ github.event.repository.name }}` so this should "just work", but if you renamed your repo mid-flight, re-run the workflow.
- **Pages source not set**: re-check Step 2.
- **Environment doesn't allow main**: Settings → Environments → github-pages → allow `main`.

### "My URL just shows a 404."
- Double-check the URL ends in a trailing slash: `…/<repo-name>/`, not `…/<repo-name>`.
- The first deploy can take a few minutes after the green check before Pages serves it.
- Make sure the repo is **Public**.

### "I refreshed and nothing changed."
- Hard-refresh: `Cmd/Ctrl + Shift + R`.
- Confirm the latest commit shows a green check in **Actions**.
- If the action is still running (yellow dot), give it another minute.

### "Claude installed `@paduafg/ng-component-lib` and now it's broken."
That package is private and CI can't authenticate. Tell Claude to remove it and use the daisyUI class patterns from the Padua Storybook MCP instead. (`CLAUDE.md` already tells it not to, but if it slips through, ask it to undo.)

### "Claude is working on a `claude/...` branch instead of `main`."
The deploy only runs on `main`. Ask Claude to merge the branch into `main` (it can do this via PR + merge), or to push directly to `main` if you've given it permission.

### "I want to start over with a new idea."
Create a new repo from the template. Don't reuse one prototype repo for a different prototype — the URL, code, and history will get tangled.

---

## What this template gives you

- A blank Angular 21 app with the Padua UI design language already set up.
- A working GitHub Actions deploy to GitHub Pages.
- A `CLAUDE.md` that tells Claude how to use the Padua Storybook MCP, what to avoid, and how to keep prototypes clean.
- This guide.

What it doesn't give you: any actual screens. That's your job — describe what you want and Claude will build it.
