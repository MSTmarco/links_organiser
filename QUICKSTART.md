# 🎯 Quick Start Guide

## Welcome to Research Paper Repository!

This app helps you organize research papers, articles, and books in one place with summaries and notes.

## 🚀 5-Minute Setup

### Step 1: Get Your Files
You have two options:
- **Option A**: Extract `paper-repository.zip`
- **Option B**: Use the `paper-repository/` folder directly

### Step 2: Open the App
Simply open `index.html` in your web browser. That's it!

### Step 3: Create an Account
1. Click "Sign Up"
2. Enter your email and password
3. Or use "Continue with Google"

### Step 4: Create Your First Folder
1. Click the "+" button next to "Folders"
2. Name it (e.g., "Machine Learning")
3. Pick an emoji icon (e.g., 🤖)
4. Click "Create"

### Step 5: Add Your First Paper
1. Click "+ New Paper"
2. Fill in:
   - **Title**: Name of the paper/article
   - **URL**: Link to the paper
   - **Folder**: Select the folder you created
   - **Summary**: Brief description (1-2 sentences)
   - **Notes**: Your thoughts, key findings, quotes
   - **Tags**: Keywords (comma-separated)
3. Click "Save"

## 🎉 You're Done!

Now you can:
- ✅ Click any paper card to view full details
- ✅ Search across all papers
- ✅ Edit or delete papers
- ✅ Organize with folders
- ✅ Access from any device (after deploying)

## 💡 Pro Tips

### For Better Organization:
- Create folders for different topics or projects
- Use clear, descriptive titles
- Write summaries immediately after reading
- Tag papers with multiple keywords

### For Better Searching:
- Use consistent tags (e.g., always "ML" not sometimes "machine-learning")
- Include author names in notes if relevant
- Add paper type tags: "review", "survey", "case-study"

### For Better Notes:
- Summarize in your own words
- Note page numbers for key sections
- Link related papers in notes
- Add questions or areas for further research

## 📱 Next Steps

### To Use on Multiple Devices:
1. Deploy to web (see DEPLOYMENT.md)
2. Your data syncs via Firebase
3. Login from any device

### To Backup Your Data:
```javascript
// Open browser console (F12) and run:
App.exportData()
```
Downloads a JSON file with all your papers and folders.

### To Import Data:
```javascript
// Open browser console (F12) and run:
App.importData()
```
Select your backup JSON file.

## 🆘 Need Help?

### App Not Working?
- Make sure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Safari)
- Check browser console (F12) for errors

### Can't Login?
- Check your internet connection
- Try "Forgot Password" if using email
- Use Google Sign-In as alternative

### Papers Not Saving?
- Check localStorage is enabled
- Try exporting and importing data
- Check Firebase connection in console

## 🎓 Example Use Case

Let's say you're researching "Neural Networks":

1. **Create folder**: 🧠 "Neural Networks"
2. **Add papers**:
   - Title: "Attention Is All You Need"
   - URL: arxiv.org/abs/1706.03762
   - Summary: "Introduces the Transformer architecture..."
   - Tags: transformers, attention, NLP
   - Notes: "Key innovation: self-attention mechanism..."

3. **Keep adding** related papers to build your knowledge base
4. **Search** when you need to reference something
5. **Share** by exporting data

## 🚀 Ready to Start!

Open `index.html` and start organizing your research! 📚

---

Questions? Check README.md for detailed documentation.
