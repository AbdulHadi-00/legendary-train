// extension_protection.js – self‑protect layer while locked or tamper protection active

// Helper to read lock state from session storage
function getLockState() {
  return new Promise(resolve => {
    if (!chrome.storage || !chrome.storage.session) {
      resolve(false);
      return;
    }
    chrome.storage.session.get(['isLocked'], data => {
      resolve(!!(data && data.isLocked));
    });
  });
}

// Check if locked OR tamper protection is active without valid maintenance authorization
async function isTamperRestricted() {
  const locked = await getLockState();
  return locked;
}

// Redirect attempts to open internal pages while locked or protected
if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!changeInfo || !changeInfo.url) return;
    const url = changeInfo.url;
    if (url.includes('lock.html') || url.includes('locked.html')) return;
    
    const restricted = await isTamperRestricted();
    const isSensitive = [
      'chrome://extensions', 'chrome://settings', 'chrome://bookmarks', 'chrome://history',
      'chrome://downloads', 'edge://extensions', 'edge://settings', 'chrome://inspect',
      'chrome://flags', 'chrome://management', 'chrome://policy', 'chrome://net-export',
      'chrome://devtools', 'devtools://', 'chrome-devtools://', 'chrome://gpu',
      'chrome://version', 'chrome://net-internals', 'chrome://serviceworker-internals',
      'chrome://credits', 'chrome://about', 'edge://flags', 'edge://history', 'edge://downloads',
      'view-source:'
    ].some(prefix => url.startsWith(prefix) || url.includes(prefix));

    if (restricted && isSensitive) {
      const encodedRedirect = encodeURIComponent(url);
      await chrome.tabs.update(tabId, { url: chrome.runtime.getURL('lock.html?target=maintenance&redirect=' + encodedRedirect) }).catch(() => {});
    }
  });
}

// Block disable or uninstall attempts
function protectSelf(details, callback) {
  isTamperRestricted().then(restricted => {
    if (restricted && details && details.id === chrome.runtime.id) {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'H_icon.png',
          title: 'Tamper Protection Active',
          message: 'Profile Lock Pro is protected. Master passcode is required to disable or remove the extension.'
        }).catch(() => {});
      }
      if (chrome.management && chrome.management.setEnabled) {
        chrome.management.setEnabled(chrome.runtime.id, true).catch(() => {});
      }
      if (callback) callback(false);
    } else if (callback) {
      callback(true);
    }
  });
}

if (chrome.management && chrome.management.onDisabled) {
  chrome.management.onDisabled.addListener(details => protectSelf(details, null));
}
if (chrome.management && chrome.management.onUninstallRequested) {
  chrome.management.onUninstallRequested.addListener((details, callback) => protectSelf(details, callback));
}
