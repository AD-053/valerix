# GitHub Actions Configuration

This directory contains the CI/CD workflows for Valerix.

## 🔧 Quick Setup

### 1. Add GitHub Secret

The workflow needs your DigitalOcean API token:

1. Go to: `https://github.com/YOUR_USERNAME/valerix/settings/secrets/actions`
2. Click "New repository secret"
3. Add:
   - **Name:** `DIGITALOCEAN_ACCESS_TOKEN`
   - **Value:** Your DigitalOcean API token

See [`SETUP-SECRETS.md`](SETUP-SECRETS.md) for detailed instructions.

### 2. Configure Deployment

Edit [`.github/workflows/deploy.yml`](workflows/deploy.yml):

```yaml
env:
  ENABLE_DEPLOYMENT: false  # Set to 'true' when ready to deploy
```

**false** = Only build and push Docker images (FREE)
**true** = Build, push, AND deploy to Kubernetes (costs $48+/month)

## 🚀 What It Does

The workflow runs on every push to `main`:

### Always (FREE):
- ✅ Builds 3 Docker images
- ✅ Pushes to DigitalOcean Container Registry
- ✅ Validates builds work

### When `ENABLE_DEPLOYMENT: true`:
- 🚀 Deploys to Kubernetes cluster
- 🧪 Runs chaos tests
- 📊 Verifies deployment

## 📁 Files

- [`workflows/deploy.yml`](workflows/deploy.yml) - Main CI/CD pipeline
- [`SETUP-SECRETS.md`](SETUP-SECRETS.md) - Detailed secret setup guide

## 💡 Testing Without Deployment

You can test the build process without spending money on Kubernetes:

1. Keep `ENABLE_DEPLOYMENT: false`
2. Add the `DIGITALOCEAN_ACCESS_TOKEN` secret
3. Push to `main`
4. Check Actions tab - builds will run, deployment will skip

## 🎯 Before Hackathon Demo

1. Set `ENABLE_DEPLOYMENT: true`
2. Create Kubernetes cluster:
   ```bash
   doctl kubernetes cluster create valerix-prod \
     --region nyc1 \
     --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=2"
   ```
3. Push to trigger deployment
4. Wait 5-10 minutes for full deployment

## 🧹 After Hackathon

Delete the cluster to stop charges:
```bash
doctl kubernetes cluster delete valerix-prod
```

Registry is free (up to 500MB) - you can keep it!
