// Background Service Worker for AP Classroom Assistant
// Handles session management and keep-alive functionality

chrome.runtime.onInstalled.addListener(() => {
  console.log('AP Classroom Assistant installed');
  
  // Set up periodic session refresh alarm
  chrome.alarms.create('sessionKeepAlive', {
    delayInMinutes: 1,
    periodInMinutes: 10 // Check every 10 minutes
  });
});

// Handle alarm for session keep-alive
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sessionKeepAlive') {
    keepSessionAlive();
  }
});

// Function to keep College Board session alive
async function keepSessionAlive() {
  try {
    // Check if user has any College Board tabs open
    const tabs = await chrome.tabs.query({
      url: ["https://apstudents.collegeboard.org/*", "https://collegeboard.org/*", "https://*.collegeboard.org/*"]
    });
    
    if (tabs.length > 0) {
      console.log('Keeping College Board session alive...');
      
      // Execute a lightweight request to maintain session
      for (const tab of tabs) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              // Strategy 1: Try to send a lightweight keepalive request
              fetch('/api/keepalive', { 
                method: 'HEAD',
                credentials: 'include'
              }).catch(() => {
                // Strategy 2: Load favicon to maintain session
                const img = new Image();
                img.src = '/favicon.ico?' + Date.now();
              });
              
              // Strategy 3: Simulate subtle user activity
              // This creates a minimal DOM interaction to signal activity
              document.body.dispatchEvent(new Event('mousemove', { bubbles: false }));
              
              // Strategy 4: Touch localStorage to indicate activity
              try {
                const timestamp = Date.now();
                localStorage.setItem('ap_extension_keepalive', timestamp.toString());
                
                // Clean up old timestamp after a moment
                setTimeout(() => {
                  try {
                    localStorage.removeItem('ap_extension_keepalive');
                  } catch (e) {
                    // Ignore cleanup errors
                  }
                }, 5000);
              } catch (e) {
                // localStorage might be restricted, ignore
              }
            }
          });
        } catch (error) {
          // Tab might not be ready or accessible
          console.log('Could not execute script in tab:', tab.id, error);
        }
      }
    } else {
      console.log('No College Board tabs found for session keep-alive');
    }
  } catch (error) {
    console.error('Error in session keep-alive:', error);
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAssignments') {
    // Store assignments data
    chrome.storage.local.set({ 'assignments': request.data }, () => {
      sendResponse({ success: true });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'keepAlive') {
    keepSessionAlive();
    sendResponse({ success: true });
  }
  
  if (request.action === 'getStoredAssignments') {
    chrome.storage.local.get(['assignments'], (result) => {
      sendResponse({ assignments: result.assignments || [] });
    });
    return true; // Will respond asynchronously
  }
});

// Monitor for College Board domain visits to enhance session management
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const collegeBoardDomains = [
      'collegeboard.org',
      'apstudents.collegeboard.org'
    ];
    
    const isCollegeBoardSite = collegeBoardDomains.some(domain => 
      tab.url.includes(domain)
    );
    
    if (isCollegeBoardSite) {
      console.log('College Board site detected, monitoring session...');
      // Reset alarm to ensure fresh keep-alive cycle
      chrome.alarms.create('sessionKeepAlive', {
        delayInMinutes: 1,
        periodInMinutes: 10
      });
    }
  }
});