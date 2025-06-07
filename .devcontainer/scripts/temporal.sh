#!/bin/bash

# if aarch64
if [ "$(uname -m)" = "aarch64" ]; then
    curl -sSL "https://temporal.download/cli/archive/latest?platform=linux&arch=arm64" \
        | sudo tar -xz -C /usr/local/bin
fi

# if amd64 
if [ "$(uname -m)" = "x86_64" ]; then
    curl -sSL "https://temporal.download/cli/archive/latest?platform=linux&arch=amd64" \
        | sudo tar -xz -C /usr/local/bin
fi