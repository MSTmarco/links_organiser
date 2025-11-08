# 🚀 Deployment Guide - Research Paper Repository

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files from `paper-repository/` folder
3. Go to Settings → Pages
4. Select "Deploy from main branch"
5. Your app will be live at: `https://yourusername.github.io/repo-name`

### Option 2: Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `paper-repository` folder
3. Done! Your site is live instantly
4. Optional: Connect to GitHub for automatic deployments

### Option 3: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub or upload directly
3. Deploy with one click
4. Automatic HTTPS and CDN

### Option 4: Firebase Hosting
Since you're already using Firebase, you can host there too!

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
cd paper-repository
firebase init hosting

# Deploy
firebase deploy
```

## 📱 Local Testing

Simply open `index.html` in your browser. The app works offline with localStorage!

## 🔐 Firebase Configuration

The app is already configured with your existing Firebase project:
- **Project**: journal-74ede
- **Authentication**: Enabled (Email/Password + Google)
- **Database**: Realtime Database

No additional Firebase setup needed! Just deploy and start using.

## 🌐 Custom Domain (Optional)

All hosting providers above support custom domains:
1. Buy a domain (e.g., from Namecheap, Google Domains)
2. Add CNAME record pointing to your host
3. Enable HTTPS (usually automatic)

## ✅ Deployment Checklist

Before deploying:
- [x] Firebase config is set up
- [x] All files are included
- [x] Test locally first
- [ ] Choose hosting provider
- [ ] Deploy
- [ ] Test authentication
- [ ] Start adding papers!

## 🔄 Updates

To update your deployed app:
1. Make changes locally
2. Test in browser
3. Push to GitHub (if using GitHub Pages/Vercel)
4. Or drag-drop to Netlify
5. Changes go live automatically

## 🆘 Troubleshooting

**Authentication not working?**
- Check Firebase Console → Authentication is enabled
- Verify email/password and Google providers are enabled

**Papers not syncing?**
- Check Firebase Console → Realtime Database is created
- Verify Database Rules allow authenticated users to read/write

**App not loading?**
- Check browser console for errors
- Ensure all files uploaded correctly
- Try hard refresh (Ctrl+Shift+R)

## 🎉 You're Ready!

Your research paper repository is ready to deploy. Choose a hosting option above and start organizing your papers!
