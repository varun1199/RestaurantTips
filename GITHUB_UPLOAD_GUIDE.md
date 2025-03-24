# GitHub Upload Guide for Yeti Tips & Till

Follow these steps to upload your project to GitHub:

## 1. Initialize Git Repository (if not already done)

```bash
git init
```

## 2. Add Your Files

```bash
git add .
```

## 3. Make Your First Commit

```bash
git commit -m "Initial commit of Yeti Tips & Till project"
```

## 4. Create a New Repository on GitHub

1. Go to GitHub: https://github.com/
2. Log in to your account
3. Click on the "+" icon in the top right corner
4. Select "New repository"
5. Fill in the repository name (e.g., "yeti-tips-till")
6. Add a description (optional)
7. Choose visibility (Public or Private)
8. Click "Create repository"

## 5. Add GitHub Remote

GitHub will display commands to push your existing repository. Use the HTTPS or SSH URL provided:

```bash
# For HTTPS (recommended for beginners)
git remote add origin https://github.com/your-username/yeti-tips-till.git

# For SSH (if you have SSH keys set up)
git remote add origin git@github.com:your-username/yeti-tips-till.git
```

## 6. Push to GitHub

```bash
git push -u origin main
# or
git push -u origin master
# (depending on your default branch name)
```

## Authentication Issues

If you encounter the error "failed to authenticate with remote", try the following:

### Option 1: Use GitHub CLI for Authentication

1. Install GitHub CLI if not already installed:
   ```bash
   npm install -g @github/cli
   # or
   gh auth login
   ```
2. Follow the interactive prompts to authenticate

### Option 2: Use a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with appropriate permissions (repo, workflow)
3. Use this token when prompted for a password
4. Consider using a credential manager to save your token:
   ```bash
   git config --global credential.helper store
   ```

### Option 3: Set Up SSH Keys

1. Generate SSH keys if you don't have them:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add the SSH key to your GitHub account
3. Use SSH URL for the remote repository

## Additional Resources

- [GitHub Docs: Adding an existing project to GitHub](https://docs.github.com/en/github/importing-your-projects-to-github/importing-source-code-to-github/adding-an-existing-project-to-github-using-the-command-line)
- [GitHub Docs: Authentication](https://docs.github.com/en/github/authenticating-to-github)