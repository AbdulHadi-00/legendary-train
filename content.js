// content.js - True Anti-Bypass Real HTML Lock Layer

(function () {
    // Don't run on our own internal pages (lock.html, locked.html, options.html)
    if (window.location.href.includes(chrome.runtime.id)) return;

    function redirectToRealHtmlLock() {
        if (window.location.href.includes(chrome.runtime.id)) return;
        if (!window.location.href.startsWith('http')) return;
        
        // True Anti-Bypass: Replace webpage completely with real HTML lock screen
        const returnUrl = encodeURIComponent(window.location.href);
        const lockPage = chrome.runtime.getURL('locked.html?returnUrl=' + returnUrl);
        window.location.replace(lockPage);
    }

    // Check lock status on page load
    chrome.runtime.sendMessage({ type: 'CHECK_UNLOCK' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response && !response.isUnlocked) {
            redirectToRealHtmlLock();
        }
    });

    // Handle BFCache (Back-Forward Cache) to redirect if navigating back to a locked session
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            chrome.runtime.sendMessage({ type: 'CHECK_UNLOCK' }, (response) => {
                if (chrome.runtime.lastError) return;
                if (response && !response.isUnlocked) {
                    redirectToRealHtmlLock();
                }
            });
        }
    });

    // Handle dynamic lock events from background service worker
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'LOCK_OVERLAY') {
            redirectToRealHtmlLock();
        }
    });

    // --- Soft-Blur Privacy Mode (Inactivity preview before lock) ---
    let softBlurTimeout = null;
    let softBlurElement = null;
    let softBlurTime = 0;

    chrome.storage.local.get(['softBlurTime'], (data) => {
        softBlurTime = data.softBlurTime !== undefined ? data.softBlurTime : 30;
        if (softBlurTime > 0) {
            resetSoftBlurTimer();
            window.addEventListener('mousemove', resetSoftBlurTimer, { passive: true });
            window.addEventListener('keydown', resetSoftBlurTimer, { passive: true });
            window.addEventListener('scroll', resetSoftBlurTimer, { passive: true });
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.softBlurTime) {
            softBlurTime = changes.softBlurTime.newValue !== undefined ? changes.softBlurTime.newValue : 30;
            if (softBlurTime === 0) {
                removeSoftBlur();
                if (softBlurTimeout) clearTimeout(softBlurTimeout);
            } else {
                resetSoftBlurTimer();
            }
        }
    });

    function isVideoPlaying() {
        const videos = document.querySelectorAll('video');
        for (let i = 0; i < videos.length; i++) {
            if (!videos[i].paused && !videos[i].ended && videos[i].readyState > 2) {
                return true;
            }
        }
        return false;
    }

    function resetSoftBlurTimer() {
        if (softBlurTime === 0) return;
        removeSoftBlur();
        if (softBlurTimeout) clearTimeout(softBlurTimeout);
        softBlurTimeout = setTimeout(() => {
            if (!isVideoPlaying()) {
                applySoftBlur();
            } else {
                resetSoftBlurTimer();
            }
        }, softBlurTime * 1000);
    }

    function applySoftBlur() {
        if (softBlurElement) return;
        softBlurElement = document.createElement('div');
        softBlurElement.id = 'profile-lock-pro-soft-blur';
        softBlurElement.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483646 !important; backdrop-filter: blur(20px) !important; background: rgba(0,0,0,0.1) !important; pointer-events: none !important; transition: backdrop-filter 0.5s ease, background 0.5s ease !important;';
        document.documentElement.appendChild(softBlurElement);
    }

    function removeSoftBlur() {
        if (softBlurElement) {
            softBlurElement.remove();
            softBlurElement = null;
        }
    }
})();
