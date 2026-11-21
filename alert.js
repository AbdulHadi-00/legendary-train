document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['intruderSelfie', 'intruderTime', 'maxTries']);
    
    if (data.intruderSelfie) {
        document.getElementById('intruder-photo').src = data.intruderSelfie;
        document.getElementById('incident-time').textContent = data.intruderTime || 'Unknown Time';
        document.getElementById('failed-count').textContent = data.maxTries ? `${data.maxTries}+` : '3+';
    }

    document.getElementById('dismiss-btn').addEventListener('click', async () => {
        // Clear the data
        await chrome.storage.local.remove(['intruderSelfie', 'intruderTime']);
        
        // We are already unlocked by the background script when SHOW_ALERT was processed.
        // We just need to close this alert page and let them go back to their tabs.
        // If there's no other tabs, open a new one.
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (tabs.length <= 1) {
                chrome.tabs.create({ url: 'chrome://newtab' }, () => {
                    window.close();
                });
            } else {
                window.close();
            }
        });
    });
});
