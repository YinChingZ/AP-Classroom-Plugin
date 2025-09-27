# AP Classroom Assistant

A Chrome browser extension designed to enhance the AP Classroom experience for students using College Board's AP Classroom platform.

## 🎯 Features

### 1. Session Keep-Alive
- **Automatic Login Maintenance**: Prevents automatic logout from College Board due to inactivity
- **Background Session Management**: Uses a service worker to periodically maintain your login session
- **Configurable Intervals**: Customize how often the extension checks and refreshes your session

### 2. Assignment Direct Navigation
- **Cross-Classroom Collection**: Automatically gathers active assignments from all your AP Classrooms
- **Unified Assignment View**: View all active assignments in one convenient popup interface  
- **Quick Access**: Click any assignment to jump directly to the assignment page
- **Real-time Updates**: Refresh assignment data with the click of a button

## 🚀 Installation

### Option 1: Load as Unpacked Extension (Development)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The AP Classroom Assistant icon will appear in your toolbar

### Option 2: Chrome Web Store (Coming Soon)
*Extension will be submitted to Chrome Web Store after testing*

## 📖 Usage

### Initial Setup
1. **Install the extension** using one of the methods above
2. **Log in to College Board** at https://collegeboard.org
3. **Visit AP Classroom** at https://apstudents.collegeboard.org
4. **Navigate through your classrooms** to let the extension collect your course data

### Daily Usage
1. **Click the extension icon** in your Chrome toolbar
2. **View active assignments** from all your AP Classrooms in one place
3. **Click any assignment** to open it directly
4. **Use the refresh button** to update assignment data
5. **Switch to Classrooms tab** to navigate to specific courses

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension format
- **Service Worker Background**: Handles session management
- **Content Scripts**: Extracts assignment data from AP Classroom pages
- **Modern UI**: Clean, responsive popup interface

### Files Structure
```
/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script for data extraction
├── popup.html            # Popup interface HTML
├── popup.css             # Modern CSS styling
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Permissions Used
- `activeTab`: Access current tab for data extraction
- `storage`: Store assignment and settings data
- `tabs`: Create new tabs for navigation
- `cookies`: Maintain session state
- `alarms`: Schedule periodic session refresh
- `host_permissions`: Access College Board domains

## ⚙️ Settings

Access settings by clicking the gear icon in the popup:

- **Auto Keep-Alive**: Toggle automatic session maintenance
- **Keep-Alive Interval**: Set how often to refresh session (5-30 minutes)
- **Assignment Notifications**: Enable/disable new assignment alerts

## 🔒 Privacy & Security

### Security Measures
- **No Credential Storage**: Extension never stores your login credentials
- **Local Data Only**: Assignment data is stored locally on your device
- **Minimal Permissions**: Only requests necessary permissions for functionality
- **No External Servers**: All processing happens locally in your browser

### Data Handling
- Assignment titles, due dates, and URLs are stored locally
- Session management uses existing browser cookies
- No personal information is transmitted to external servers
- Data is automatically cleared when extension is uninstalled

## 🧪 Development

### Prerequisites
- Chrome/Chromium browser
- Basic understanding of web development (HTML, CSS, JavaScript)

### Local Development
1. Clone the repository
2. Make changes to the source files
3. Go to `chrome://extensions/`
4. Click "Reload" button for the extension to test changes
5. Test in College Board environment

### Testing
1. Log in to College Board
2. Visit multiple AP Classrooms
3. Verify assignments are collected correctly
4. Test session keep-alive functionality
5. Ensure popup interface works properly

## 📝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with College Board
5. Submit a pull request

## ⚠️ Disclaimer

This extension is **not officially affiliated with College Board**. It is an independent tool created to improve the student experience with AP Classroom.

- Use responsibly and in accordance with your school's technology policies
- The extension works by interacting with College Board's web interface
- Functionality may change if College Board updates their platform
- Always ensure you're following your institution's academic integrity guidelines

## 🆘 Support

### Common Issues
- **No assignments showing**: Make sure you're logged in to College Board and have visited your AP Classrooms
- **Session not staying alive**: Check that the extension has proper permissions and settings are enabled
- **Extension not loading**: Ensure you're using Chrome/Chromium and have Developer Mode enabled

### Getting Help
- Check the browser console for error messages
- Verify you're on supported College Board URLs
- Try refreshing assignment data using the refresh button
- Reinstall the extension if issues persist

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎓 About

Created to help AP students navigate their coursework more efficiently by providing quick access to assignments and maintaining session continuity with College Board's platform.