# Docker Build and Push Guide

## Prerequisites

1. **Docker Desktop must be running**
   - Start Docker Desktop on Windows
   - Wait until Docker is fully initialized (whale icon in system tray)

2. **Docker Hub Account**
   - You need a Docker Hub account to push images
   - Get your Docker Hub username

## Quick Start

### Option 1: Using PowerShell Script (Windows)

```powershell
# Set your Docker Hub credentials (optional - script will prompt if not set)
$env:DOCKER_USERNAME = "your-dockerhub-username"
$env:DOCKER_PASSWORD = "your-dockerhub-password"  # Optional - will prompt if not set

# Run the build and push script
.\build-and-push.ps1
```

### Option 2: Manual Steps

1. **Login to Docker Hub:**
   ```powershell
   docker login
   ```
   Enter your Docker Hub username and password when prompted.

2. **Build Backend Image:**
   ```powershell
   cd backend
   docker build -t arisegenius-backend:latest .
   cd ..
   ```

3. **Build Frontend Image:**
   ```powershell
   cd frontend
   docker build -t arisegenius-frontend:latest .
   cd ..
   ```

4. **Tag Images for Docker Hub:**
   ```powershell
   docker tag arisegenius-backend:latest YOUR_DOCKERHUB_USERNAME/arisegenius-backend:latest
   docker tag arisegenius-frontend:latest YOUR_DOCKERHUB_USERNAME/arisegenius-frontend:latest
   ```

5. **Push Images:**
   ```powershell
   docker push YOUR_DOCKERHUB_USERNAME/arisegenius-backend:latest
   docker push YOUR_DOCKERHUB_USERNAME/arisegenius-frontend:latest
   ```

## Build Status

✅ **Backend build completed** - `npm run build` succeeded
✅ **Frontend build completed** - `npm run build` succeeded
⚠️ **Docker build pending** - Requires Docker Desktop to be running

## Troubleshooting

### Docker Daemon Not Running

**Error:** `failed to connect to the docker API`

**Solution:**
1. Open Docker Desktop
2. Wait for Docker to fully start (check system tray icon)
3. Verify with: `docker info`

### Docker Login Issues

**Error:** `unauthorized: authentication required`

**Solution:**
1. Make sure you're logged in: `docker login`
2. Check your credentials are correct
3. For automated login, set environment variables:
   ```powershell
   $env:DOCKER_USERNAME = "your-username"
   $env:DOCKER_PASSWORD = "your-password"
   ```

### Build Failures

**Backend Build Issues:**
- Ensure `npm run build` completed successfully
- Check that `dist/` folder exists in backend directory
- Verify all dependencies are installed: `npm install`

**Frontend Build Issues:**
- Frontend is static HTML/CSS/JS, no build step required
- Ensure all files are present in frontend directory

## Image Names

The build script uses the following naming convention:
- Backend: `YOUR_DOCKERHUB_USERNAME/arisegenius-backend:latest`
- Frontend: `YOUR_DOCKERHUB_USERNAME/arisegenius-frontend:latest`

You can customize the username by setting the `DOCKER_USERNAME` environment variable.

## Next Steps

1. **Start Docker Desktop** if not already running
2. **Login to Docker Hub:** `docker login`
3. **Run the build script:** `.\build-and-push.ps1`
4. **Verify images:** `docker images | grep arisegenius`

## Notes

- The build scripts automatically handle Docker login if credentials are provided
- Images are tagged with both `:latest` and `:VERSION` tags
- All builds are tested before pushing to ensure quality

