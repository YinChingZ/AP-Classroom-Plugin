// Popup JavaScript for AP Classroom Assistant

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the popup
  initializePopup();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadAssignments();
  updateSessionStatus();
});

// Initialize popup components
function initializePopup() {
  updateLastUpdateTime();
  
  // Set up tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active tab content
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${targetTab}-tab`).classList.add('active');
      
      // Load data for the selected tab
      if (targetTab === 'assignments') {
        loadAssignments();
      } else if (targetTab === 'classrooms') {
        loadClassrooms();
      }
    });
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', refreshData);
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', showSettings);
  
  // Visit classroom button
  document.getElementById('visitClassroomBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://apstudents.collegeboard.org/' });
    window.close();
  });
  
  // Settings modal
  document.getElementById('closeSettings').addEventListener('click', hideSettings);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Help and About buttons
  document.getElementById('helpBtn').addEventListener('click', showHelp);
  document.getElementById('aboutBtn').addEventListener('click', showAbout);
}

// Load assignments from storage or content script
async function loadAssignments() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const assignmentsList = document.getElementById('assignmentsList');
  
  // Show loading state
  loadingState.style.display = 'flex';
  emptyState.style.display = 'none';
  assignmentsList.style.display = 'none';
  
  try {
    // First try to get stored assignments
    const result = await chrome.runtime.sendMessage({ action: 'getStoredAssignments' });
    let assignments = result.assignments || [];
    
    // If no stored assignments, try to refresh from current tab
    if (assignments.length === 0) {
      await refreshAssignmentsFromCurrentTab();
      const newResult = await chrome.runtime.sendMessage({ action: 'getStoredAssignments' });
      assignments = newResult.assignments || [];
    }
    
    // Filter for active assignments only
    const activeAssignments = assignments.filter(assignment => 
      assignment.status === 'active' || assignment.status === 'Active'
    );
    
    displayAssignments(activeAssignments);
    updateLastUpdateTime();
    
  } catch (error) {
    console.error('Error loading assignments:', error);
    showEmptyState();
  } finally {
    loadingState.style.display = 'none';
  }
}

// Display assignments in the UI
function displayAssignments(assignments) {
  const assignmentsList = document.getElementById('assignmentsList');
  const emptyState = document.getElementById('emptyState');
  
  if (!assignments || assignments.length === 0) {
    showEmptyState();
    return;
  }
  
  // Generate HTML for assignments
  const assignmentsHTML = assignments.map(assignment => `
    <div class="assignment-card" data-url="${assignment.url}">
      <div class="assignment-header">
        <div class="assignment-title">${escapeHtml(assignment.title)}</div>
      </div>
      <div class="assignment-classroom">${escapeHtml(assignment.classroom)}</div>
      <div class="assignment-meta">
        <div class="due-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${escapeHtml(assignment.dueDate)}
        </div>
        <div class="status-badge status-${assignment.status.toLowerCase()}">
          ${assignment.status}
        </div>
      </div>
    </div>
  `).join('');
  
  assignmentsList.innerHTML = assignmentsHTML;
  
  // Add click listeners to assignment cards
  const assignmentCards = assignmentsList.querySelectorAll('.assignment-card');
  assignmentCards.forEach(card => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-url');
      if (url) {
        chrome.tabs.create({ url });
        window.close();
      }
    });
  });
  
  // Show assignments list
  emptyState.style.display = 'none';
  assignmentsList.style.display = 'block';
}

// Show empty state
function showEmptyState() {
  const emptyState = document.getElementById('emptyState');
  const assignmentsList = document.getElementById('assignmentsList');
  
  emptyState.style.display = 'flex';
  assignmentsList.style.display = 'none';
}

// Load classrooms
async function loadClassrooms() {
  const classroomsList = document.getElementById('classroomsList');
  
  try {
    // Get stored classroom data
    const result = await chrome.runtime.sendMessage({ action: 'getStoredAssignments' });
    const assignments = result.assignments || [];
    
    // Extract unique classrooms
    const classrooms = [...new Set(assignments.map(a => a.classroom))]
      .filter(classroom => classroom && classroom !== 'Unknown Course')
      .map(classroom => ({
        name: classroom,
        url: `https://apstudents.collegeboard.org/`
      }));
    
    if (classrooms.length === 0) {
      classroomsList.innerHTML = `
        <div class="empty-state">
          <p>No classrooms found. Visit AP Classroom to load your courses.</p>
          <button id="visitClassroomFromTab" class="btn btn-primary">Visit AP Classroom</button>
        </div>
      `;
      
      document.getElementById('visitClassroomFromTab').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://apstudents.collegeboard.org/' });
        window.close();
      });
      
      return;
    }
    
    // Generate HTML for classrooms
    const classroomsHTML = classrooms.map(classroom => `
      <a href="${classroom.url}" class="classroom-item" data-url="${classroom.url}">
        <div class="classroom-name">${escapeHtml(classroom.name)}</div>
        <div class="classroom-id">Click to visit classroom</div>
      </a>
    `).join('');
    
    classroomsList.innerHTML = classroomsHTML;
    
    // Add click listeners
    const classroomItems = classroomsList.querySelectorAll('.classroom-item');
    classroomItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = item.getAttribute('data-url');
        chrome.tabs.create({ url });
        window.close();
      });
    });
    
  } catch (error) {
    console.error('Error loading classrooms:', error);
    classroomsList.innerHTML = '<div class="empty-state"><p>Error loading classrooms</p></div>';
  }
}

// Refresh data from current tab
async function refreshAssignmentsFromCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url.includes('apstudents.collegeboard.org')) {
      // Send message to content script to refresh
      await chrome.tabs.sendMessage(tab.id, { action: 'refreshAssignments' });
    }
  } catch (error) {
    console.log('Could not refresh from current tab:', error);
  }
}

// Refresh all data
async function refreshData() {
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.style.opacity = '0.5';
  refreshBtn.disabled = true;
  
  try {
    await refreshAssignmentsFromCurrentTab();
    
    // Wait a moment for data to be processed
    setTimeout(() => {
      loadAssignments();
      updateSessionStatus();
      refreshBtn.style.opacity = '1';
      refreshBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Error refreshing data:', error);
    refreshBtn.style.opacity = '1';
    refreshBtn.disabled = false;
  }
}

// Update session status
async function updateSessionStatus() {
  const statusIndicator = document.getElementById('sessionStatus');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('.status-text');
  
  try {
    // Check if there are any College Board tabs open
    const tabs = await chrome.tabs.query({
      url: ["https://apstudents.collegeboard.org/*", "https://collegeboard.org/*", "https://*.collegeboard.org/*"]
    });
    
    if (tabs.length > 0) {
      statusDot.className = 'status-dot status-active';
      statusText.textContent = 'Session Active';
    } else {
      statusDot.className = 'status-dot status-inactive';
      statusText.textContent = 'No Active Session';
    }
  } catch (error) {
    console.error('Error checking session status:', error);
    statusDot.className = 'status-dot status-inactive';
    statusText.textContent = 'Status Unknown';
  }
}

// Update last update time
function updateLastUpdateTime() {
  const updateTimeElement = document.getElementById('updateTime');
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  updateTimeElement.textContent = timeString;
}

// Show settings modal
function showSettings() {
  document.getElementById('settingsModal').style.display = 'flex';
  
  // Load current settings
  chrome.storage.sync.get({
    autoKeepAlive: true,
    keepAliveInterval: 10,
    assignmentNotifications: true
  }, (settings) => {
    document.getElementById('autoKeepAlive').checked = settings.autoKeepAlive;
    document.getElementById('keepAliveInterval').value = settings.keepAliveInterval;
    document.getElementById('assignmentNotifications').checked = settings.assignmentNotifications;
  });
}

// Hide settings modal
function hideSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

// Save settings
function saveSettings() {
  const settings = {
    autoKeepAlive: document.getElementById('autoKeepAlive').checked,
    keepAliveInterval: parseInt(document.getElementById('keepAliveInterval').value),
    assignmentNotifications: document.getElementById('assignmentNotifications').checked
  };
  
  chrome.storage.sync.set(settings, () => {
    console.log('Settings saved:', settings);
    
    // Update background script alarm if interval changed
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
    
    hideSettings();
  });
}

// Show help information
function showHelp() {
  const helpText = `
AP Classroom Assistant Help:

Features:
• Keeps your College Board session active
• Collects all active assignments from your AP Classrooms
• Provides quick navigation to assignments

Usage:
1. Log in to College Board and visit your AP Classrooms
2. Click the extension icon to see your active assignments
3. Click on any assignment to open it directly
4. Use the refresh button to update assignment data

The extension automatically keeps your session alive to prevent logouts.
  `;
  
  alert(helpText);
}

// Show about information
function showAbout() {
  const aboutText = `
AP Classroom Assistant v1.0.0

A Chrome extension to enhance your AP Classroom experience by:
• Maintaining login sessions
• Providing quick access to active assignments
• Streamlining navigation across multiple classrooms

Created for students using College Board's AP Classroom platform.

Note: This extension is not affiliated with College Board.
  `;
  
  alert(aboutText);
}

// Utility function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}