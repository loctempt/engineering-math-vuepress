# Engineering Mathematics VuePress page

This repo is for deploying the VuePress page using vercel. Every commitment to main branch will trigger the CD action and update the deployed site.

## Setting up development environment

Follow this section to set up your development environment.

### Basic development tools

- git
  - Download git from [git official website](https://git-scm.com/)
- Node
  - Download node from [Node download page](https://nodejs.org/en/download) (find the green button reading "Windows Installer (.msi)")
- pnpm
  - After installing Node, use `npm install -g pnpm@latest-10` to install pnpm
  - Then use `pnpm config set registry https://registry.npmmirror.com` to make pnpm look for packages from a domestic mirror hosted by alibaba.

### Get and run the code

- Use `git clone git@github.com:loctempt/engineering-math-vuepress.git` to pull the repository;
- Then cd to the project directory using `cd engineering-math-vuepress`;
- Now run `pnpm i` to install dependencies;
- Finally, execute `pnpm run docs:dev` to run a dev server on your local machine. The server process will print one or more urls on your terminal. You can use them to access your website.

## Configure CDN for domestic browse

Vercel hosted sites are blocked by technical measures in our region. Therefore, we have to find alternative methods to let our users access the website without unnecessary effort.

To achieve this, we utilize CloudFlare's free CDN as a proxy to the vercel server.

## TODOs

- [ ] Add feature list
- [ ] Add project diagram
