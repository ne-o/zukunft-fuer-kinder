# Local development - setup from scratch

For anyone who wants to change the site itself: layout, styles, CMS
configuration, tools. **Editing texts, photos and reports needs none of
this** - that happens in the CMS in the browser (`/admin/`).

Everything the site needs (Hugo, Python, ImageMagick, cwebp, Ghostscript)
runs in a ready-made container, a "devcontainer" - as do an optional AI
assistant (opencode) and a browser it can drive (step 6). On your computer you
only install four things: **Git, Docker, VS Code and VS Code's Dev
Containers extension**. Works on Windows 10/11, macOS and Linux.

## 1. Install the tools (once)

### Windows 10/11
1. **WSL 2** (Docker needs it, you won't use it directly): open
   PowerShell *as administrator*, run `wsl --install --no-distribution`,
   restart the computer.
   Details: <https://learn.microsoft.com/en-us/windows/wsl/install>
2. **Docker Desktop**: <https://docs.docker.com/desktop/setup/install/windows-install/>
   - keep "Use WSL 2" selected during installation.
3. **Git for Windows**: <https://git-scm.com/downloads/> - the default
   options are fine.
4. **VS Code**: <https://code.visualstudio.com/download>

**Shortcut:** steps 1-4 in one go with `winget`, Windows' built-in
package manager. Right-click the Start button -> "Terminal (Admin)", then:

    wsl --install --no-distribution
    winget install -e --source winget --id Docker.DockerDesktop
    winget install -e --source winget --id Git.Git
    winget install -e --source winget --id Microsoft.VisualStudioCode

(`--source winget` skips the Microsoft Store source, which can fail on a
fresh Windows with "server certificate did not match".) Restart the
computer afterwards. `winget` missing? Install "App Installer"
from the Microsoft Store:
<https://learn.microsoft.com/en-us/windows/package-manager/winget/>

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

Or in a terminal (Windows: open a *new* one after installing VS Code, so
it finds the `code` command; macOS: first run "Shell Command: Install
'code' command in PATH" from VS Code's `F1` menu):

    code --install-extension ms-vscode-remote.remote-containers

The extensions used inside the container are installed automatically.

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
  `ne-o/zukunft-fuer-kinder` (ask the owner), and Git set up with a name
  and email. **Both become public** with every commit (the repository is
  public), so use your GitHub user name and GitHub's no-reply address,
  not your real name or private email. On
  <https://github.com/settings/emails> tick "Keep my email addresses
  private" (shows the no-reply address, e.g.
  `12345678+username@users.noreply.github.com`) and "Block command line
  pushes that expose my email" (GitHub then refuses a push that contains
  your private address). Then, in a terminal:

      git config --global user.name "username"
      git config --global user.email "12345678+username@users.noreply.github.com"

  Background: <https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address>
- Push access over SSH: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh>
  (or HTTPS - Git for Windows / VS Code then ask you to log in in the
  browser). The devcontainer takes over your computer's Git name, email
  and login automatically:
  <https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials>

## 3. Get the project and open it in the container

Open a terminal, create a folder for your projects, download the project
into it and open it in VS Code.

**Windows:** right-click the Start button -> "Terminal" (Windows 10:
"Windows PowerShell"). The project ends up in
`C:\Users\<you>\projects\zukunft-fuer-kinder`:

    cd ~
    mkdir -Force projects
    cd projects
    git clone https://github.com/ne-o/zukunft-fuer-kinder.git
    cd zukunft-fuer-kinder
    code .

**macOS:** the **Terminal** app. **Linux:** any terminal:

    mkdir -p ~/projects && cd ~/projects
    git clone https://github.com/ne-o/zukunft-fuer-kinder.git
    cd zukunft-fuer-kinder
    code .

(Push access over SSH: clone `git@github.com:ne-o/zukunft-fuer-kinder.git`
instead.) Next time, only `cd ~/projects/zukunft-fuer-kinder` and
`code .` are needed - or VS Code's **File -> Open Recent**.

VS Code notices the devcontainer and offers **"Reopen in Container"** -
click it. (Missed it? `F1` -> "Dev Containers: Reopen in Container".)

The first start builds the container and takes a few minutes; later
starts take seconds. When the bottom-left corner of VS Code shows
"Dev Container: zukunft-fuer-kinder", you're inside. Terminals you open in
VS Code now (**Terminal -> New Terminal**) run in the container.

Step-by-step walkthrough with screenshots:
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

## 6. Optional: AI assistant (opencode) and the shared browser

The container also has **opencode**, an AI coding assistant for the
terminal, and a **browser** that you and opencode use together - opencode
can open the preview, click through pages and take screenshots while you
watch. Neither is needed to work on the site.

**opencode:** starts by itself in a terminal when the project opens in
the container. The first time, VS Code asks whether to allow "automatic
tasks" for this folder - **Allow** starts opencode now and on every
later start, **Disallow** never (change it later: `F1` -> "Tasks: Manage
Automatic Tasks"). Closed it? `F1` -> "Tasks: Run Task" -> "opencode",
or run `opencode` in any VS Code terminal. The first time, log
in to an AI provider: `opencode auth login` (or `/connect` inside
opencode) - some models work without an account, many need one from the
provider (often paid). Login, settings and past sessions are kept in
Docker volumes, so they survive "Rebuild Container". Documentation:
<https://opencode.ai/docs/>, providers: <https://opencode.ai/docs/providers/>.

**The browser:** it runs inside the container, and you see it as a page in
your normal browser:
<http://localhost:6080/vnc.html?autoconnect=1&resize=scale> - you can
click and type there as usual. opencode starts it by itself when it
starts; to start it yourself or open an address in a new tab:

    browser http://localhost:1314

(start the preview from step 4 first). Its logins and history are gone
after "Rebuild Container". It runs without Chromium's security sandbox
(Docker doesn't allow it), so only visit trusted sites with it.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot connect to the Docker daemon" | Start Docker Desktop. Linux: did you do the non-root step and log in again? |
| No "Reopen in Container" offer | Is the Dev Containers extension installed? Did you open the project folder itself (the one containing `.devcontainer/`)? |
| Port 1314 already in use | Another preview is still running - stop it, or use `--port 1315` and open that address. |
| `.devcontainer/` was changed (e.g. a new Hugo version) | `F1` -> "Dev Containers: Rebuild Container". |
| Preview doesn't update when you save a file (seen on Windows/macOS) | Changes on your computer's disk don't always reach the container as events. Start the preview with polling: `hugo server --bind 0.0.0.0 --port 1314 --poll 700ms`. |
| Browser page at port 6080 doesn't load | The browser isn't running yet: run `browser` in a VS Code terminal (or start opencode), then reload. Logs: `~/.cache/browser/` in the container. |
| Every file shows as modified (Windows) | Line endings: `git add --renormalize .` once; `.gitattributes` keeps them LF from then on. |
