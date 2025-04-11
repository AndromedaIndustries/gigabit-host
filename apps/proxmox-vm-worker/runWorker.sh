#!/bin/bash
# Path to the virtual environment directory
VENV_DIR="/home/xn4p4lm/projects/andromeda/gigabit-host/apps/proxmox-vm-worker/.venv"

# Check if the virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Error: Virtual environment not found at $VENV_DIR"
    exit 1
fi

# Activate the virtual environment
# disable=SC1091
. "$VENV_DIR/bin/activate" 

pip install -r requirements.txt 1> /dev/null

# Run the Python program and pass any arguments given to the script
python3.10 "$@"

# Optional: deactivate the virtual environment after running the script
deactivate