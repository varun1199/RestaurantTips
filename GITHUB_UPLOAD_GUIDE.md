# GitHub Upload Guide

## Setting up GitHub Authentication

GitHub no longer allows password authentication for Git operations. You have two options:

### Option 1: Personal Access Token (Recommended)

1. Create a Personal Access Token (PAT) on GitHub:
   - Go to [GitHub Settings](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Select "Generate new token (classic)"
   - Give your token a descriptive name (e.g., "Replit YetiTips")
   - Set expiration as needed
   - Select scopes: at minimum, check "repo" for full repository access
   - Click "Generate token"
   - **IMPORTANT**: Copy your token immediately - it won't be shown again!

2. Configure Git to use your token:
   ```bash
   git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/varun1199/RestaurantTips.git
   ```
   Replace YOUR_USERNAME with your GitHub username and YOUR_TOKEN with the token you generated.

3. Push your changes:
   ```bash
   git push -u origin main
   ```

### Option 2: SSH Keys (Alternative)

1. Generate an SSH key pair:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add the SSH key to GitHub:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to [GitHub SSH Keys](https://github.com/settings/ssh/new)
   - Paste your key and save

3. Change your remote URL to use SSH:
   ```bash
   git remote set-url origin git@github.com:varun1199/RestaurantTips.git
   ```

4. Push your changes:
   ```bash
   git push -u origin main
   ```

## Troubleshooting

If you receive a "failed to authenticate" error:
- Double-check that your token has the correct permissions
- Ensure you've formatted the remote URL correctly
- Try regenerating your token or SSH key