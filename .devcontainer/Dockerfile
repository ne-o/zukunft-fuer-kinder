# Dev environment for zukunft-fuer-kinder.net: everything needed to build,
# preview and check the site. Editors never need this - they use the CMS
# in the browser.
# Ubuntu LTS (supported until 2031) - interim releases drop out of support
# after 9 months and then stop building.
FROM ubuntu:26.04

# Hugo extended (SCSS, WebP image processing). Must equal .hugo-version in
# the repo root (the GitHub Actions workflow checks that).
ARG HUGO_VERSION=0.169.0
ARG TARGETARCH

ARG USERNAME=user
ARG USER_UID=1000
ARG USER_GID=1000

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates curl wget git git-lfs openssh-client sudo locales less \
        gh \
        python3 \
        imagemagick webp ghostscript jq \
        ripgrep \
        nodejs npm \
        xvfb x11vnc novnc python3-websockify procps \
        libnss3 libnspr4 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 \
        libxkbcommon0 libxcomposite1 libasound2t64 libcairo2 libpango-1.0-0 \
        fonts-dejavu-core fonts-liberation fonts-noto-color-emoji \
    && sed -i 's/^# *\(en_US.UTF-8\)/\1/; s/^# *\(de_DE.UTF-8\)/\1/' /etc/locale.gen && locale-gen \
    && rm -rf /var/lib/apt/lists/*

RUN set -eu; arch="${TARGETARCH:-amd64}"; cd /tmp; \
    base="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}"; \
    tgz="hugo_extended_${HUGO_VERSION}_linux-${arch}.tar.gz"; \
    curl -fsSLO "$base/$tgz"; curl -fsSLO "$base/hugo_${HUGO_VERSION}_checksums.txt"; \
    grep " ${tgz}\$" "hugo_${HUGO_VERSION}_checksums.txt" | sha256sum -c -; \
    tar -xzf "$tgz" -C /usr/local/bin hugo; rm -f /tmp/hugo*; hugo version

# opencode (AI coding agent, terminal UI): `opencode` in the VS Code
# terminal. Single binary from GitHub releases, pinned with its sha256
# (release page lists the digests). Uses ripgrep from apt instead of
# downloading its own.
ARG OPENCODE_VERSION=1.19.5
ARG OPENCODE_SHA256_AMD64=588310a336fa3b9df36b3f0225b26f679d453efaad0cf3d66c3651ef3ec1647a
ARG OPENCODE_SHA256_ARM64=fae5be262d693b7c5e562856cc473e59e741772936db0c0600ac0d5ed5bd088b
RUN set -eu; arch="${TARGETARCH:-amd64}"; cd /tmp; \
    case "$arch" in \
      amd64) a=x64;   sum="$OPENCODE_SHA256_AMD64" ;; \
      arm64) a=arm64; sum="$OPENCODE_SHA256_ARM64" ;; \
      *) echo "no opencode build for $arch" >&2; exit 1 ;; \
    esac; \
    tgz="opencode-linux-${a}.tar.gz"; \
    curl -fsSLO "https://github.com/anomalyco/opencode/releases/download/v${OPENCODE_VERSION}/$tgz"; \
    echo "$sum  $tgz" | sha256sum -c -; \
    tar -xzf "$tgz" -C /usr/local/bin opencode; rm -f "$tgz"; opencode --version

# Browser for you and opencode (`browser`, `browser-mcp`, opencode.json):
# Playwright MCP server (pinned) + the Chromium build of the Playwright it
# depends on, in /opt (not the home directory). Chromium's libraries are
# installed by hand: Playwright's `install-deps` doesn't know every Ubuntu
# release.
ARG PLAYWRIGHT_MCP_VERSION=0.0.84
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright
RUN npm install -g --no-fund --no-audit "@playwright/mcp@${PLAYWRIGHT_MCP_VERSION}" \
    && node "$(npm root -g)/@playwright/mcp/node_modules/playwright/cli.js" install --no-shell chromium \
    && chmod -R a+rX "$PLAYWRIGHT_BROWSERS_PATH"
COPY --chmod=0755 browser browser-mcp /usr/local/bin/
# opencode reads this config in addition to its own: registers the MCP server
COPY opencode.json /etc/opencode/opencode.json
ENV OPENCODE_CONFIG=/etc/opencode/opencode.json

# The Ubuntu image ships a default "ubuntu" user with uid 1000 - replace it.
RUN if id ubuntu >/dev/null 2>&1; then userdel -r ubuntu; fi \
    && groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME

ENV LANG=en_US.UTF-8
USER $USERNAME

# opencode's login (auth.json), sessions and settings live in volumes (see
# devcontainer.json) so they survive rebuilds. Created here so the volumes
# start out owned by the user, not root.
RUN mkdir -p /home/$USERNAME/.local/share/opencode /home/$USERNAME/.config/opencode
