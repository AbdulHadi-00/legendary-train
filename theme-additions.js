
// --- Added theme support: Nature Green and Peaceful White ---
(function () {
    const supportedThemes = [
        'gold', 'matrix', 'oled', 'apple',
        'blossom', 'orange', 'sunset',
        'nature', 'peaceful'
    ];

    const root = document.querySelector('[data-theme="nature"]')?.closest('.theme-picker-grid')
        || document.querySelector('.theme-picker-grid');

    if (root) {
        const cards = [
            { theme: 'nature', label: 'Nature Green', color: '#84cc16' },
            { theme: 'peaceful', label: 'Peaceful White', color: 'linear-gradient(135deg, #ffffff, #cbd5e1)' }
        ];

        cards.forEach(({ theme, label, color }) => {
            if (root.querySelector(`[data-theme="${theme}"]`)) return;
            const card = document.createElement('div');
            card.className = 'theme-card';
            card.dataset.theme = theme;
            card.innerHTML = `<div class="theme-preview-dot" style="background:${color};"></div><span style="font-size:0.82rem;font-weight:600;">${label}</span>`;
            root.appendChild(card);
        });
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        if (card.dataset.theme !== 'nature' && card.dataset.theme !== 'peaceful') return;
        card.addEventListener('click', async () => {
            if (!supportedThemes.includes(card.dataset.theme)) return;
            const theme = card.dataset.theme;

            document.body.classList.remove(
                'theme-gold', 'theme-matrix', 'theme-oled', 'theme-apple',
                'theme-blossom', 'theme-orange', 'theme-sunset',
                'theme-nature', 'theme-peaceful'
            );
            document.body.classList.add(`theme-${theme}`);

            document.querySelectorAll('.theme-card').forEach(c => {
                c.classList.toggle('active', c.dataset.theme === theme);
            });

            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                await chrome.storage.local.set({ lockScreenTheme: theme });
            }
        });
    });
})();
