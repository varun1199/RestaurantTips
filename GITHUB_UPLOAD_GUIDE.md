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
  
  **Detailed PAT Authentication Fix:**
  ```bash
  # First, check your current remote URL
  git remote -v
  
  # Clear any stored credentials that might be causing issues
  git config --global --unset credential.helper
  
  # Set up a new remote with your PAT embedded in the URL
  # (Replace USERNAME with your GitHub username and TOKEN with your PAT)
  git remote set-url origin https://USERNAME:TOKEN@github.com/varun1199/RestaurantTips.git
  
  # Verify the new remote URL
  git remote -v
  
  # Try pushing again
  git push -u origin main
  ```

- **For SSH Key users:**
  - Verify your SSH key is added to your GitHub account
  - Check that your SSH agent is running: `eval "$(ssh-agent -s)"`
  - Add your key to the SSH agent: `ssh-add ~/.ssh/id_ed25519`
  - Test your SSH connection: `ssh -T git@github.com`
  
  **Detailed SSH Authentication Fix:**
  ```bash
  # Start the SSH agent if it's not running
  eval "$(ssh-agent -s)"
  
  # Add your private key to the agent
  ssh-add ~/.ssh/id_ed25519
  
  # Test SSH connection to GitHub
  ssh -vT git@github.com
  
  # Change your remote to use SSH
  git remote set-url origin git@github.com:varun1199/RestaurantTips.git
  
  # Verify the new remote URL
  git remote -v
  
  # Try pushing again
  git push -u origin main
  ```

### Common Error Messages

1. **"Authentication failed for 'https://github.com/varun1199/RestaurantTips.git/'"**
   - Solution: Use a personal access token or SSH key as described above.
   - If you see "failed to authenticate with remote", try these steps:
     ```bash
     # Clear Git credential cache
     git config --global credential.helper cache
     git credential-cache exit
     
     # Try setting the URL with token credentials explicitly embedded
     git remote set-url origin https://USERNAME:TOKEN@github.com/varun1199/RestaurantTips.git
     ```

2. **"Permission denied (publickey)"**
   - Solution: Your SSH key is not properly set up. Follow the SSH key steps again.
   - Make sure your key exists and has the right permissions:
     ```bash
     # Verify key exists
     ls -la ~/.ssh/
     
     # Fix permissions if needed
     chmod 600 ~/.ssh/id_ed25519
     chmod 600 ~/.ssh/id_ed25519.pub
     ```

3. **"remote: Repository not found"** 
   - Solution: Verify the repository name and your access permissions. Make sure you're a collaborator on the repository.
   - Double-check the repository URL - remember that GitHub is case-sensitive:
     ```bash
     # Verify remote URL
     git remote -v
     
     # Update if necessary (exact case matters)
     git remote set-url origin https://github.com/varun1199/RestaurantTips.git
     ```

4. **"fatal: could not read from remote repository"**
   - Solution: Check your internet connection and firewall settings. Some networks block Git operations.
   - Try using a different network or connecting via a mobile hotspot
   - If on a corporate network, consult your IT department as they may block Git protocols
   - Test your connection to GitHub with:
     ```bash
     # For HTTPS connections
     git ls-remote https://github.com/varun1199/YetiTips.git
     
     # For SSH connections
     git ls-remote git@github.com:varun1199/YetiTips.git
     ```
     If these commands return a list of refs, your connection is working!

5. **"error: failed to push some refs to 'https://github.com/varun1199/RestaurantTips.git'"**
   - Solution: The remote repository has changes that you don't have locally.
     ```bash
     # Pull the remote changes first
     git pull --rebase origin main
     
     # Then try pushing again
     git push origin main
     ```

### Repository Name Change Issue

If you've renamed your project from "RestaurantTips" to "YetiTips" but are still trying to push to the old repository, you'll need to update your remote URL to point to the correct repository:

```bash
# For HTTPS (with PAT)
git remote set-url origin https://USERNAME:TOKEN@github.com/varun1199/YetiTips.git

# For SSH
git remote set-url origin git@github.com:varun1199/YetiTips.git
```

If you've created a new repository for YetiTips:

1. Create the new repository on GitHub without initializing it
2. Change your local repository's remote URL:
   ```bash
   git remote set-url origin https://github.com/varun1199/YetiTips.git
   ```
3. Push your code to the new repository:
   ```bash
   git push -u origin main
   ```

### Still Having Issues?

If you've tried all of the above and still can't push to GitHub:

1. Try using the GitHub Desktop application, which handles authentication automatically
2. Contact GitHub Support for assistance
3. Use the GitHub web interface to manually upload files as a temporary solution

## Alternative Upload Methods

### Method 1: GitHub Desktop
If command-line Git is giving you trouble, GitHub Desktop provides a user-friendly interface:

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Clone the repository or add your local repository
4. Commit and push changes through the UI

### Method 2: Manual ZIP Upload
If all else fails, you can upload files manually:

1. Create a ZIP file of your project directory
2. Go to your GitHub repository in a web browser
3. Click "Add file" > "Upload files"
4. Drag and drop your ZIP file or click to browse
5. Add a commit message and commit directly to the main branch

### Method 3: GitHub CLI
GitHub's official command-line tool can sometimes work when git doesn't:

1. Install GitHub CLI: [https://cli.github.com/](https://cli.github.com/)
2. Authenticate with: `gh auth login`
3. Navigate to your project directory
4. Create a new repository: `gh repo create`
5. Or push to existing: `gh repo push`