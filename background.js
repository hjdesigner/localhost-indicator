// background.js

// Silences "No tab with id" errors globally
const suppressChromeErrors = () => {
  if (chrome.runtime.lastError) {
    // Only consumes the error without logging.
    return;
  }
};

// Checks if the URL is localhost
const isLocalhost = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      hostname.match(/^192\.168\.\d{1,3}\.\d{1,3}$/) ||
      hostname.match(/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
    );
  } catch {
    return false;
  }
};

// Stores animation intervals by tab.
const pulseIntervals = new Map();
const badgePulseIntervals = new Map();

// Verifica se a tab ainda existe antes de fazer operações
const tabExists = async (tabId) => {
  try {
    await chrome.tabs.get(tabId);
    return true;
  } catch {
    return false;
  }
};

// Checks if the tab still exists before performing any operations.
const startIconPulse = async (tabId) => {
  // Checks if the tab exists
  if (!(await tabExists(tabId))) {
    return;
  }

  // Clears previous range if it exists.
  if (pulseIntervals.has(tabId)) {
    clearInterval(pulseIntervals.get(tabId));
  }

  let toggle = false;

  const pulse = async () => {
    // Checks if the tab still exists before each pulse
    if (!(await tabExists(tabId))) {
      stopIconPulse(tabId);
      return;
    }

    const iconSet = toggle
      ? {
          16: 'icon-pulse16.png',
          48: 'icon-pulse48.png',
          128: 'icon-pulse128.png',
        }
      : {
          16: 'icon-active16.png',
          48: 'icon-active48.png',
          128: 'icon-active128.png',
        };

    chrome.action.setIcon({ tabId, path: iconSet }, suppressChromeErrors);
    toggle = !toggle;
  };

  // Pulsates every 1 second.
  const interval = setInterval(pulse, 1000);
  pulseIntervals.set(tabId, interval);
  pulse();
};

// Creates a pulse effect on the emblem (changing the color)
const startBadgePulse = async (tabId) => {
  // Checks if the tab exists
  if (!(await tabExists(tabId))) {
    return;
  }

  // Clears previous range if it exists.
  if (badgePulseIntervals.has(tabId)) {
    clearInterval(badgePulseIntervals.get(tabId));
  }

  let toggle = false;

  const pulse = async () => {
    // Check if the tab is still present before each pulse.
    if (!(await tabExists(tabId))) {
      stopBadgePulse(tabId);
      return;
    }

    const color = toggle ? '#9333ea' : '#D17300';
    chrome.action.setBadgeBackgroundColor({ tabId, color }, suppressChromeErrors);
    toggle = !toggle;
  };

  // It pulses every 1 second (synchronized with the icon).
  const interval = setInterval(pulse, 1000);
  badgePulseIntervals.set(tabId, interval);
  pulse();
};

// For icon animation
const stopIconPulse = (tabId) => {
  if (pulseIntervals.has(tabId)) {
    clearInterval(pulseIntervals.get(tabId));
    pulseIntervals.delete(tabId);
  }

  // Restores normal icon.
  chrome.action.setIcon({
    tabId,
    path: {
      16: 'icon16.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
  }, suppressChromeErrors);
};

// For the emblem animation
const stopBadgePulse = (tabId) => {
  if (badgePulseIntervals.has(tabId)) {
    clearInterval(badgePulseIntervals.get(tabId));
    badgePulseIntervals.delete(tabId);
  }
};

// Update the emblem.
const updateBadge = async (tabId, url) => {
  // Check if the tab exists before doing anything.
  if (!(await tabExists(tabId))) {
    return;
  }

  if (isLocalhost(url)) {
    // Vibrant purple "DEV" badge
    chrome.action.setBadgeText({ tabId, text: 'DEV' }, suppressChromeErrors);
    chrome.action.setBadgeTextColor({ tabId, color: '#ffffff' }, suppressChromeErrors);
    chrome.action.setTitle({
      tabId,
      title: '🟣 LOCALHOST ATIVO\nAmbiente de Desenvolvimento',
    }, suppressChromeErrors);

    // Starts pulse animation on the icon and emblem.
    startIconPulse(tabId);
    startBadgePulse(tabId);
  } else {
    // Remove the emblem.
    chrome.action.setBadgeText({ tabId, text: '' }, suppressChromeErrors);
    chrome.action.setTitle({ tabId, title: 'Localhost Indicator' }, suppressChromeErrors);

    // For pulse animation
    stopIconPulse(tabId);
    stopBadgePulse(tabId);
  }
};

// Listener for tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateBadge(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    // The tab was closed before I could get any information.
  }
});

// Listener for URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (changeInfo.url) {
      await updateBadge(tabId, changeInfo.url);
    } else if (changeInfo.status === 'complete' && tab.url) {
      await updateBadge(tabId, tab.url);
    }
  } catch (error) {
    // The tab was closed during the update.
  }
});

// Listener for messages from the content script.
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'LOCALHOST_DETECTED' && sender.tab) {
    // Use setTimeout to avoid race conditions.
    setTimeout(() => {
      updateBadge(sender.tab.id, sender.tab.url).catch(() => {
        // The tab was closed before the update.
      });
    }, 100);
  }
});

// Listener stops when tabs are closed (clears intervals)
chrome.tabs.onRemoved.addListener((tabId) => {
  stopIconPulse(tabId);
  stopBadgePulse(tabId);
});

// Initializes for all open tabs.
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    if (tab.url && tab.id) {
      updateBadge(tab.id, tab.url).catch(() => {
        // The tab may have been closed during startup.
      });
    }
  });
});