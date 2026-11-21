// background.js
importScripts('extension_protection.js');

let lockTabId = null;
let heartbeatInterval = null;
let isLocking = false;

// IN-MEMORY CACHE for instant checks to prevent execution lag
// LockBrowse Pro State
let individuallyLockedTabs = {}; // tabId -> { url, title, lockedAt }
let lockedTabGroups = {}; // groupId -> { title, color, passcode, salt, lockedAt }
let sessionUnlockedDomains = new Set(); // hostnames unlocked in this session

async function ensurePasscodeSalt() {
    try {
        const stored = await chrome.storage.local.get(['passcodeSalt']);
        if (!stored.passcodeSalt) {
            const arr = new Uint8Array(16);
            crypto.getRandomValues(arr);
            const salt = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
            await chrome.storage.local.set({ passcodeSalt: salt });
            return salt;
        }
        return stored.passcodeSalt;
    } catch(e) {
        return '';
    }
}

function setupContextMenus() {
    if (!chrome.contextMenus) return;
    try {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'lockbrowse_lock_tab',
                title: '🔒 Lock This Tab (LockBrowse Pro)',
                contexts: ['page', 'action']
            }, () => {
                if (chrome.runtime.lastError) {}
            });
        });
    } catch(e) {}
}

async function lockSpecificTab(tabId, url, title) {
    if (!url || url.includes('lock.html') || url.includes('locked.html') || url.includes(chrome.runtime.id)) {
        return;
    }
    individuallyLockedTabs[tabId] = { url, title: title || '', lockedAt: Date.now() };
    await chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });

    const lockedUrl = chrome.runtime.getURL('locked.html?mode=tab&tabId=' + tabId + '&returnUrl=' + encodeURIComponent(url));
    if (chrome.tabs && chrome.tabs.get) {
        chrome.tabs.get(tabId, (tab) => {
            if (tab && tab.groupId && tab.groupId > 0) {
                individuallyLockedTabs[tabId].groupId = tab.groupId;
                chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });
            }
        });
    }
    chrome.tabs.update(tabId, { url: lockedUrl }).catch(() => {});
}

function checkDomainMatch(hostname, rule) {
    rule = rule.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!rule) return false;
    if (rule.startsWith('*.')) {
        const root = rule.slice(2);
        return hostname === root || hostname.endsWith('.' + root);
    }
    if (rule.includes('*')) {
        const regex = new RegExp('^' + rule.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(hostname);
    }
    return hostname === rule || hostname.endsWith('.' + rule);
}

async function checkDomainRestriction(url) {
    if (!url || !url.startsWith('http')) return { restricted: false };
    let hostname = '';
    try {
        hostname = new URL(url).hostname.toLowerCase();
    } catch(e) {
        return { restricted: false };
    }

    if (sessionUnlockedDomains.has(hostname)) return { restricted: false };

    const data = await chrome.storage.local.get(['isDomainLockEnabled', 'domainLockMode', 'domainRules']);
    if (!data.isDomainLockEnabled || !data.domainRules || !data.domainRules.length) {
        return { restricted: false };
    }

    const mode = data.domainLockMode || 'blacklist';
    const matched = data.domainRules.some(rule => checkDomainMatch(hostname, rule));

    if (mode === 'whitelist') {
        return { restricted: !matched, hostname };
    }
    return { restricted: matched, hostname };
}

let memoryState = {
    isUnlocked: false,
    isEnabled: true,
    hasPasscode: false,
    initialized: false
};

async function syncStateFromStorage() {
    const local = await chrome.storage.local.get(['isEnabled', 'passcode', 'idleTime', 'individualLockedTabs', 'lockedTabGroups', 'passcodeSalt']);
    if (local.lockedTabGroups) { lockedTabGroups = local.lockedTabGroups; }
    if (local.individualLockedTabs) {
        individuallyLockedTabs = local.individualLockedTabs;
    }
    if (!local.passcodeSalt) {
        ensurePasscodeSalt();
    }
    let isUnlocked = false;
    
    if (chrome.storage.session) {
        try {
            const session = await chrome.storage.session.get(['isUnlocked', 'sessionStarted']);
            if (!session.sessionStarted) {
                await chrome.storage.session.set({ sessionStarted: true, isUnlocked: false, isLocked: true });
                isUnlocked = false;
            } else {
                isUnlocked = !!session.isUnlocked;
            }
        } catch (e) {
            console.error("Session storage error:", e);
        }
    }

    memoryState.isEnabled = local.isEnabled !== false;
    memoryState.hasPasscode = !!local.passcode;
    memoryState.isUnlocked = isUnlocked;
    memoryState.initialized = true;

    if (local.idleTime && local.idleTime > 0) {
        chrome.idle.setDetectionInterval(local.idleTime * 60);
    }

    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        chrome.windows.getAll({ windowTypes: ['normal'] }).then(windows => {
            if (windows.length > 0) {
                checkLockState();
            }
        });
    }
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.isEnabled !== undefined) memoryState.isEnabled = changes.isEnabled.newValue !== false;
        if (changes.passcode !== undefined) memoryState.hasPasscode = !!changes.passcode.newValue;
        if (changes.idleTime !== undefined && changes.idleTime.newValue > 0) {
            chrome.idle.setDetectionInterval(changes.idleTime.newValue * 60);
        }
    } else if (area === 'session') {
        if (changes.isUnlocked !== undefined) {
            memoryState.isUnlocked = !!changes.isUnlocked.newValue;
            if (memoryState.isUnlocked) {
                stopHeartbeat();
            } else {
                startHeartbeat();
            }
        }
    }
});

async function getIsUnlocked() {
    if (!memoryState.initialized) await syncStateFromStorage();
    return memoryState.isUnlocked;
}

async function setIsUnlocked(value) {
  memoryState.isUnlocked = !!value;
  if (chrome.storage.session) {
    try {
      if (value) {
        await chrome.storage.session.set({ isUnlocked: true, isLocked: false });
      } else {
        await chrome.storage.session.set({ isUnlocked: false, isLocked: true });
      }
    } catch(e) {}
  }
  if (value) {
    stopHeartbeat();
    startOffscreenFaceTracking(); // Attempt to start face tracking if enabled
  } else {
    startHeartbeat();
    stopOffscreenFaceTracking(); // Pause face tracking while locked
  }
}

// ===== OFFSCREEN CONTINUOUS FACE ID =====
let offscreenCreating = null;
async function setupOffscreenDocument() {
    if (await chrome.offscreen.hasDocument()) return;
    if (offscreenCreating) { await offscreenCreating; return; }
    
    offscreenCreating = chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Continuous Face ID for profile locking'
    });
    await offscreenCreating;
    offscreenCreating = null;
}

async function startOffscreenFaceTracking() {
    const data = await chrome.storage.local.get(['isFaceIdEnabled', 'faceDescriptor']);
    if (data.isFaceIdEnabled && data.faceDescriptor) {
        await setupOffscreenDocument();
        chrome.runtime.sendMessage({ type: 'START_FACE_ID', descriptor: data.faceDescriptor }).catch(()=>{});
    }
}

function stopOffscreenFaceTracking() {
    chrome.runtime.sendMessage({ type: 'STOP_FACE_ID' }).catch(()=>{});
}
// =======================================

// Check if a passcode is set. If not, open options.
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    const data = await chrome.storage.local.get(['passcode', 'isEnabled']);
    if (data.isEnabled === undefined) {
        await chrome.storage.local.set({ isEnabled: true });
    }
    if (!data.passcode) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
});

// Ensure lock state is enforced when Chrome starts up (e.g., after a full browser restart)
chrome.runtime.onStartup.addListener(async () => {
  // Immediately set locked state locally and in memory
  await setIsUnlocked(false);
  const data = await chrome.storage.local.get(['isEnabled', 'passcode']);
  if (data.isEnabled && data.passcode) {
    // State is ready, enforce lock screen
    checkLockState();
  } else {
    // Not configured yet – fallback after short delay
    setTimeout(checkLockState, 1000);
  }
});

// Also run an initial check after the extension is loaded (fallback for older Chrome versions)
syncStateFromStorage();

function broadcastLockOverlay() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            const u = tab.url || tab.pendingUrl || '';
            if (u && !u.includes(chrome.runtime.id) && u.startsWith('http')) {
                // True Anti-Bypass: Redirect tab directly to the real internal HTML lock screen
                const returnUrl = encodeURIComponent(u);
                chrome.tabs.update(tab.id, {
                    url: chrome.runtime.getURL('locked.html?returnUrl=' + returnUrl)
                }).catch(() => {});
            } else if (u && !u.includes(chrome.runtime.id)) {
                chrome.tabs.sendMessage(tab.id, { type: 'LOCK_OVERLAY' }).catch(() => {});
            }
        });
    });
}

function broadcastUnlockOverlay() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: 'UNLOCK_OVERLAY' }).catch(() => { });
        });
    });
}

async function checkLockState() {
    if (!memoryState.initialized) await syncStateFromStorage();

    if (!memoryState.isEnabled || !memoryState.hasPasscode) {
        if (!memoryState.isUnlocked) await setIsUnlocked(true);
        return;
    }

    if (memoryState.isUnlocked) return;

    // -------------------------------------------------------------------------
    // LOCK INITIALIZATION
    // -------------------------------------------------------------------------
    // Prevent re‑entrancy: if a lock process is already running, exit early.
    if (isLocking) return;
    isLocking = true;

    // GUARANTEE the heartbeat is running. If tab creation fails due to startup races,
    // the heartbeat will automatically retry and secure the browser.
    startHeartbeat();

    try {
        const lockUrlBase = chrome.runtime.getURL('lock.html');
        const tabs = await chrome.tabs.query({ url: lockUrlBase + '*' });
        const standardLockTabs = tabs.filter(t => {
            const u = t.url || t.pendingUrl || '';
            return !u.includes('target=maintenance');
        });

        if (standardLockTabs.length === 0) {
            let tab;
            try {
                tab = await chrome.tabs.create({
                    url: lockUrlBase,
                    pinned: true,
                    active: true
                });
            } catch (err) {
                const win = await chrome.windows.create({
                    url: lockUrlBase,
                    type: 'normal',
                    state: 'maximized'
                });
                tab = win.tabs[0];
            }
            
            if (tab) lockTabId = tab.id;
            
            const allTabs = await chrome.tabs.query({});
            const tabsToSave = allTabs
                .filter(t => {
                    const u = t.url || t.pendingUrl || '';
                    return u && !u.includes(chrome.runtime.id) && !u.startsWith('chrome://') && !u.startsWith('edge://') && u !== 'about:blank';
                })
                .map(t => ({ url: t.url || t.pendingUrl, title: t.title, pinned: t.pinned, active: t.active, windowId: t.windowId }));

            if (tabsToSave.length > 0) {
                const existingSaved = await chrome.storage.local.get(['lockedSessionTabs']);
                if (!existingSaved.lockedSessionTabs || existingSaved.lockedSessionTabs.length === 0) {
                    await chrome.storage.local.set({ lockedSessionTabs: tabsToSave });
                }
            }

            if (allTabs.length > 1) {
                for (const t of allTabs) {
                    const u = t.url || t.pendingUrl || '';
                    if (t.id !== lockTabId && !u.includes(lockUrlBase) && !u.startsWith('chrome://')) {
                        chrome.tabs.remove(t.id).catch(() => {});
                    }
                }
            }
        } else {
            const lockTab = standardLockTabs[0];
            lockTabId = lockTab.id;
            if (!lockTab.active) {
                await chrome.tabs.update(lockTab.id, { active: true }).catch(() => {});
            }
            const allTabs = await chrome.tabs.query({});
            for (const t of allTabs) {
                const u = t.url || t.pendingUrl || '';
                if (t.id !== lockTabId && !u.includes(lockUrlBase) && !u.startsWith('chrome://')) {
                    chrome.tabs.remove(t.id).catch(() => {});
                }
            }
        }
    } catch (e) {
        console.error("LOCK ERROR:", e);
    } finally {
        isLocking = false;
    }
}

function startHeartbeat() {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(async () => {
        if (memoryState.isUnlocked) {
            stopHeartbeat();
            return;
        }
        
        if (memoryState.isEnabled && memoryState.hasPasscode && !isLocking) {
             const lockUrlBase = chrome.runtime.getURL('lock.html');
             const tabs = await chrome.tabs.query({ url: lockUrlBase + '*' });
             const standardLockTabs = tabs.filter(t => {
                 const u = t.url || t.pendingUrl || '';
                 return !u.includes('target=maintenance');
             });
             if (standardLockTabs.length === 0) {
                 checkLockState();
             } else {
                 const lockTab = standardLockTabs[0];
                 if (!lockTab.active) {
                     chrome.tabs.update(lockTab.id, { active: true }).catch(()=>{});
                 }
                 if (lockTab.windowId !== undefined) {
                     chrome.windows.update(lockTab.windowId, { focused: true }).catch(()=>{});
                 }
             }
        }
    }, 500);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

async function requireLockFocus() {
    if (!memoryState.initialized) {
        await syncStateFromStorage();
    }
    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        checkLockState();
    }
}

async function handleWindowCreated(win) {
    if (!memoryState.initialized) await syncStateFromStorage();
    // Intruders cannot bypass lock screen by opening an Incognito window
    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        if (win.incognito) {
            chrome.windows.remove(win.id).catch(() => {});
            return;
        }
    }
    try {
        const data = await chrome.storage.local.get(['isIncognitoLockdownEnabled']);
        if (win.incognito && data.isIncognitoLockdownEnabled) {
            chrome.windows.remove(win.id).catch(() => {});
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'H_icon.png',
                    title: '🚫 Incognito Window Blocked',
                    message: 'Incognito Mode is strictly blocked by Profile Lock Pro policy.'
                });
            }
            return;
        }
    } catch(e) {}
    requireLockFocus();
}
chrome.windows.onCreated.addListener(handleWindowCreated);

// Lock On Window Minimize / Lost Focus / Screen Lock
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    try {
        const data = await chrome.storage.local.get(['isLockOnMinimizeEnabled', 'isEnabled', 'passcode']);
        if (data.isLockOnMinimizeEnabled && data.isEnabled && data.passcode && memoryState.isUnlocked) {
            if (windowId === chrome.windows.WINDOW_ID_NONE) {
                await setIsUnlocked(false);
                performLockdownActions();
                broadcastLockOverlay();
                checkLockState();
            }
        }
    } catch(e) {}
});

chrome.idle.onStateChanged.addListener(async (state) => {
    try {
        const data = await chrome.storage.local.get(['isLockOnMinimizeEnabled', 'isEnabled', 'passcode']);
        if (data.isLockOnMinimizeEnabled && data.isEnabled && data.passcode && memoryState.isUnlocked) {
            if (state === 'locked') {
                await setIsUnlocked(false);
                performLockdownActions();
                broadcastLockOverlay();
                checkLockState();
            }
        }
    } catch(e) {}
});

const blockedUrls = [
    // Prevent navigation to Chrome/Edge internal pages where the user could
    // disable or uninstall the extension, or change browser settings.
    'chrome://extensions',
    'chrome://settings',
    'options.html', // Legacy settings page
    'chrome://inspect',
    'chrome://flags',
    'chrome://management',
    'chrome://policy',
    'chrome://net-export',
    'chrome://bookmarks', // block access to bookmarks UI
    'chrome://history',   // block access to browsing history UI
    'chrome://downloads', // block downloads UI
    'edge://extensions',
    'edge://settings',
    // Additional anti-bypass entries
    'chrome://devtools',
    'devtools://',
    'view-source:',
    'chrome-devtools://',
    'chrome://gpu',
    'chrome://version',
    'chrome://net-internals',
    'chrome://serviceworker-internals',
    'chrome://credits',
    'chrome://about',
    'edge://flags',
    'edge://settings',
    'edge://history',
    'edge://downloads'
];

async function enforceBlockedUrls(tabId, url) {
    if (!url) return false;
    
    // CRITICAL FIX: Ignore lock.html and locked.html to prevent infinite redirect loops when the blocked URL is in the query parameter!
    if (url.includes('lock.html') || url.includes('locked.html')) return false;

    if (!memoryState.initialized) {
        await syncStateFromStorage();
    }

    // If the profile is unlocked, allow the user full normal access
    if (memoryState.isUnlocked) {
        return false;
    }

    // When locked, any navigation to a blocked internal URL triggers a forced
    // closure of the offending tab and redirects the user back to the lock screen.
    if (blockedUrls.some(blocked => url.startsWith(blocked) || url.includes(blocked))) {
        const local = await chrome.storage.local.get(['maintenanceExpiry', 'isEnabled', 'passcode']);
        const isMaintenanceValid = local.maintenanceExpiry && Date.now() < local.maintenanceExpiry;
        
        if (!isMaintenanceValid && local.isEnabled && local.passcode) {
            // Aggressively close the tab
            chrome.tabs.remove(tabId).catch(()=>{});
            const encodedRedirect = encodeURIComponent(url);
            chrome.tabs.create({ url: chrome.runtime.getURL('lock.html?target=maintenance&redirect=' + encodedRedirect) });
            return true;
        }
    }
    return false;
}

chrome.tabs.onCreated.addListener(async (tab) => {
    const url = tab.pendingUrl || tab.url;
    const handled = await enforceBlockedUrls(tab.id, url);
    if (!handled) {
        if (memoryState.initialized && !memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
            // FULL SECURITY: If the browser is locked, make new tab pages blank.
            // Using tabs.update instead of tabs.remove prevents Chrome from completely closing itself
            // when it starts up with a single new tab.
            if (url && (url.startsWith('chrome://newtab') || url.startsWith('edge://newtab'))) {
                chrome.tabs.update(tab.id, { url: 'about:blank' }).catch(()=>{});
            }
            requireLockFocus();
        }
    }
});

chrome.windows.onRemoved.addListener(async () => {
    const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    if (windows.length === 0) {
        // Last normal window closed, re-lock the profile to preserve absolute strength
        await setIsUnlocked(false);
    }
});

    // Ensure the lock screen appears even if the service worker started before any window existed.
    // The immediate checkLockState may race with Chrome’s window creation; a short delayed call
    // guarantees the lock tab is created once the UI is ready.
    setTimeout(checkLockState, 500);


chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (individuallyLockedTabs[tabId]) {
        delete individuallyLockedTabs[tabId];
        chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });
    }
    if (tabId === lockTabId && memoryState.initialized && !memoryState.isUnlocked) {
        lockTabId = null;
        // Immediate double-recovery: don't rely solely on heartbeat
        requireLockFocus();
        setTimeout(() => requireLockFocus(), 80);
        setTimeout(() => requireLockFocus(), 300);
    }
});

chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'idle' || newState === 'locked') {
        const data = await chrome.storage.local.get(['idleTime', 'isEnabled', 'passcode']);
        if (data.idleTime && data.idleTime > 0 && data.isEnabled && data.passcode && memoryState.isUnlocked) {
            await setIsUnlocked(false);
            performLockdownActions();
            broadcastLockOverlay();
            checkLockState();
        }
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (!memoryState.initialized) {
        await syncStateFromStorage();
    }
    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) return;
            const u = tab.url || tab.pendingUrl || '';
            if (!u.includes('lock.html')) {
                requireLockFocus();
            }
        });
    }
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return;
    if (!memoryState.initialized) {
        await syncStateFromStorage();
    }
    if (!memoryState.isUnlocked && !details.url.includes(chrome.runtime.id)) {
        requireLockFocus();
        return;
    }

    if (memoryState.isUnlocked) {
        // 1. Anti-bypass for individually locked tab
        if (individuallyLockedTabs[details.tabId]) {
            const lockUrl = chrome.runtime.getURL('locked.html');
            const legacyLockUrl = chrome.runtime.getURL('lock.html');
            if (!details.url.startsWith(lockUrl) && !details.url.startsWith(legacyLockUrl)) {
                const targetUrl = individuallyLockedTabs[details.tabId].url;
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL('locked.html?mode=tab&tabId=' + details.tabId + '&returnUrl=' + encodeURIComponent(targetUrl))
                }).catch(() => {});
                return;
            }
        }

        // 2. Domain / List Locking
        const domainCheck = await checkDomainRestriction(details.url);
        if (domainCheck.restricted) {
            chrome.tabs.update(details.tabId, {
                url: chrome.runtime.getURL('locked.html?mode=domain&domain=' + encodeURIComponent(domainCheck.hostname) + '&tabId=' + details.tabId + '&returnUrl=' + encodeURIComponent(details.url))
            }).catch(() => {});
            return;
        }
    }
});

// Block history manipulation (pushState/replaceState) while locked
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    if (details.frameId !== 0) return;
    if (!memoryState.initialized) await syncStateFromStorage();
    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        requireLockFocus();
    }
});

// Block hash changes while locked
chrome.webNavigation.onReferenceFragmentUpdated.addListener(async (details) => {
    if (details.frameId !== 0) return;
    if (!memoryState.initialized) await syncStateFromStorage();
    if (!memoryState.isUnlocked && memoryState.isEnabled && memoryState.hasPasscode) {
        requireLockFocus();
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;
    // Protect extensions and advanced settings
    const handled = await enforceBlockedUrls(tabId, changeInfo.url);
    if (handled) return;

    if (memoryState.initialized && !memoryState.isUnlocked) {
        if (!changeInfo.url.includes(chrome.runtime.id)) {
            requireLockFocus();
            if (changeInfo.url.startsWith('chrome://') && !changeInfo.url.startsWith('chrome://newtab')) {
                chrome.tabs.update(tabId, { url: 'about:blank' }).catch(()=>{});
            }
        }
    } else if (memoryState.isUnlocked) {
        // Anti-bypass for individually locked tab
        if (individuallyLockedTabs[tabId]) {
            const lockUrl = chrome.runtime.getURL('locked.html');
            const legacyLockUrl = chrome.runtime.getURL('lock.html');
            if (!changeInfo.url.startsWith(lockUrl) && !changeInfo.url.startsWith(legacyLockUrl)) {
                const targetUrl = individuallyLockedTabs[tabId].url;
                chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL('locked.html?mode=tab&tabId=' + tabId + '&returnUrl=' + encodeURIComponent(targetUrl))
                }).catch(() => {});
                return;
            }
        }

        // Domain / List Locking
        const domainCheck = await checkDomainRestriction(changeInfo.url);
        if (domainCheck.restricted) {
            chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL('locked.html?mode=domain&domain=' + encodeURIComponent(domainCheck.hostname) + '&tabId=' + tabId + '&returnUrl=' + encodeURIComponent(changeInfo.url))
            }).catch(() => {});
        }
    }
});

// Clipboard wipe + Deep Tab Suspension on lock
async function performLockdownActions() {
    // 1. Clipboard Wipe: Inject a script into all tabs to clear clipboard
    try {
        const allTabs = await chrome.tabs.query({});
        for (const tab of allTabs) {
            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // Clear text clipboard
                        navigator.clipboard.writeText('').catch(() => {});
                        // Also overwrite via DOM for maximum coverage
                        const ta = document.createElement('textarea');
                        ta.value = '';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    }
                }).catch(() => {});
            }
        }
    } catch(e) {}

    // 2. Deep Tab Suspension (RAM Wipe): Discard all non-lock tabs
    try {
        const data = await chrome.storage.local.get(['isDeepSuspendEnabled']);
        if (data.isDeepSuspendEnabled) {
            const allTabs = await chrome.tabs.query({});
            for (const tab of allTabs) {
                if (!tab.url.includes(chrome.runtime.id) && !tab.active) {
                    chrome.tabs.discard(tab.id).catch(() => {});
                }
            }
        }
    } catch(e) {}
}

chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'quick_lock') {
        const data = await chrome.storage.local.get(['isEnabled', 'passcode']);
        if (data.isEnabled && data.passcode && memoryState.isUnlocked) {
            await setIsUnlocked(false);
            performLockdownActions();
            broadcastLockOverlay();
            checkLockState();
        }
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        // Security Gate: Privileged unlock/wipe messages MUST originate strictly from internal extension pages
        const privilegedTypes = ['UNLOCK', 'STEALTH_UNLOCK', 'POISON_UNLOCK', 'UNLOCK_TAB', 'UNLOCK_TAB_GROUP', 'UNLOCK_DOMAIN', 'SHOW_ALERT', 'SHOW_RANSOMWARE', 'CLOSE_BROWSER'];
        if (privilegedTypes.includes(message.type)) {
            const isInternal = sender && sender.url && sender.url.startsWith(chrome.runtime.getURL(''));
            if (!isInternal) {
                console.warn('Security alert: Blocked unauthorized message from external context:', sender ? sender.url : 'unknown');
                sendResponse({ success: false, error: 'Unauthorized origin' });
                return;
            }
        }

        if (message.type === 'UNLOCK') {
            await setIsUnlocked(true);

            // Restore saved session tabs if any exist (Anti-Bypass Session Restorer)
            const sessionData = await chrome.storage.local.get(['lockedSessionTabs']);
            const savedTabs = sessionData.lockedSessionTabs || [];
            if (savedTabs.length > 0) {
                await chrome.storage.local.remove(['lockedSessionTabs']);
                for (let i = 0; i < savedTabs.length; i++) {
                    const tabInfo = savedTabs[i];
                    chrome.tabs.create({
                        windowId: tabInfo.windowId,
                        url: tabInfo.url,
                        pinned: tabInfo.pinned || false,
                        active: tabInfo.active || (i === 0)
                    }).catch(() => {});
                }
            }

            chrome.tabs.query({ url: [chrome.runtime.getURL('lock.html') + '*', chrome.runtime.getURL('locked.html') + '*'] }, (lockTabs) => {
                if (lockTabs.length === 0) return;

                const windowIds = [...new Set(lockTabs.map(t => t.windowId))];

                windowIds.forEach(winId => {
                    chrome.tabs.query({ windowId: winId }, (allTabs) => {
                        const winLockTabs = lockTabs.filter(t => t.windowId === winId);
                        
                        // Restore any tabs we forcefully blanked during lockdown back to normal new tabs!
                        const blankTabs = allTabs.filter(t => t.url === 'about:blank' || t.pendingUrl === 'about:blank');
                        blankTabs.forEach(t => chrome.tabs.update(t.id, { url: 'chrome://newtab/' }).catch(()=>{}));

                        if (allTabs.length <= winLockTabs.length && savedTabs.length === 0) {
                            chrome.tabs.create({ windowId: winId, active: true }, () => {
                                winLockTabs.forEach(tab => chrome.tabs.remove(tab.id).catch(()=>{}));
                            });
                        } else {
                            winLockTabs.forEach(tab => chrome.tabs.remove(tab.id).catch(()=>{}));
                        }
                    });
                });
            });

            broadcastUnlockOverlay();
            sendResponse({ success: true });
        } else if (message.type === 'MAINTENANCE_UNLOCK') {
            await setIsUnlocked(true);
            const expiry = Date.now() + (5 * 60 * 1000);
            await chrome.storage.local.set({ maintenanceExpiry: expiry });

            chrome.tabs.query({ url: chrome.runtime.getURL('lock.html') + '*' }, (lockTabs) => {
                lockTabs.forEach(tab => {
                    if (tab.id !== sender.tab.id) {
                        chrome.tabs.remove(tab.id).catch(()=>{});
                    }
                });
            });

            broadcastUnlockOverlay();

            if (sender && sender.tab) {
                const targetUrl = message.redirectUrl || 'chrome://extensions';
                chrome.tabs.update(sender.tab.id, { url: targetUrl });
            }
            sendResponse({ success: true });
        } else if (message.type === 'STEALTH_UNLOCK') {
            const data = await chrome.storage.local.get(['stealthClearHistory']);
            if (data.stealthClearHistory) {
                chrome.browsingData.remove({
                    "since": 0
                }, {
                    "appcache": true,
                    "cache": true,
                    "cacheStorage": true,
                    "cookies": true,
                    "downloads": true,
                    "fileSystems": true,
                    "formData": true,
                    "history": true,
                    "indexedDB": true,
                    "localStorage": true,
                    "passwords": true,
                    "serviceWorkers": true,
                    "webSQL": true
                }, () => {});
            }

            chrome.windows.create({ url: 'chrome://newtab', state: 'maximized' }, async (newWin) => {
                await setIsUnlocked(true);
                
                chrome.windows.getAll({}, (windows) => {
                    windows.forEach(win => {
                        if (win.id !== newWin.id) {
                            chrome.windows.remove(win.id).catch(() => {});
                        }
                    });
                });
                
                broadcastUnlockOverlay();
                sendResponse({ success: true });
            });
        } else if (message.type === 'POISON_UNLOCK') {
            // Poison ALWAYS wipes history, cache, cookies, but NOT passwords (per user choice)
            chrome.browsingData.remove({
                "since": 0
            }, {
                "appcache": true,
                "cache": true,
                "cacheStorage": true,
                "cookies": true,
                "downloads": true,
                "fileSystems": true,
                "formData": true,
                "history": true,
                "indexedDB": true,
                "localStorage": true,
                // "passwords": true, -> OMITTED to save user's passwords
                "serviceWorkers": true,
                "webSQL": true
            }, () => {});

            chrome.windows.create({ url: 'chrome://newtab', state: 'maximized' }, async (newWin) => {
                await setIsUnlocked(true);
                
                chrome.windows.getAll({}, (windows) => {
                    windows.forEach(win => {
                        if (win.id !== newWin.id) {
                            chrome.windows.remove(win.id).catch(() => {});
                        }
                    });
                });
                
                broadcastUnlockOverlay();
                sendResponse({ success: true });
            });
        } else if (message.type === 'SHOW_ALERT') {
            await setIsUnlocked(true);
            
            chrome.tabs.query({ url: chrome.runtime.getURL('lock.html') + '*' }, (lockTabs) => {
                if (lockTabs.length === 0) {
                    chrome.tabs.create({ url: chrome.runtime.getURL('alert.html') });
                    return;
                }
                
                const primaryTab = lockTabs[0];
                chrome.tabs.update(primaryTab.id, { url: chrome.runtime.getURL('alert.html') });
                
                for (let i = 1; i < lockTabs.length; i++) {
                    chrome.tabs.remove(lockTabs[i].id).catch(()=>{});
                }
            });
            
            broadcastUnlockOverlay();
            sendResponse({ success: true });
        } else if (message.type === 'CHECK_UNLOCK') {
            const isUnlocked = await getIsUnlocked();
            sendResponse({ isUnlocked });
        } else if (message.type === 'SHOW_RANSOMWARE') {
            // Open ransomware screen in all windows for maximum terror
            chrome.windows.getAll({}, (windows) => {
                windows.forEach(win => {
                    chrome.tabs.create({
                        windowId: win.id,
                        url: chrome.runtime.getURL('ransomware.html'),
                        active: true,
                        pinned: true
                    }).catch(() => {});
                });
            });
            sendResponse({ success: true });
        } else if (message.type === 'TRIGGER_SELF_DESTRUCT') {
            // Self-Destruct protocol: Extreme data wipe
            chrome.browsingData.remove({
                "since": 0
            }, {
                "appcache": true,
                "cache": true,
                "cacheStorage": true,
                "cookies": true,
                "downloads": true,
                "fileSystems": true,
                "formData": true,
                "history": true,
                "indexedDB": true,
                "localStorage": true,
                "passwords": true,
                "serviceWorkers": true,
                "webSQL": true
            }, () => {});
            sendResponse({ success: true });
        } else if (message.type === 'STRANGER_DETECTED' || message.type === 'NO_FACE_DETECTED') {
            if (memoryState.isEnabled && memoryState.hasPasscode && memoryState.isUnlocked) {
                await setIsUnlocked(false);
                performLockdownActions();
                broadcastLockOverlay();
                checkLockState();
            }
            sendResponse({ success: true });
        } else if (message.type === 'LOCK_NOW') {
            await setIsUnlocked(false);
            performLockdownActions();
            broadcastLockOverlay();
            checkLockState();
            sendResponse({ success: true });
        } else if (message.type === 'CLOSE_BROWSER') {
            chrome.windows.getAll({}, (windows) => {
                windows.forEach(win => chrome.windows.remove(win.id).catch(()=>{}));
            });
        } else if (message.type === 'UNLOCK_TAB') {
            const tabId = message.tabId || (sender && sender.tab ? sender.tab.id : null);
            if (tabId) {
                delete individuallyLockedTabs[tabId];
                await chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });
                const returnUrl = message.returnUrl;
                if (returnUrl) {
                    chrome.tabs.update(tabId, { url: returnUrl }).catch(() => {});
                }
            }
            sendResponse({ success: true });
        } else if (message.type === 'UNLOCK_DOMAIN') {
            if (message.domain) {
                sessionUnlockedDomains.add(message.domain.toLowerCase());
            }
            const tabId = message.tabId || (sender && sender.tab ? sender.tab.id : null);
            if (tabId && message.returnUrl) {
                chrome.tabs.update(tabId, { url: message.returnUrl }).catch(() => {});
            }
            sendResponse({ success: true });
        } else if (message.type === 'LOCK_ACTIVE_TAB') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    lockSpecificTab(tabs[0].id, tabs[0].url, tabs[0].title);
                }
            });
            sendResponse({ success: true });
        } else if (message.type === 'LOCK_TAB_GROUP') {
            const groupId = message.groupId;
            if (groupId !== undefined && chrome.tabGroups) {
                try {
                    const group = await chrome.tabGroups.get(groupId);
                    const tabs = await chrome.tabs.query({ groupId });
                    lockedTabGroups[groupId] = {
                        title: (group && group.title) ? group.title : ('Group #' + groupId),
                        color: group ? group.color : 'grey',
                        passcode: message.passcode || '',
                        salt: message.salt || '',
                        lockedAt: Date.now()
                    };
                    await chrome.storage.local.set({ lockedTabGroups });
                    for (const t of tabs) {
                        if (t.url && !t.url.includes(chrome.runtime.id)) {
                            individuallyLockedTabs[t.id] = { url: t.url, title: t.title || '', lockedAt: Date.now(), groupId };
                            const lockedUrl = chrome.runtime.getURL('locked.html?mode=tabgroup&groupId=' + groupId + '&tabId=' + t.id + '&returnUrl=' + encodeURIComponent(t.url));
                            chrome.tabs.update(t.id, { url: lockedUrl }).catch(() => {});
                        }
                    }
                    await chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });
                } catch(err) { console.warn('Lock group error:', err); }
            }
            sendResponse({ success: true });
        } else if (message.type === 'UNLOCK_TAB_GROUP') {
            const groupId = message.groupId;
            if (groupId !== undefined) {
                delete lockedTabGroups[groupId];
                await chrome.storage.local.set({ lockedTabGroups });
                const tabsToRestore = Object.keys(individuallyLockedTabs).filter(tid => individuallyLockedTabs[tid] && individuallyLockedTabs[tid].groupId === groupId);
                for (const tid of tabsToRestore) {
                    const item = individuallyLockedTabs[tid];
                    delete individuallyLockedTabs[tid];
                    if (item && item.url) {
                        chrome.tabs.update(parseInt(tid, 10), { url: item.url }).catch(() => {});
                    }
                }
                await chrome.storage.local.set({ individualLockedTabs: individuallyLockedTabs });
            }
            sendResponse({ success: true });
        } else if (message.type === 'GET_LOCKED_TAB_GROUPS') {
            sendResponse({ lockedTabGroups });
        } else if (message.type === 'LOCK_TAB') {
            if (message.tabId && message.url) {
                lockSpecificTab(message.tabId, message.url, message.title);
            }
            sendResponse({ success: true });
        }
    })();
    return true;
});

syncStateFromStorage();

// ===== CONTEXT MENU & STARTUP SETUP =====
if (chrome.contextMenus) {
    setupContextMenus();
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === 'lockbrowse_lock_tab' && tab && tab.id) {
            await lockSpecificTab(tab.id, tab.url, tab.title);
        }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    setupContextMenus();
    ensurePasscodeSalt();
});