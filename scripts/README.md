# Version Management Scripts

This directory contains scripts for automatic version management in QUANTFOLIO.

## Overview

The version management system automatically increments the patch version (1.0.0 → 1.0.1) whenever you push code to a remote repository.

## Files

- `update_version.py` - Python script that increments version and updates all relevant files
- `install_git_hook.sh` - Bash script to install git hook (Linux/Mac)
- `install_git_hook.ps1` - PowerShell script to install git hook (Windows)
- `install_git_hook.bat` - Batch script to install git hook (Windows)

## Installation

### Windows (PowerShell)
```powershell
cd scripts
.\install_git_hook.ps1
```

### Windows (Command Prompt)
```cmd
cd scripts
install_git_hook.bat
```

### Linux/Mac
```bash
cd scripts
chmod +x install_git_hook.sh
./install_git_hook.sh
```

## How It Works

1. When you run `git push`, the pre-push hook is triggered
2. The hook runs `update_version.py` which:
   - Reads the current version from `VERSION` file
   - Increments the patch version (1.0.0 → 1.0.1)
   - Updates `VERSION` file
   - Updates `frontend/package.json`
   - Updates `backend/main.py`
3. The version changes are automatically staged and committed

## Manual Version Update

To manually update the version, run:

```bash
python scripts/update_version.py
```

Or on Windows:
```cmd
python scripts\update_version.py
```

## Current Version

The current version is stored in the `VERSION` file at the project root.

