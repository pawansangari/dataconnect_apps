# Installing Node.js on macOS

## Option 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node

# Verify installation
node --version
npm --version
```

## Option 2: Using Official Installer

1. Visit: https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Verify: `node --version && npm --version`

## Option 3: Using nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.zshrc

# Install Node.js
nvm install node
nvm use node

# Verify
node --version
npm --version
```

## After Installation

Once Node.js is installed, run the deployment again:
```bash
cd /Users/pawanpreet.sangari/dataconnect_apps/my_project/react-database-app
./deploy.sh cms-npi-app dev
```

