# 📚 Research Paper Repository

A clean, organized web app for managing research papers, articles, and academic resources. Built with Firebase authentication and cloud sync.

## ✨ Features

### 📁 **Folder Organization**
- Create custom folders for different topics (e.g., Machine Learning, Biology, Philosophy)
- Emoji icons for visual organization
- Easy folder management with rename/delete options
- Papers automatically organized by folder

### 📄 **Paper Management**
- **Add papers** with essential information:
  - Title
  - URL/Link to the paper
  - Short summary
  - Detailed notes
  - Tags for categorization
- **Search functionality** - Find papers by title, summary, notes, or tags
- **Quick view** - Click any paper card to see full details
- **Edit/Delete** - Manage your papers easily

### 🔐 **Authentication & Sync**
- Firebase authentication (Email/Password or Google Sign-In)
- Cloud synchronization across devices
- Secure user data storage
- Offline support with localStorage

### 🎨 **Clean UI**
- Modern, responsive design
- Works on desktop, tablet, and mobile
- Easy-to-use interface
- Visual paper cards with summaries

## 🚀 Getting Started

### Quick Start:

1. Open `index.html` in your browser
2. Sign up or log in with your email or Google account
3. Create folders to organize your papers
4. Click "+ New Paper" to add your first research paper
5. Start building your research library!

## 📊 Data Structure

### Paper Object:
```javascript
{
  id: "unique-id",
  title: "Paper Title",
  url: "https://...",
  folderId: "folder-id or null",
  summary: "Brief summary of the paper",
  notes: "Your detailed notes and thoughts",
  tags: ["tag1", "tag2"],
  createdAt: "ISO date string",
  updatedAt: "ISO date string"
}
```

### Folder Object:
```javascript
{
  id: "unique-id",
  name: "Folder Name",
  icon: "📊",
  createdAt: "ISO date string"
}
```

## 🏗️ Project Structure

```
paper-repository/
├── index.html              # Main entry point
├── css/
│   ├── main.css           # Base styles & layout
│   ├── auth.css           # Authentication styles
│   ├── papers.css         # Paper cards & grid
│   └── modal.css          # Modal dialogs
├── js/
│   ├── app.js             # Main orchestrator & auth
│   ├── storage.js         # Data persistence & sync
│   ├── papers.js          # Paper CRUD operations
│   ├── folders.js         # Folder management
│   └── firebase-config.js # Firebase configuration
└── README.md
```

## 🎯 Use Cases

### For Researchers:
- Track papers you're reading
- Organize by research topic
- Save key findings and notes
- Quick reference to paper URLs

### For Students:
- Build a library of course readings
- Organize by subject or assignment
- Take notes on key concepts
- Tag papers for easy retrieval

### For Professionals:
- Keep track of industry publications
- Organize by project or client
- Share links with team (export feature)
- Build a knowledge repository

## 💡 Tips & Tricks

### Organizing Papers:
1. **Use folders wisely** - Create folders for major topics or projects
2. **Write good summaries** - Include the main finding or thesis
3. **Use tags** - Add multiple tags for cross-referencing
4. **Add notes immediately** - Capture your thoughts while fresh

### Search Tips:
- Search works across titles, summaries, notes, and tags
- Clear search to return to folder view
- Use specific keywords for better results

### Folder Management:
- Right-click folders to rename or delete
- Choose meaningful emoji icons
- Papers without folders go to "All Papers"

## 🔧 Advanced Features

### Export/Import Data:
```javascript
// Export all papers and folders
App.exportData();

// Import from JSON file
App.importData();
```

### Cloud Sync:
- Data automatically syncs to Firebase when you make changes
- Login from any device to access your papers
- Works offline - syncs when connection restored

## 🔒 Privacy & Security

- **Firebase Authentication** - Secure login with industry standards
- **Per-user data** - Your papers are only accessible by you
- **No tracking** - We don't track your usage or reading habits
- **Export anytime** - Download all your data as JSON

## 🚧 Future Enhancements

Ideas for future versions:
- [ ] PDF preview/reader integration
- [ ] Automatic paper metadata extraction from DOI
- [ ] Citation generation (BibTeX, APA, etc.)
- [ ] Collaboration features (share folders)
- [ ] Browser extension for quick saves
- [ ] Mobile app
- [ ] Dark mode
- [ ] Advanced filtering (by date, author, etc.)
- [ ] AI-powered summaries
- [ ] Reading progress tracking

## 🛠️ Development

### Technologies Used:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Authentication + Realtime Database)
- **Storage**: localStorage + Firebase sync
- **Architecture**: Modular, SOLID principles

### Adding New Features:

Each module has a clear responsibility:
- `storage.js` - Data operations
- `papers.js` - Paper UI and logic
- `folders.js` - Folder UI and logic
- `app.js` - Orchestration and auth

## 📄 License

Free to use, modify, and share. No attribution required.

## 🤝 Contributing

This is a personal tool, but feel free to fork and customize for your needs!

---

**Made with 📚 for better research organization**
