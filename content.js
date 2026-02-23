// content.js

// Detects if we are on localhost.
const isLocalhost = () => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local') ||
    hostname.match(/^192\.168\.\d{1,3}\.\d{1,3}$/) ||
    hostname.match(/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
  );
};

// Creates a flashing purple favicon.
const createBlinkingFavicon = () => {
  // Check if Canvas is available.
  if (typeof document.createElement !== 'function') {
    return;
  }

  const canvas = document.createElement('canvas');
  
  // Checks if getContext is available.
  if (typeof canvas.getContext !== 'function') {
    return;
  }

  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  let toggle = true;

  const updateFavicon = () => {
    ctx.clearRect(0, 0, 32, 32);
    
    // Draws alternating purple/white circles.
    ctx.fillStyle = toggle ? '#9333ea' : '#D17300';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Adds white "L" text.
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L', 16, 16);
    
    // Update the favicon
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/x-icon';
    link.href = canvas.toDataURL();
    
    toggle = !toggle;
  };

  // Updates every 800ms (blinks smoothly)
  setInterval(updateFavicon, 800);
  updateFavicon();
};

// Add title with prefix [DEV]
const updatePageTitle = () => {
  const originalTitle = document.title;
  
  // Avoid doubling the prefix.
  if (!originalTitle.startsWith('🟣 [DEV]')) {
    document.title = '🟣 [DEV] ' + originalTitle;
  }

  // Note the changes in the title (for SPAs).
  const observer = new MutationObserver(() => {
    if (!document.title.startsWith('🟣 [DEV]')) {
      document.title = '🟣 [DEV] ' + document.title;
    }
  });

  observer.observe(
    document.querySelector('title') || document.head,
    { childList: true, subtree: true }
  );
};

// Applies the changes
const applyLocalhostIndicators = () => {
  if (!isLocalhost()) return;

  // It does not execute on XML, JSON, or other non-HTML page types.
  if (document.contentType && !document.contentType.includes('html')) {
    return;
  }

  // It checks if we are in a valid document.
  if (!document.head) {
    return;
  }

  // Creates a blinking favicon.
  createBlinkingFavicon();

  // Update title
  updatePageTitle();

  // Notifies the background script (with error handling)
  try {
    chrome.runtime.sendMessage({ 
      type: 'LOCALHOST_DETECTED',
      url: window.location.href 
    }).catch(() => {
      // Ignores error if tab/extension is not available.
    });
  } catch (error) {
    // Ignore error if chrome.runtime is unavailable.
  }

  // Adds meta theme-color for mobile.
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#9333ea';
  document.head.appendChild(meta);
};

// Executes when the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyLocalhostIndicators);
} else {
  applyLocalhostIndicators();
}