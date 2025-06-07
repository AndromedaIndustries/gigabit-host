#!/bin/bash



# Install Homebrew
/bin/bash -c "NONINTERACTIVE=1 $(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to the PATH
printf "\nfish_add_path --prepend --path \"/home/linuxbrew/.linuxbrew/bin\"\n" >> ~/.config/fish/config.fish
