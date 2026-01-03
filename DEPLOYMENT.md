# Vercel Deployment Guide

## Quick Deploy

Your project is now ready for Vercel deployment!

### Steps to Deploy:

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com)

2. **Sign In**: Use your GitHub account

3. **Import Project**:
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose `Penguindrum920/Pegasus`

4. **Configure Project**:
   - Vercel will auto-detect the Vite framework
   - Keep all default settings
   - Click "Deploy"

5. **Wait for Build** (~2-3 minutes)

6. **Your site is live!** 🎉

## What's Configured

✅ **vercel.json** - Proper routing for SPA
✅ **Build command** - `npm run build`
✅ **Output directory** - `dist`
✅ **Framework** - Vite auto-detected

## Post-Deployment

### Custom Domain (Optional)
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment Variables
Currently, no environment variables are needed for the basic deployment.

If you add SoundCloud API later:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_SOUNDCLOUD_CLIENT_ID`

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

### Audio Not Playing
- Audio requires user interaction (click to enter)
- Check browser console for errors
- Verify audio files are in `public/audio/`

### 404 on Routes
- The `vercel.json` handles SPA routing
- All routes should redirect to `index.html`

## Performance Optimization

Your build shows some chunks > 500KB. To optimize:

```javascript
// Add to vite.config.js
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'gsap': ['gsap'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  }
})
```

## Monitoring

After deployment:
- Monitor performance in Vercel Analytics
- Check Core Web Vitals
- Review function logs if needed

## Updates

To update the deployed site:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

---

**Repository**: https://github.com/Penguindrum920/Pegasus
**Status**: ✅ Ready for deployment
