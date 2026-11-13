# Local development - setup from scratch

For anyone who wants to change the site itself: layout, styles, CMS
configuration, tools. **Editing texts, photos and reports needs none of
this** - that happens in the CMS in the browser (`/admin/`).

Everything the site needs (Hugo, Python, ImageMagick, cwebp, Ghostscript)
runs in a ready-made container, a "devcontainer". On your computer you
only install four things: **Git, Docker, VS Code and VS Code's Dev
Containers extension**. Works on Windows 10/11, macOS and Linux.

## 1. Install the tools (once)

### Windows 10/11
1. **WSL 2** (Docker needs it): open PowerShell *as administrator*, run
   `wsl --install`, restart the computer.
   Details: <https://learn.microsoft.com/en-us/windows/wsl/install>
2. **Docker Desktop**: <https://docs.docker.com/desktop/setup/install/windows-install/>
   - keep "Use WSL 2" selected during installation.
3. **Git for Windows**: <https://git-scm.com/downloads/> - the default
   options are fine.
4. **VS Code**: <https://code.visualstudio.com/download>

### macOS
1. **Docker Desktop**: <https://docs.docker.com/desktop/setup/install/mac-install/>
   - pick the download for your chip (Apple silicon or Intel: Apple menu
   -> About This Mac).
2. **Git**: open Terminal and run `git --version`. If Git is missing,
   macOS offers to install the "command line developer tools" - accept.
   Alternatives: <https://git-scm.com/downloads/>
3. **VS Code**: <https://code.visualstudio.com/download>

### Linux
1. **Docker Engine** for your distribution:
   <https://docs.docker.com/engine/install/>, then "Manage Docker as a
   non-root user" from <https://docs.docker.com/engine/install/linux-postinstall/>
   (log out and in again afterwards). Docker Desktop for Linux works too.
2. **Git** from your package manager, e.g. `sudo apt install git`.
3. **VS Code**: <https://code.visualstudio.com/download>

### All systems: the Dev Containers extension
Start VS Code, open the Extensions view (`Ctrl+Shift+X`, on macOS
`Cmd+Shift+X`), search for **Dev Containers** (by Microsoft), install.
<https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers>

### Check
Start Docker Desktop (Windows/macOS), then in a terminal:

    git --version
    docker run --rm hello-world

Both must work without errors. Background on devcontainers:
<https://code.visualstudio.com/docs/devcontainers/containers>

Licence note: Docker Desktop is free for personal use, education,
non-commercial open source and small organisations; larger companies need
a paid plan - <https://docs.docker.com/subscription-billing/desktop-license/>.
Docker Engine on Linux is free.

## 2. Git identity and GitHub access

- **Just looking / trying things locally:** no GitHub account needed, the
  repository is public.
- **To push changes:** a GitHub account with write access to
  `ne-o/zukunft-fuer-kinder` (ask the owner), and Git set up with your name
  and email: <https://docs.github.com/en/get-started/git-basics/set-up-git>.
  The repository is public and every commit shows its author's name and
  email - use GitHub's no-reply address instead of your private one:
  <https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address>
- Push access over SSH: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh>
  (or HTTPS - Git for Windows / VS Code then ask you to log in in the
  browser). The devcontainer takes over your computer's Git name, email
  and login automatically:
  <https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials>

## 3. Get the project and open it in the container

    git clone https://github.com/ne-o/zukunft-fuer-kinder.git

(or with SSH: `git clone git@github.com:ne-o/zukunft-fuer-kinder.git`)

In VS Code: **File -> Open Folder...** -> choose the `zukunft-fuer-kinder`
folder. VS Code notices the devcontainer and offers **"Reopen in
Container"** - click it. (Missed it? `F1` -> "Dev Containers: Reopen in
Container".)

The first start builds the container and takes a few minutes; later
starts take seconds. When the bottom-left corner of VS Code shows
"Dev Container: zukunft-fuer-kinder", you're inside. Terminals you open in
VS Code now (**Terminal -> New Terminal**) run in the container.

Windows: cloning into the WSL file system (in an Ubuntu/WSL terminal,
e.g. under `~/`) makes the container noticeably faster than a folder on
`C:\`. Step-by-step walkthrough with screenshots:
<https://code.visualstudio.com/docs/devcontainers/tutorial>

## 4. Preview the site

In a VS Code terminal (inside the container):

    hugo server --bind 0.0.0.0 --port 1314

Open <http://localhost:1314>. Changes to files show up in the browser by
themselves; `Ctrl+C` in the terminal stops the preview. If it ever shows
something older than the files, stop and start it again (README, "When
the preview needs a restart").

**CMS without GitHub:** open <http://localhost:1314/admin/> in Chrome or
Edge -> "Work with Local Repository" -> select the `zukunft-fuer-kinder`
folder on your computer. The CMS then edits the files directly instead of
committing; you review and commit the changes yourself.

## 5. Check, commit, publish

Before committing, build the site the way the server does and check all
links:

    hugo --gc --minify && python3 tools/check_links.py public

`0 broken internal references` = good. Then commit and push (VS Code's
Source Control view, `Ctrl+Shift+G`, or `git` in the terminal). Every push
to `main` publishes the site automatically - follow it in the repository's
**Actions** tab on GitHub (README, "Publishing").

How the site is built (content, layouts, settings, CMS): `README.md`.
Hugo's documentation: <https://gohugo.io/documentation/>, the CMS:
<https://github.com/sveltia/sveltia-cms>.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot connect to the Docker daemon" | Start Docker Desktop. Linux: did you do the non-root step and log in again? |
| No "Reopen in Container" offer | Is the Dev Containers extension installed? Did you open the project folder itself (the one containing `.devcontainer/`)? |
| Port 1314 already in use | Another preview is still running - stop it, or use `--port 1315` and open that address. |
| `.devcontainer/` was changed (e.g. a new Hugo version) | `F1` -> "Dev Containers: Rebuild Container". |
| Every file shows as modified (Windows) | Line endings: `git add --renormalize .` once; `.gitattributes` keeps them LF from then on. |
