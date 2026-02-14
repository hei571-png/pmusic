# PMusic - GitHub Actions APK Build Setup

## Quick Setup (5 minutes)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `pmusic` (or any name you prefer)
3. Set to **Public** (required for free GitHub Actions)
4. Click **Create repository**

### Step 2: Push Your Code
Run these commands in PowerShell (in your project folder):

```powershell
cd "c:\Users\ADMIN\Downloads\ytmusic web"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/pmusic.git

# Push to GitHub
git push -u origin master
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Get Your APK
1. Go to your GitHub repository
2. Click **Actions** tab at the top
3. Wait for the workflow to complete (takes ~5-10 minutes)
4. Click on the completed workflow run
5. Scroll down to **Artifacts** section
6. Download `pmusic-apk` artifact
7. Unzip it - your APK is inside!

## Installing on Android

1. Enable **Unknown Sources**: Settings → Security → Allow unknown sources
2. Transfer APK to your phone
3. Tap to install

## Rebuilding (After Code Changes)

If you make changes and want a new APK:

```powershell
cd "c:\Users\ADMIN\Downloads\ytmusic web"
git add -A
git commit -m "Your changes description"
git push
```

Then go to GitHub Actions again to download the new APK.

## Troubleshooting

### Git push fails with authentication error
- Use GitHub Desktop instead: https://desktop.github.com/
- Or create a Personal Access Token: GitHub Settings → Developer settings → Personal access tokens

### Workflow fails
- Check the Actions tab for error details
- Common issues: missing files in repository

### APK won't install
- Make sure "Unknown Sources" is enabled
- Try the signed APK artifact if available

## What This Builds

✅ Material 3 UI with dynamic themes
✅ Full-screen player with blur background
✅ Sleep timer & live lyrics
✅ Download for offline playback
✅ Audio effects (tempo, pitch, skip silence)
✅ No login required - all local storage

## Need Help?

Check the main documentation: `BUILD_INSTRUCTIONS.md`
