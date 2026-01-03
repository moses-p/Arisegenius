# Nginx Configuration Setup Guide

## 📋 Files Created

1. **nginx.conf** - Main configuration (HTTP, with HTTPS commented)
2. **nginx-production.conf** - Full production setup with SSL
3. **nginx-dev.conf** - Development configuration (no SSL)

## 🚀 Quick Setup

### For Development (Local)

1. **Copy configuration:**
   ```bash
   sudo cp nginx-dev.conf /etc/nginx/sites-available/arisegenius
   sudo ln -s /etc/nginx/sites-available/arisegenius /etc/nginx/sites-enabled/
   ```

2. **Update paths in configuration:**
   - Edit `/etc/nginx/sites-available/arisegenius`
   - Update `root` path to your frontend directory
   - Example: `root /var/www/arisegenius/frontend;`

3. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

4. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

### For Production

1. **Copy production configuration:**
   ```bash
   sudo cp nginx-production.conf /etc/nginx/sites-available/arisegenius
   sudo ln -s /etc/nginx/sites-available/arisegenius /etc/nginx/sites-enabled/
   ```

2. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d arisegenius.com -d www.arisegenius.com
   ```

3. **Update paths:**
   - Frontend: `/var/www/arisegenius/frontend`
   - Backend: Running on `localhost:5000`

4. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 📁 Directory Structure

```
/var/www/arisegenius/
├── frontend/          # Frontend static files
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── ...
└── backend/           # Backend (runs separately on port 5000)
```

## 🔧 Configuration Details

### Features Included:

✅ **SPA Routing** - All routes serve index.html  
✅ **API Proxy** - `/api` routes to backend  
✅ **Gzip Compression** - Optimized file delivery  
✅ **Caching** - Static assets cached for 1 year  
✅ **Rate Limiting** - API protection  
✅ **Security Headers** - XSS, CSRF protection  
✅ **SSL/HTTPS** - Production ready  
✅ **WebSocket Support** - For real-time features  

### Key Locations:

- **Frontend**: `/` → Serves static files
- **API**: `/api/*` → Proxies to `localhost:5000`
- **Health**: `/health` → Backend health check
- **Docs**: `/api-docs` → API documentation

## 🛠️ Customization

### Update Domain:
Replace `arisegenius.com` with your domain in the config files.

### Update Paths:
```nginx
root /var/www/arisegenius/frontend;  # Update this path
```

### Update Backend Port:
```nginx
upstream backend {
    server localhost:5000;  # Change if backend uses different port
}
```

## ✅ Verification

After setup, test:

1. **Frontend**: `http://your-domain/` or `http://localhost/`
2. **API**: `http://your-domain/api/v1/health`
3. **Docs**: `http://your-domain/api-docs`

## 🆘 Troubleshooting

**Check nginx status:**
```bash
sudo systemctl status nginx
```

**Check logs:**
```bash
sudo tail -f /var/log/nginx/arisegenius_error.log
```

**Test configuration:**
```bash
sudo nginx -t
```

**Reload nginx:**
```bash
sudo systemctl reload nginx
```

