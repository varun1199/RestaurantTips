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

### Authentication Errors

If you receive a "failed to authenticate" error:

- **For Personal Access Token (PAT) users:**
  - Verify your token hasn't expired (GitHub tokens can expire)
  - Ensure your token has the "repo" scope permission
  - Check that your remote URL is formatted correctly with your username and token
  - Try regenerating a new token and updating your remote URL

- **For SSH Key users:**
  - Verify your SSH key is added to your GitHub account
  - Check that your SSH agent is running: `eval "$(ssh-agent -s)"`
  - Add your key to the SSH agent: `ssh-add ~/.ssh/id_ed25519`
  - Test your SSH connection: `ssh -T git@github.com`

### Common Error Messages

1. **"Authentication failed for 'https://github.com/varun1199/RestaurantTips.git/'"**
   - Solution: Use a personal access token or SSH key as described above.

2. **"Permission denied (publickey)"**
   - Solution: Your SSH key is not properly set up. Follow the SSH key steps again.

3. **"remote: Repository not found"** 
   - Solution: Verify the repository name and your access permissions. Make sure you're a collaborator on the repository.

4. **"fatal: could not read from remote repository"**
   - Solution: Check your internet connection and firewall settings. Some networks block Git operations.

### Still Having Issues?

If you've tried all of the above and still can't push to GitHub:

1. Try using the GitHub Desktop application, which handles authentication automatically
2. Contact GitHub Support for assistance
3. Use the GitHub web interface to manually upload files as a temporary solution