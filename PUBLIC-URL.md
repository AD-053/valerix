# 🌐 Valerix - PUBLIC ACCESS

## ✅ YOUR APP IS LIVE!

**Public URL (accessible anywhere):**
```
https://thou-angels-let-descending.trycloudflare.com
```

This URL is accessible from:
- ✅ Any browser worldwide
- ✅ Your mobile phone
- ✅ Judges' laptops
- ✅ Anyone you share it with

---

## 🚀 What's Running

**Kubernetes (Digital Ocean):**
- ✅ Frontend: 2 replicas
- ✅ Order Service: 2 replicas
- ✅ Inventory Service: 2 replicas
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Prometheus monitoring
- ✅ Grafana dashboards

**Local Tunnel:**
- ✅ Port-forward: localhost:8080 → Frontend Service
- ✅ Cloudflare Tunnel: Public URL → localhost:8080

---

## 📊 Access Points

| Service | URL | Access |
|---------|-----|--------|
| **Public App** | https://thou-angels-let-descending.trycloudflare.com | 🌐 Internet |
| Frontend (K8s) | `kubectl port-forward -n valerix svc/frontend 8080:3000` | 🔒 Local |
| Grafana (K8s) | `kubectl port-forward -n valerix svc/grafana 3100:3000` | 🔒 Local |
| Order API (K8s) | http://order-service.valerix.svc.cluster.local:3001 | 🔒 Cluster |
| Inventory API (K8s) | http://inventory-service.valerix.svc.cluster.local:3002 | 🔒 Cluster |

---

## ⚡ Keep It Running

**IMPORTANT:** The tunnel is running in your terminal. To keep it alive:

### Option 1: Keep Terminal Open
Just leave the current terminal window open. Don't close it!

### Option 2: Run in Screen/Tmux
```bash
# Install screen
sudo apt install screen -y

# Start screen session
screen -S valerix-tunnel

# Start services (inside screen)
kubectl port-forward -n valerix svc/frontend 8080:3000 &
cloudflared tunnel --url http://localhost:8080

# Detach: Press Ctrl+A then D
# Reattach later: screen -r valerix-tunnel
```

### Option 3: Run as System Service
```bash
# Create systemd service file
sudo tee /etc/systemd/system/valerix-tunnel.service > /dev/null <<'EOF'
[Unit]
Description=Valerix Cloudflare Tunnel
After=network.target

[Service]
User=sakib
WorkingDirectory=/home/sakib/valerix
ExecStartPre=/snap/bin/kubectl port-forward -n valerix svc/frontend 8080:3000
ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable valerix-tunnel
sudo systemctl start valerix-tunnel

# Check status
sudo systemctl status valerix-tunnel
```

---

## 🔄 Restart Tunnel (if needed)

If the tunnel stops or you need a new URL:

```bash
# Kill existing processes
pkill -f "cloudflared tunnel"
pkill -f "port-forward.*frontend"

# Start port-forward
kubectl port-forward -n valerix svc/frontend 8080:3000 > /dev/null 2>&1 &

# Start tunnel (wait 3 seconds)
sleep 3

# Start Cloudflare tunnel (will show new URL)
cloudflared tunnel --url http://localhost:8080
```

The new URL will be displayed in the output.

---

## 🎯 For Demo/Production

### Permanent URL (Free - Recommended)

**1. Get a Free Domain:**
- freenom.com (free .tk/.ml domains)
- noip.com (free subdomains)

**2. Point to Digital Ocean Load Balancer:**
```bash
# Your load balancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
# Use the EXTERNAL-IP: 129.212.198.73
```

Add DNS A record:
```
Type: A
Name: @
Value: 129.212.198.73
```

**3. Update Ingress:**
```bash
# Edit k8s/ingress.yaml
# Change: valerix.example.com → your-domain.com
kubectl apply -f k8s/ingress.yaml
```

---

## 🏆 For BUET Fest Demo

**Before Demo:**
1. ✅ Keep tunnel running
2. ✅ Test URL: https://thou-angels-let-descending.trycloudflare.com
3. ✅ Share URL with judges
4. ✅ Open in mobile to show it's live

**During Demo:**
- Show: "Our app is deployed on Digital Ocean Kubernetes"
- Show: Public URL accessible from anywhere
- Show: Kubernetes pods running (`kubectl get pods -n valerix`)
- Show: Monitoring dashboard (port-forward Grafana)
- Show: Chaos engineering working on live deployment

**Backup:**
If tunnel fails, use port-forward + your laptop as demo machine

---

## ✅ Verification

**Test your public URL:**
```bash
curl https://thou-angels-let-descending.trycloudflare.com
```

**Check tunnel status:**
```bash
ps aux | grep cloudflared
```

**Check port-forward:**
```bash
ps aux | grep "port-forward.*frontend"
```

**Test local:**
```bash
curl http://localhost:8080
```

---

## 📱 Share Your App

Send this to anyone:
```
🚀 Check out Valerix - a production-ready microservices e-commerce platform!

Live Demo: https://thou-angels-let-descending.trycloudflare.com

Features:
✅ Microservices architecture on Kubernetes
✅ Chaos engineering built-in
✅ Real-time monitoring
✅ CI/CD with GitHub Actions
✅ Deployed on Digital Ocean

Try it now!
```

---

## 🎉 SUCCESS!

Your app is **LIVE** and accessible from anywhere in the world!

**What you've accomplished:**
1. ✅ Built microservices architecture
2. ✅ Deployed to Kubernetes (Digital Ocean)
3. ✅ CI/CD pipeline working
4. ✅ Monitoring with Prometheus + Grafana
5. ✅ Chaos engineering implemented
6. ✅ **PUBLIC URL LIVE ON INTERNET** 🌐

**You're ready for the hackathon! 🏆**
