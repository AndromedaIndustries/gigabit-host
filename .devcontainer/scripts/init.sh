#!/bin/bash
# This script is used to setup the container after it has been created.
set -e

echo "Installing Homebrew"
# Install homebrew
bash .devcontainer/scripts/brew.sh

echo "Installing Supabase"
# Setup supabase
bash .devcontainer/scripts/supabase.sh

echo "Initalizing PNPM"
# Install pnpm items
bash .devcontainer/scripts/pnpm.sh

echo "Installing temporal"
# Install temporal 
bash .devcontainer/scripts/temporal.sh