// popup.js - Real HTML Lock Controller

// 1. If profile is locked, instantly redirect to full HTML lock screen
chrome.runtime.sendMessage({ type: 'CHECK_UNLOCK' }, (response) => {
    if (chrome.runtime.lastError) return;
    if (response && !response.isUnlocked) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('lock.html') });
            } else {
                chrome.tabs.create({ url: chrome.runtime.getURL('lock.html') });
            }
        });
        window.close();
    }
});

// Check if passcode is setup
chrome.storage.local.get(['passcode', 'isEnabled'], (data) => {
    const shieldStatus = document.getElementById('shield-status');
    if (!data.passcode) {
        if (shieldStatus) {
            shieldStatus.textContent = '○ Setup Needed';
            shieldStatus.style.color = '#f59e0b';
        }
    } else if (data.isEnabled === false) {
        if (shieldStatus) {
            shieldStatus.textContent = '○ Paused';
            shieldStatus.style.color = '#94a3b8';
        }
    }
});

// 2. Lock Browser Now (Full Real HTML Lock Screen)
const lockBrowserBtn = document.getElementById('lock-browser-now-btn');
if (lockBrowserBtn) {
    lockBrowserBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'LOCK_NOW' }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('lock.html') });
                }
            });
            window.close();
        });
    });
}

// 3. Lock Active Tab Now (Redirect Tab to locked.html)
const lockActiveTabBtn = document.getElementById('lock-active-tab-btn');
if (lockActiveTabBtn) {
    lockActiveTabBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'LOCK_ACTIVE_TAB' }, () => {
            window.close();
        });
    });
}

// 4. Open Settings & Security Options
const openSettingsBtn = document.getElementById('open-settings-btn');
if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        window.close();
    });
}

// 5. Emergency Wipe (Long Press)
const selfDestructBtn = document.getElementById('selfDestructBtn');
if (selfDestructBtn) {
    let pressTimer = null;
    selfDestructBtn.addEventListener('mousedown', () => {
        pressTimer = setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'SELF_DESTRUCT' });
            window.close();
        }, 2000);
    });
    selfDestructBtn.addEventListener('mouseup', () => {
        if (pressTimer) clearTimeout(pressTimer);
    });
    selfDestructBtn.addEventListener('mouseleave', () => {
        if (pressTimer) clearTimeout(pressTimer);
    });
    selfDestructBtn.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'SELF_DESTRUCT' });
            window.close();
        }, 2000);
    });
    selfDestructBtn.addEventListener('touchend', () => {
        if (pressTimer) clearTimeout(pressTimer);
    });
}
