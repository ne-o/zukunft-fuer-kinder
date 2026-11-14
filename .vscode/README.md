# .vscode

Empty on purpose. Inside the devcontainer, `.devcontainer/vscode/` is
mounted here (see `mounts` in `.devcontainer/devcontainer.json`), so its
settings - e.g. the task that starts opencode - apply only in the
container. Put VS Code settings for the container there, not here.
