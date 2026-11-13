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
    && sed -i 's/^# *\(en_US.UTF-8\)/\1/; s/^# *\(de_DE.UTF-8\)/\1/' /etc/locale.gen && locale-gen \
    && rm -rf /var/lib/apt/lists/*

RUN set -eu; arch="${TARGETARCH:-amd64}"; cd /tmp; \
    base="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}"; \
    tgz="hugo_extended_${HUGO_VERSION}_linux-${arch}.tar.gz"; \
    curl -fsSLO "$base/$tgz"; curl -fsSLO "$base/hugo_${HUGO_VERSION}_checksums.txt"; \
    grep " ${tgz}\$" "hugo_${HUGO_VERSION}_checksums.txt" | sha256sum -c -; \
    tar -xzf "$tgz" -C /usr/local/bin hugo; rm -f /tmp/hugo*; hugo version

# The Ubuntu image ships a default "ubuntu" user with uid 1000 - replace it.
RUN if id ubuntu >/dev/null 2>&1; then userdel -r ubuntu; fi \
    && groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME

ENV LANG=en_US.UTF-8
USER $USERNAME
