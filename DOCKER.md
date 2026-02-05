# Docker – Node.js environment

Docker has specific installation instructions for each operating system. See the official docs: **https://docker.com/get-started/**

## Quick Node.js shell (verify versions)

```bash
# Pull the Node.js Docker image
docker pull node:24-alpine

# Start a shell in a Node container
docker run -it --rm --entrypoint sh node:24-alpine

# Inside the container, verify:
node -v   # e.g. v24.13.0
npm -v    # e.g. 11.6.2
```

To run pnpm inside that container, install it first: `npm i -g pnpm`, then you can run `pnpm install` etc. (changes are lost when you exit unless you use a volume.)

## Run DANA setup inside Docker (optional)

From repo root, mount the project and run setup inside the container so dependencies install on your machine:

```bash
docker run -it --rm -v "${PWD}:/app" -w /app node:24-alpine sh -c "npm i -g pnpm && pnpm install && pnpm shared:build && cd mobile && pnpm install"
```

- **Windows PowerShell:** Use `-v "${PWD}:/app"` or replace `${PWD}` with the full path to the repo, e.g. `-v "C:\Users\admin\Dana\DANA Native:/app"`.
- **Windows CMD:** Use `-v "%cd%:/app"` (or the full path).

After this, run the web app with `pnpm dev` and the mobile app with `cd mobile && npx expo start` **on your host** (where Node/pnpm are installed), or use Docker only for the install step above.
