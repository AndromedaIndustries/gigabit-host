#!/bin/bash

# Self-Upgrade
pnpm self-update

# Install
pnpm install

# Create autocompletion
pnpm completion fish > ~/.config/fish/completions/pnpm.fish

# Enable pnpm global package installation
pnpm setup

export PNPM_HOME="/home/vscode/.local/share/pnpm"

# Fish
printf "\nset -gx PNPM_HOME $PNPM_HOME\n" >> ~/.config/fish/config.fish
printf "\nfish_add_path --prepend --path \"$PNPM_HOME\"\n" >> ~/.config/fish/config.fish