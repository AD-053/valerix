# 🔐 Setting Up GitHub Secrets for Digital Ocean

## ❌ Current Error
```
Error: Input required and not supplied: token
```

This happens because the GitHub Action needs your **DigitalOcean API token** but it's not configured yet.

---

## 🔑 Step-by-Step Fix

### 1. Get Your DigitalOcean API Token

**Option A: Use Existing Token**
If you already have a token from when you ran `doctl auth init`:
```bash
# Check saved token
cat ~/.config/doctl/config.yaml | grep access-token
```

**Option B: Create New Token**
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click **"Generate New Token"**
3. Name it: `valerix-github-actions`
4. Scopes: **Read & Write**
5. Click **"Generate Token"**
6. **COPY IT NOW** (you can't see it again!)

---

### 2. Add Secret to GitHub Repository

1. **Go to your GitHub repo:**
   ```
   https://github.com/YOUR_USERNAME/valerix/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Add the secret:**
   - **Name:** `DIGITALOCEAN_ACCESS_TOKEN`
   - **Value:** Paste your token (looks like: `dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Click **"Add secret"**

4. **Verify it appears in the list** (value will be hidden)

---

### 3. Optional: Add More Secrets

For better security, you should also add:

#### Database Password
- **Name:** `DB_PASSWORD`
- **Value:** `valerix123` (or your chosen password)

#### Registry Name
- **Name:** `DO_REGISTRY_NAME`
- **Value:** `valerix` (your registry name)

#### Cluster Name
- **Name:** `DO_CLUSTER_NAME`
- **Value:** `valerix-prod` (your cluster name)

---

## ✅ Verify Setup

After adding the secret, push a commit to trigger the workflow:

```bash
cd /home/sakib/valerix

# Make a small change
echo "# GitHub Actions configured" >> .github/README.md
git add .github/README.md
git commit -m "Configure GitHub Actions secrets"
git push origin main
```

Then check the Actions tab:
```
https://github.com/YOUR_USERNAME/valerix/actions
```

---

## 🧪 Test Without Deployment

If you want to test the workflow **without actually deploying** (to save credits), you can temporarily disable the deploy job:

```yaml
jobs:
  build-and-push:
    # ... existing steps

  deploy:
    if: false  # ← Add this line to disable
    needs: build-and-push
    # ... rest of deploy job
```

---

## 🚨 Common Issues

### Issue 1: "Token is invalid"
**Solution:** The token might be expired or incorrect. Create a new one.

### Issue 2: "Registry not found"
**Solution:** Make sure you've created the registry first:
```bash
doctl registry create valerix --region nyc1
```

### Issue 3: "Cluster not found"
**Solution:** The workflow tries to deploy to a cluster. If you haven't created it yet:

**Option A:** Create the cluster:
```bash
doctl kubernetes cluster create valerix-prod \
  --region nyc1 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=2"
```

**Option B:** Disable deployment (see "Test Without Deployment" above)

### Issue 4: "Permission denied"
**Solution:** Make sure your token has **Write** permissions, not just Read.

---

## 📊 What the Workflow Does

Once configured, every push to `main` will:

1. ✅ Build 3 Docker images (order, inventory, frontend)
2. ✅ Push to DigitalOcean Container Registry
3. ✅ Deploy to Kubernetes cluster (if it exists)
4. ✅ Run chaos tests

---

## 💰 Cost Warning

**Be aware:**
- Kubernetes cluster: **~$48/month** ($0.066/hour × 2 nodes)
- Container Registry: **Free** (up to 500MB)
- Load Balancer: **~$12/month**

**To avoid charges while testing:**
1. Only enable deployment when you're ready for production
2. Delete the cluster after the hackathon:
   ```bash
   doctl kubernetes cluster delete valerix-prod
   ```

---

## 🎯 Quick Reference

| Secret Name | Where to Get It | Required? |
|-------------|-----------------|-----------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DigitalOcean → API → Tokens | ✅ Yes |
| `DB_PASSWORD` | Your choice | ⚠️ Recommended |
| `DO_REGISTRY_NAME` | Registry you created | ⚠️ Optional |
| `DO_CLUSTER_NAME` | Cluster you created | ⚠️ Optional |

---

## 🔐 Security Best Practices

1. **Never commit tokens to Git** ✅ (You're using secrets correctly)
2. **Use separate tokens** for different purposes
3. **Set token expiry** if DigitalOcean supports it
4. **Rotate tokens** after the hackathon
5. **Delete tokens** you're not using

---

## 📞 Still Having Issues?

Check the workflow logs:
```
GitHub → Your Repo → Actions → Click the failed workflow → Click failed job
```

The logs will show exactly which step failed and why.

---

## ✅ Success Indicators

When it works, you'll see:
- ✅ Green checkmarks in GitHub Actions
- ✅ New images in DigitalOcean Container Registry
- ✅ Pods restarted in Kubernetes (if deployed)

Good luck! 🚀
