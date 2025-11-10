# Engineering Mathematics VuePress page

This repo is for deploying the VuePress page using vercel. Every commitment to main branch will trigger the CD action and update the deployed site.

## Setting up development environment

Follow this section to set up your development environment.

### Basic development tools

- git
  - Download git from [the official Git website](https://git-scm.com/)
- Node
  - Download node from [Node download page](https://nodejs.org/en/download) (find the green button labeled "Windows Installer (.msi)")
- pnpm
  - After installing Node, use `npm install -g pnpm@latest-10` to install pnpm
  - Then use `pnpm config set registry https://registry.npmmirror.com` to configure pnpm to use packages from a domestic mirror hosted by alibaba.

### Get and run the code

- Run `git clone git@github.com:loctempt/engineering-math-vuepress.git` to pull the repository;
- Then cd to the project directory using `cd engineering-math-vuepress`;
- Now run `pnpm i` to install dependencies;
- Finally, execute `pnpm run docs:dev` to run a dev server on your local machine. The server process will print one or more urls on your terminal. You can use them to access your website.

## Configure CDN for domestic browse

Vercel hosted sites are blocked by technical measures in our region. Therefore, we have to find alternative methods to let our users access the website without unnecessary effort.

To achieve this, we utilize CloudFlare's free CDN as a proxy to the vercel server.

## Coding conventoins

We recomand you use Visual Studio Code as your editor. The following settings are based on Visual Studio Code.

- Git commit
  - Install `redjue.git-commit-plugin` plugin, which will enforce the [Angular Team Commit Specification](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines) for you when you edit a commit message.
- Code format
  - Install `Wscats.vue` plugin and let it handle code formatting for you.
- Naming convention
  - Use pascal case for filename and identifiers (e.g., `FunctionOne.vue`, `const showButton;`)

## Collaboration

### 🛡️ Collaboration & Branching Rules

The `main` branch is **protected**, so you **cannot push to it directly**. All changes must go through **code review** via pull/merge requests.

#### ✅ Branching Workflow

1. **Always create a feature or fix branch** from the latest `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b <your-meaningful-branch-name>
   ```

2. **Name your branch clearly and descriptively**, using one of the following prefixes:
   - `feat/` – for new features (e.g., `feat/user-authentication`)
   - `fix/` – for bug fixes (e.g., `fix/login-button-alignment`)
   - `refactor/` – for code improvements without behavior change (e.g., `refactor/api-client`)
   - `docs/` – for documentation updates (e.g., `docs/update-readme`)
   - `chore/` – for maintenance tasks (e.g., `chore/upgrade-dependencies`)

   > 🔹 Use **kebab-case** (lowercase with hyphens).  
   > ❌ Avoid generic names like `patch-1`, `update`, or `my-work`.

3. **Keep branches small and focused**—one branch per logical change or issue.

#### 🔄 Pull/Merge Requests (PRs/MRs)

- Open a **pull request (PR)** (GitHub) or **merge request (MR)** (GitLab) **before merging**.
- Target the `main` branch.
- Assign at least **one reviewer**.
- Ensure **all CI checks pass** (linting, tests, build).
- **Squash and merge** unless a detailed history is needed (team decision).
- Delete the branch after merging.

#### 🧹 Commit & Code Quality

- Write **clear, concise commit messages** (e.g., `fix: prevent null pointer in user store`).
- Run `npm run lint` and `npm run format` before pushing.
- Keep your branch **up to date** with `main` if the PR takes time (rebase or merge).

#### 🚫 Never

- Force-push to shared branches.
- Merge your own PR without approval (unless emergency + team agreement).
- Commit secrets, build artifacts, or unrelated changes.

## TODOs

- [ ] Add feature list
- [ ] Add project diagram
