# Development and Testing Guide

## Quick Testing Instructions

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this folder
4. The AP Classroom Assistant should appear in your extensions

### 2. Test Basic Functionality
1. **Session Management Test:**
   - Log in to https://collegeboard.org
   - Navigate to https://apstudents.collegeboard.org
   - Click the extension icon - should show "Session Active" status
   - Leave the tab open for 10+ minutes to test keep-alive

2. **Assignment Collection Test:**
   - Visit your AP Classrooms (need actual College Board account)
   - Navigate through different courses with assignments
   - Click extension icon to see if assignments are collected
   - Use refresh button to update data

### 3. Debug Mode
To see extension logs:
1. Go to `chrome://extensions/`
2. Click "Inspect views: background page" under the extension
3. Check Console tab for background script logs
4. On College Board pages, open DevTools > Console for content script logs

### 4. Manual Testing Checklist

#### Extension Installation
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon

#### Session Management  
- [ ] Shows "Session Active" when College Board tabs are open
- [ ] Shows "No Active Session" when no College Board tabs open
- [ ] Background script logs session keep-alive attempts every 10 minutes
- [ ] No logout occurs during extended inactivity (requires real testing over time)

#### Assignment Collection
- [ ] Content script runs on apstudents.collegeboard.org pages
- [ ] Assignments are detected and stored from AP Classroom pages
- [ ] Active assignments show in popup under "Active Assignments" tab
- [ ] Clicking assignment opens correct URL in new tab
- [ ] Refresh button updates assignment data

#### User Interface
- [ ] Popup opens with correct dimensions (400px width)
- [ ] Both tabs (Assignments/Classrooms) work properly
- [ ] Settings modal opens and saves preferences
- [ ] Empty state shows when no assignments found
- [ ] Loading state displays during data collection

#### Settings
- [ ] Settings modal opens from gear icon
- [ ] Settings persist after saving
- [ ] Keep-alive interval setting affects background script
- [ ] Auto keep-alive toggle works

## Development Tips

### Debugging Extension Issues

1. **Background Script Issues:**
   ```
   chrome://extensions/ > Inspect views: background page
   ```

2. **Content Script Issues:**
   - Open DevTools on College Board page
   - Check Console for errors
   - Verify script injection: `console.log('Content script loaded')`

3. **Popup Issues:**
   - Right-click extension icon > "Inspect popup"
   - Check for JavaScript errors in Console

### Testing Without College Board Account

Since this extension requires a real College Board account for full testing, you can:

1. **Test UI Components:** The popup interface works without being logged in
2. **Test Session Detection:** Opens any site, extension will show "No Active Session"  
3. **Mock Data Testing:** Modify content script to inject test assignment data

### Common Issues

1. **Extension Not Loading:**
   - Check manifest.json syntax
   - Verify all file paths exist
   - Check permissions in manifest

2. **Content Script Not Running:**
   - Verify URL patterns in manifest.json
   - Check if site uses CSP that blocks scripts
   - Make sure script runs after page load

3. **Background Script Errors:**
   - Check async/await usage
   - Verify API calls (chrome.tabs, chrome.storage, etc.)
   - Ensure proper error handling

### Performance Considerations

- Keep-alive runs every 10 minutes (configurable)
- Content script only runs on College Board domains
- Assignment data stored locally, not transmitted externally
- Background script sleeps when no College Board tabs are open

### Security Testing

1. Verify no credentials are stored
2. Check that only College Board domains are accessed
3. Confirm local storage is used (not external servers)
4. Test with different user accounts

### Release Checklist

Before publishing to Chrome Web Store:

- [ ] Test with real College Board account
- [ ] Verify session keep-alive works over extended periods
- [ ] Test assignment collection across multiple AP courses
- [ ] UI testing on different screen sizes
- [ ] Check all permissions are necessary and minimal
- [ ] Update version number in manifest.json
- [ ] Create extension screenshots for store listing
- [ ] Write store description and update README

## File Structure Reference

```
/
├── manifest.json          # Extension configuration and permissions
├── background.js          # Service worker for session management
├── content.js             # Extracts assignments from AP Classroom
├── popup.html             # Main popup interface
├── popup.css              # Styling for popup
├── popup.js               # Popup functionality and event handling
├── icons/                 # Extension icons (16, 32, 48, 128px)
├── .gitignore            # Git ignore patterns
└── README.md             # Main documentation
```

## Troubleshooting

### "Extension could not be loaded"
- Check manifest.json syntax with JSON validator
- Ensure all referenced files exist
- Verify icons directory and files

### "Cannot access contents of URL"
- Check host_permissions in manifest.json
- Ensure URLs match the patterns specified
- Try refreshing the extension

### Assignment data not appearing
- Check Console logs in background page and content script
- Verify you're on correct College Board URLs
- Make sure you've visited AP Classroom pages first
- Try the refresh button in popup

### Session not staying alive
- Check background script is running (inspect background page)
- Verify alarm is being created and triggered
- Ensure College Board tabs remain open
- Check browser doesn't put tabs to sleep