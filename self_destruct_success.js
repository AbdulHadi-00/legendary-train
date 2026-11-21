document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['selfDestructRecoveryKey']);
    const keyEl = document.getElementById('recovery-key');
    if (keyEl) {
        keyEl.textContent = data.selfDestructRecoveryKey || ('SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase());
    }
});
