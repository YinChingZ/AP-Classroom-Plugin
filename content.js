// Content Script for AP Classroom Assignment Collection
// Runs on apstudents.collegeboard.org pages to extract assignment data

(function() {
  'use strict';
  
  let assignmentData = [];
  let classrooms = [];
  
  // Main function to collect assignments
  async function collectAssignments() {
    console.log('AP Classroom Assistant: Starting assignment collection...');
    
    try {
      // Check if we're on the main AP Students page
      if (window.location.href.includes('apstudents.collegeboard.org')) {
        await findAndCollectFromAllClassrooms();
      }
    } catch (error) {
      console.error('Error collecting assignments:', error);
    }
  }
  
  // Find all available classrooms and collect their active assignments
  async function findAndCollectFromAllClassrooms() {
    // Look for classroom links on the current page
    const classroomLinks = document.querySelectorAll('a[href*="/course/"]');
    const uniqueClassrooms = new Set();
    
    classroomLinks.forEach(link => {
      const href = link.href;
      if (href.includes('/course/') && !href.includes('/assignment/')) {
        uniqueClassrooms.add({
          name: link.textContent.trim(),
          url: href,
          id: extractCourseId(href)
        });
      }
    });
    
    classrooms = Array.from(uniqueClassrooms);
    console.log('Found classrooms:', classrooms);
    
    // If we're already in a specific classroom, collect assignments from current page
    if (window.location.href.includes('/course/')) {
      await collectAssignmentsFromCurrentPage();
    }
    
    // Store the classroom list for popup access
    chrome.runtime.sendMessage({
      action: 'getAssignments',
      data: assignmentData,
      classrooms: classrooms
    });
  }
  
  // Extract course ID from URL
  function extractCourseId(url) {
    const match = url.match(/\/course\/([^\/]+)/);
    return match ? match[1] : null;
  }
  
  // Collect assignments from the current page
  async function collectAssignmentsFromCurrentPage() {
    const assignments = [];
    
    // Look for different assignment containers based on AP Classroom structure
    const assignmentContainers = [
      '.assignment-card',
      '.assignment-item',
      '[data-testid*="assignment"]',
      '.cb-assignment',
      '.assignment',
      // Fallback: look for links that contain "assignment" in URL
      'a[href*="/assignment/"]'
    ];
    
    let foundAssignments = [];
    
    for (const selector of assignmentContainers) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundAssignments = Array.from(elements);
        break;
      }
    }
    
    // Also look for assignment links directly
    const assignmentLinks = document.querySelectorAll('a[href*="/assignment/"]');
    foundAssignments = [...foundAssignments, ...assignmentLinks];
    
    foundAssignments.forEach(element => {
      const assignment = extractAssignmentInfo(element);
      if (assignment && assignment.status === 'active') {
        assignments.push(assignment);
      }
    });
    
    // Look for "Active" section specifically
    const activeSections = document.querySelectorAll('*');
    activeSections.forEach(section => {
      const text = section.textContent.toLowerCase();
      if (text.includes('active') && section.querySelectorAll('a[href*="/assignment/"]').length > 0) {
        const activeLinks = section.querySelectorAll('a[href*="/assignment/"]');
        activeLinks.forEach(link => {
          const assignment = extractAssignmentInfo(link);
          if (assignment) {
            assignment.status = 'active';
            assignments.push(assignment);
          }
        });
      }
    });
    
    assignmentData = [...assignmentData, ...assignments];
    console.log('Collected assignments from current page:', assignments);
  }
  
  // Extract assignment information from DOM element
  function extractAssignmentInfo(element) {
    try {
      let title = '';
      let url = '';
      let dueDate = '';
      let status = 'active'; // Default to active
      let classroom = '';
      
      // Extract URL
      if (element.tagName === 'A') {
        url = element.href;
        title = element.textContent.trim();
      } else {
        const link = element.querySelector('a[href*="/assignment/"]');
        if (link) {
          url = link.href;
          title = link.textContent.trim();
        }
      }
      
      // Extract additional info from parent elements
      const parent = element.closest('.assignment-card, .assignment-item, [data-testid*="assignment"]') || element;
      
      // Look for due date
      const dueDateElements = parent.querySelectorAll('*');
      dueDateElements.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes('due') || text.includes('deadline')) {
          dueDate = el.textContent.trim();
        }
      });
      
      // Extract classroom from URL or page context
      const courseMatch = window.location.href.match(/\/course\/([^\/]+)/);
      if (courseMatch) {
        const classroomElement = document.querySelector('h1, .course-title, [data-testid*="course"]');
        classroom = classroomElement ? classroomElement.textContent.trim() : `Course ${courseMatch[1]}`;
      }
      
      // Determine status based on context
      const parentText = parent.textContent.toLowerCase();
      if (parentText.includes('completed')) {
        status = 'completed';
      } else if (parentText.includes('upcoming')) {
        status = 'upcoming';
      } else if (parentText.includes('active') || parentText.includes('due soon')) {
        status = 'active';
      }
      
      if (title && url) {
        return {
          title: title || 'Untitled Assignment',
          url: url,
          dueDate: dueDate || 'No due date',
          status: status,
          classroom: classroom || 'Unknown Course',
          id: extractAssignmentId(url)
        };
      }
    } catch (error) {
      console.error('Error extracting assignment info:', error);
    }
    return null;
  }
  
  // Extract assignment ID from URL
  function extractAssignmentId(url) {
    const match = url.match(/\/assignment\/([^\/\?]+)/);
    return match ? match[1] : null;
  }
  
  // Observe DOM changes to catch dynamically loaded content
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.querySelector && (
                node.querySelector('a[href*="/assignment/"]') ||
                node.classList.contains('assignment-card') ||
                node.classList.contains('assignment-item')
              )) {
                shouldRefresh = true;
              }
            }
          });
        }
      });
      
      if (shouldRefresh) {
        console.log('DOM changes detected, refreshing assignment collection...');
        setTimeout(collectAssignments, 1000); // Delay to allow content to fully load
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize when page is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(collectAssignments, 2000); // Wait for dynamic content
        observeDOMChanges();
      });
    } else {
      setTimeout(collectAssignments, 2000);
      observeDOMChanges();
    }
  }
  
  // Start the content script
  init();
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshAssignments') {
      collectAssignments().then(() => {
        sendResponse({ success: true, assignments: assignmentData });
      });
      return true;
    }
  });
  
})();