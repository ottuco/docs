# GitHub Pages Setup Guide

This guide explains how to set up GitHub Pages for the Ottu documentation with branch-based deployments.

## Repository Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. This enables GitHub Actions to deploy to GitHub Pages

### 2. Repository Settings

Make sure your repository has the following settings:

- **Repository name**: `public-docs` (or update `projectName` in `docusaurus.config.ts`)
- **Visibility**: Public (required for GitHub Pages on free plans)
- **Actions**: Enabled (Settings → Actions → General)

## Configuration

### 1. Domain Configuration

Choose one of these options:

#### Option A: GitHub Pages subdomain (default)
- Site URL: `https://ottu.github.io/public-docs/`
- No changes needed to current configuration

#### Option B: Custom domain
Update `docusaurus.config.ts`:
```typescript
url: 'https://docs.ottu.com', // Your custom domain
baseUrl: '/', // Root path for custom domain
```

Then add a `CNAME` file to `/static/CNAME`:
```
docs.ottu.com
```

### 2. Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`:
   - Require pull request reviews
   - Require status checks (select the "build" check)
   - Require branches to be up to date

## Deployment Workflow

### Automatic Deployments

The GitHub Actions workflow (`/.github/workflows/deploy.yml`) handles:

1. **Main Branch** (`main`):
   - ✅ Builds documentation
   - ✅ Runs type checking
   - ✅ Deploys to GitHub Pages (production)
   - 🌐 Available at: `https://ottu.github.io/public-docs/`

2. **Development Branches** (`develop`, `staging`, etc.):
   - ✅ Builds documentation
   - ✅ Runs type checking
   - ❌ Does not deploy
   - 💬 Comments on PRs with build status

3. **Pull Requests**:
   - ✅ Builds documentation
   - ✅ Runs type checking
   - 💬 Comments with build status and local preview instructions

### Manual Deployment (if needed)

```bash
# Deploy current branch to gh-pages
npm run deploy

# Deploy with custom message
GIT_USER=<your-username> npm run deploy
```

## Branch Strategy

### Recommended Workflow

1. **main** → Production documentation
2. **develop** → Development/staging content
3. **feature/*** → Feature branches for new documentation

### Example Workflow

```bash
# Create feature branch
git checkout -b feature/api-updates

# Make changes
# ... edit documentation ...

# Commit and push
git add .
git commit -m "Add new API endpoints documentation"
git push origin feature/api-updates

# Create pull request
# GitHub Actions will build and comment on the PR

# After review, merge to main
# GitHub Actions will automatically deploy to production
```

## Local Development

### Preview Changes Locally

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm run serve
```

### Test GitHub Pages Build Locally

```bash
# Build with GitHub Pages configuration
npm run build

# Serve locally (simulates GitHub Pages)
npm run serve
```

## Troubleshooting

### Common Issues

#### 1. Deployment fails with "Resource not accessible by integration"
- Go to **Settings** → **Actions** → **General**
- Under "Workflow permissions", select "Read and write permissions"
- Save changes

#### 2. 404 errors on deployed site
- Check `baseUrl` in `docusaurus.config.ts`
- For `ottu.github.io/public-docs/`, use `baseUrl: '/public-docs/'`
- For custom domain, use `baseUrl: '/'`

#### 3. Build fails on type checking
- Run `npm run typecheck` locally to fix TypeScript errors
- Ensure all imports and file references are correct

#### 4. Custom domain not working
- Add `CNAME` file to `/static/CNAME` with your domain
- Configure DNS CNAME record: `docs.ottu.com` → `ottu.github.io`
- Update `url` and `baseUrl` in config

### Debug Build Issues

```bash
# Clear cache and rebuild
npm run clear
npm run build

# Check for broken links
npm run build 2>&1 | grep -i "broken"

# Verbose build output
DEBUG=* npm run build
```

## Security Considerations

### Branch Protection

- Require PR reviews for main branch
- Require status checks to pass
- Do not allow force pushes to main

### Secrets Management

No secrets are required for basic GitHub Pages deployment. The workflow uses:
- `GITHUB_TOKEN` (automatically provided)
- `github.token` (automatically provided)

### Content Security

- Review all documentation changes in PRs
- Use branch protection rules
- Monitor deployment logs for issues

## Monitoring

### Check Deployment Status

1. **Actions Tab**: View all workflow runs
2. **Environments**: See deployment history (Settings → Environments)
3. **Pages Settings**: View current deployment status

### Deployment URLs

- **Production**: https://ottu.github.io/public-docs/
- **Source Code**: https://github.com/ottu/public-docs
- **Actions**: https://github.com/ottu/public-docs/actions

## Next Steps

1. **Push to GitHub**: Upload this repository to GitHub
2. **Enable Pages**: Follow the repository setup steps above
3. **Test Deployment**: Push to main branch and verify deployment
4. **Custom Domain**: (Optional) Set up custom domain if desired
5. **Team Access**: Add team members as collaborators

---

For questions or issues, check the [GitHub Actions documentation](https://docs.github.com/en/actions) or [Docusaurus deployment guide](https://docusaurus.io/docs/deployment).