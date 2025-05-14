#!/bin/bash
# Path to the virtual environment directory
VENV_DIR="$(pwd)/.venv"

# Check if the virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Error: Virtual environment not found at $VENV_DIR"
    python -m venv $VENV_DIR
fi

# Activate the virtual environment
# disable=SC1091
. "$VENV_DIR/bin/activate" 

pip install -r requirements.txt 1> /dev/null

# Run the Python program and pass any arguments given to the script
python3 "$@"

# Optional: deactivate the virtual environment after running the script
deactivate