
// Theme support for all custom themes. Loaded after options.js.
(function () {
    const themeNames = [
        'gold', 'matrix', 'oled', 'apple',
        'blossom', 'orange', 'sunset',
        'nature', 'peaceful'
    ];

    function applyTheme(theme) {
        if (!themeNames.includes(theme)) theme = 'gold';

        document.body.classList.remove(...themeNames.map(name => `theme-${name}`));
        document.body.classList.add(`theme-${theme}`);

        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === theme);
        });

        const canvas = document.getElementById('matrix-canvas');
        if (canvas) canvas.style.display = theme === 'matrix' ? 'block' : 'none';
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', async () => {
            const theme = card.dataset.theme;
            applyTheme(theme);
            await chrome.storage.local.set({ lockScreenTheme: theme });
        });
    });

    chrome.storage.local.get(['lockScreenTheme'], data => {
        applyTheme(data.lockScreenTheme || 'gold');
    });
})();
