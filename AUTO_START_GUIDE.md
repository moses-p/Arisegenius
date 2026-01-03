# Arisegenius Auto-Start Guide

This guide explains how to configure Arisegenius containers to start automatically.

## Current Configuration

All containers are already configured with `restart: unless-stopped`, which means:
- ✅ Containers will automatically restart if they crash
- ✅ Containers will automatically start when Docker Desktop restarts
- ⚠️ Containers will NOT start if Docker Desktop is not running

## Option 1: Auto-Start with Docker Desktop (Recommended)

### Windows

1. **Enable Docker Desktop to start on boot:**
   - Open Docker Desktop
   - Go to Settings → General
   - Check "Start Docker Desktop when you log in"
   - Click "Apply & Restart"

2. **Configure containers to auto-start:**
   - The containers are already configured with `restart: unless-stopped`
   - When Docker Desktop starts, run: `docker-compose up -d`

### Using Windows Task Scheduler (Advanced)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Start Arisegenius"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `powershell.exe`
7. Arguments: `-File "D:\Arisegenius\Arisegenius\start-arisegenius.ps1"`
8. Check "Run with highest privileges"

## Option 2: Manual Start Script

Run the provided script whenever you want to start services:

```powershell
.\start-arisegenius.ps1
```

## Option 3: Docker Desktop Compose Integration

Docker Desktop can automatically start compose projects:

1. Open Docker Desktop
2. Go to Settings → Resources → Advanced
3. Enable "Start containers on Docker Desktop startup"

## Verify Auto-Start

To verify containers are running:

```powershell
docker-compose ps
```

All containers should show status "Up" with restart policy "unless-stopped".

## Troubleshooting

### Containers not starting automatically

1. **Check Docker Desktop is running:**
   ```powershell
   docker info
   ```

2. **Check container restart policies:**
   ```powershell
   docker inspect <container-name> | Select-String -Pattern "RestartPolicy"
   ```

3. **Manually start containers:**
   ```powershell
   docker-compose up -d
   ```

### Docker Desktop not starting on boot

- Check Windows Startup programs
- Verify Docker Desktop is set to start on login
- Check Windows Services for Docker Desktop service

## Current Restart Policies

All services use `restart: unless-stopped`:
- ✅ `postgres` - Auto-restarts
- ✅ `redis` - Auto-restarts  
- ✅ `backend` - Auto-restarts
- ✅ `frontend` - Auto-restarts

This means containers will:
- Restart automatically if they crash
- Start when Docker Desktop restarts
- NOT start if manually stopped with `docker stop`
- Start automatically when Docker Desktop starts (if configured)

