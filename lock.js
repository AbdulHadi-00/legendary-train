const inputs = document.querySelectorAll('.digit-input');
const errorMsg = document.getElementById('error-msg');
const lockoutMsg = document.getElementById('lockout-msg');
const unlockBtn = document.getElementById('unlock-btn');

let lockoutInterval = null;

// ===== THEME APPLICATOR & CYBERPUNK MATRIX RAIN =====
async function initLockTheme() {
    try {
        const data = await chrome.storage.local.get(['lockScreenTheme']);
        const theme = data.lockScreenTheme || 'gold';
        document.body.classList.remove('theme-gold', 'theme-matrix', 'theme-oled', 'theme-apple', 'theme-blossom', 'theme-orange', 'theme-sunset');
        document.body.classList.add(`theme-${theme}`);

        const matrixCanvas = document.getElementById('matrix-canvas');
        if (theme === 'matrix' && matrixCanvas) {
            matrixCanvas.style.display = 'block';
            startMatrixRain(matrixCanvas);
        } else if (matrixCanvas) {
            matrixCanvas.style.display = 'none';
        }
    } catch(e) {
        console.warn('Theme init error:', e);
    }
}

function startMatrixRain(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '0123456789ABCDEFPROFILELOCKPRO1010101XYZ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50);
    }

    function draw() {
        ctx.fillStyle = 'rgba(1, 8, 3, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff66';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
initLockTheme();

async function hashPasscode(passcode) {
    const saltData = await chrome.storage.local.get(['passcodeSalt']);
    const salt = saltData.passcodeSalt || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + passcode);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPasscodeUnsalted(passcode) {
    const encoder = new TextEncoder();
    const data = encoder.encode(passcode);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function checkLockout() {
    const data = await chrome.storage.local.get(['lockoutUntil']);
    if (data.lockoutUntil) {
        const timeLeft = Math.ceil((data.lockoutUntil - Date.now()) / 1000);
        if (timeLeft > 0) {
            startLockoutUI(timeLeft);
        } else {
            chrome.storage.local.remove(['lockoutUntil']);
            enableInputs();
        }
    }
}

function startLockoutUI(seconds) {
    inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.5';
    });
    unlockBtn.disabled = true;
    unlockBtn.style.opacity = '0.5';
    
    if (errorMsg) errorMsg.classList.remove('visible');
    if (lockoutMsg) lockoutMsg.style.display = 'block';

    let remaining = seconds;
    if (lockoutMsg) lockoutMsg.textContent = `Too many failed attempts. Try again in ${remaining}s...`;

    lockoutInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(lockoutInterval);
            chrome.storage.local.remove(['lockoutUntil']);
            enableInputs();
            if (lockoutMsg) lockoutMsg.style.display = 'none';
        } else {
            if (lockoutMsg) lockoutMsg.textContent = `Too many failed attempts. Try again in ${remaining}s...`;
        }
    }, 1000);
}

function enableInputs() {
    inputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
        input.value = "";
    });
    unlockBtn.disabled = false;
    unlockBtn.style.opacity = '1';
    if(inputs.length > 0) inputs[0].focus();
}

checkLockout();

const urlParams = new URLSearchParams(window.location.search);
const isMaintenanceTarget = urlParams.get('target') === 'maintenance';
const lockMode = urlParams.get('mode'); // 'tab' | 'domain' | 'maintenance'
const targetTabId = urlParams.get('tabId');
const returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect');
const lockedDomain = urlParams.get('domain');

function initLockBrowseUI() {
    const h1 = document.getElementById('lock-title') || document.querySelector('h1');
    const subtitle = document.getElementById('lock-subtitle') || document.querySelector('.subtitle');
    const btn = document.getElementById('unlock-btn');

    if (lockMode === 'tab') {
        if (h1) h1.textContent = typeof t === 'function' && t('lock_tab_title') ? t('lock_tab_title') : 'Tab Locked';
        if (subtitle) subtitle.textContent = typeof t === 'function' && t('lock_tab_subtitle') ? t('lock_tab_subtitle') : 'Enter your 8-digit passcode to unlock this tab.';
        if (btn) btn.textContent = typeof t === 'function' && t('btn_unlock_tab') ? t('btn_unlock_tab') : 'Unlock Tab';
    } else if (lockMode === 'domain') {
        if (h1) h1.textContent = typeof t === 'function' && t('lock_domain_title') ? t('lock_domain_title') : 'Domain Protected';
        if (subtitle) {
            subtitle.textContent = lockedDomain 
                ? ('Access to ' + lockedDomain + ' is locked. Enter passcode to proceed.')
                : (typeof t === 'function' && t('lock_domain_subtitle') ? t('lock_domain_subtitle') : 'Access to this website is locked.');
        }
        if (btn) btn.textContent = typeof t === 'function' && t('btn_unlock_domain') ? t('btn_unlock_domain') : 'Unlock Domain & Browse';
    } else if (isMaintenanceTarget) {
        if (h1) h1.textContent = 'Unlock Extensions';
        if (subtitle) subtitle.textContent = 'Enter passcode to manage or remove extensions.';
        if (btn) btn.textContent = 'Authorize Access';
    }
}
initLockBrowseUI();

function createParticles() {
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.opacity = Math.random() * 0.4;
        document.body.appendChild(p);
    }
}
createParticles();


inputs.forEach((input, index) => {
    // Automatically focus next input
    input.addEventListener('input', (e) => {
        // Add micro-interaction "pop" animation
        e.target.classList.remove('type-pop');
        void e.target.offsetWidth; /* trigger reflow */
        e.target.classList.add('type-pop');
        
        // Remove animation class after it finishes
        setTimeout(() => e.target.classList.remove('type-pop'), 350);

        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

async function performFinalUnlock(unlockType) {
    window.isActuallyUnlocked = true;
    const storageData = await chrome.storage.local.get(['intruderSelfie']);
    if (storageData.intruderSelfie && unlockType === 'UNLOCK' && lockMode !== 'tab' && lockMode !== 'domain') {
        chrome.runtime.sendMessage({ type: 'SHOW_ALERT' });
        return;
    }

    if (lockMode === 'tab') {
        chrome.runtime.sendMessage({
            type: 'UNLOCK_TAB',
            tabId: targetTabId ? parseInt(targetTabId, 10) : null,
            returnUrl: returnUrl
        }, (response) => {
            if (returnUrl) {
                window.location.replace(returnUrl);
            }
        });
        return;
    }

    if (lockMode === 'domain') {
        chrome.runtime.sendMessage({
            type: 'UNLOCK_DOMAIN',
            tabId: targetTabId ? parseInt(targetTabId, 10) : null,
            domain: lockedDomain,
            returnUrl: returnUrl
        }, (response) => {
            if (returnUrl) {
                window.location.replace(returnUrl);
            }
        });
        return;
    }

    const redirectUrl = returnUrl || urlParams.get('redirect');
    chrome.runtime.sendMessage({ type: unlockType, redirectUrl }, (response) => {
        if (redirectUrl) {
            window.location.replace(redirectUrl);
        }
    });
    if (redirectUrl) {
        setTimeout(() => {
            window.location.replace(redirectUrl);
        }, 200);
    }
}

async function verifyPasscode() {
    let passcode = "";
    inputs.forEach(input => passcode += input.value);

    // If less than 8 digits entered, trigger shake early
    const passContainer = document.getElementById('passcode-container');
    if (passcode.length < 8) {
        passContainer.classList.remove('error-shake');
        void passContainer.offsetWidth; // trigger reflow
        passContainer.classList.add('error-shake');
        setTimeout(() => passContainer.classList.remove('error-shake'), 500);
        return;
    }

    const data = await chrome.storage.local.get(['passcode', 'isHashed', 'stealthPasscode', 'isStealthEnabled', 'poisonPasscode', 'isPoisonEnabled', 'isTotpEnabled', 'totpSecret']);
    // Secret phrase detection for self-destruct
    const secretPhrase = 'safedestroy'; // This can be customized via storage later
    if (passcode.toLowerCase() === secretPhrase) {
        // Trigger self-destruct without unlocking
        chrome.runtime.sendMessage({ type: 'TRIGGER_SELF_DESTRUCT' });
        return; // Prevent further processing
    }
    let isMatch = false;
    let isStealth = false;
    let isPoison = false;

    const hashedInput = await hashPasscode(passcode);
    const unsaltedInput = await hashPasscodeUnsalted(passcode);

    if (data.isHashed) {
        if (hashedInput === data.passcode) {
            isMatch = true;
        } else if (unsaltedInput === data.passcode) {
            isMatch = true;
            await chrome.storage.local.set({ passcode: hashedInput });
        } else if (data.isStealthEnabled && (hashedInput === data.stealthPasscode || unsaltedInput === data.stealthPasscode)) {
            isMatch = true;
            isStealth = true;
        } else if (data.isPoisonEnabled && (hashedInput === data.poisonPasscode || unsaltedInput === data.poisonPasscode)) {
            isMatch = true;
            isPoison = true;
        }
    } else {
        if (passcode === data.passcode) {
            isMatch = true;
            await chrome.storage.local.set({ passcode: hashedInput, isHashed: true });
        }
    }

    if (isMatch) {
        await chrome.storage.local.remove(['failedAttempts', 'lockoutCount']);
        stopSiren();

        let unlockType = isMaintenanceTarget ? 'MAINTENANCE_UNLOCK' : 'UNLOCK';
        if (isStealth) {
            unlockType = 'STEALTH_UNLOCK';
        } else if (isPoison) {
            unlockType = 'POISON_UNLOCK';
        }

        // Check if 2FA TOTP is required
        if (data.isTotpEnabled && data.totpSecret && !isStealth && !isPoison) {
            const passContainer = document.getElementById('passcode-container');
            const mainUnlockBtn = document.getElementById('unlock-btn');
            const totpPanel = document.getElementById('totp-lock-panel');
            const totpInput = document.getElementById('totp-lock-input');
            const totpBtn = document.getElementById('totp-lock-btn');
            const totpError = document.getElementById('totp-error-msg');

            if (passContainer) passContainer.style.display = 'none';
            if (mainUnlockBtn) mainUnlockBtn.style.display = 'none';
            if (errorMsg) errorMsg.classList.remove('visible');

            if (totpPanel) totpPanel.style.display = 'block';
            if (totpInput) totpInput.focus();

            const executeTotpVerify = async () => {
                const code = totpInput.value.trim();
                if (code.length !== 6) {
                    if (totpError) {
                        totpError.textContent = "Please enter 6 digits.";
                        totpError.style.display = 'block';
                    }
                    return;
                }

                if (typeof TOTP !== 'undefined') {
                    const isValid = await TOTP.verifyTOTP(data.totpSecret, code);
                    if (isValid) {
                        performFinalUnlock(unlockType);
                    } else {
                        if (totpError) {
                            totpError.textContent = "Invalid 2FA Authenticator Code.";
                            totpError.style.display = 'block';
                        }
                    }
                }
            };

            if (totpBtn) totpBtn.onclick = executeTotpVerify;
            if (totpInput) {
                totpInput.onkeydown = (e) => {
                    if (e.key === 'Enter') executeTotpVerify();
                };
            }
            return;
        }

        performFinalUnlock(unlockType);
    } else {
        const attemptData = await chrome.storage.local.get(['failedAttempts', 'maxTries', 'lockoutCount', 'isSirenEnabled', 'isSelfieEnabled']);
        let failedAttempts = (attemptData.failedAttempts || 0) + 1;
        const maxTries = attemptData.maxTries || 5;
        await chrome.storage.local.set({ failedAttempts });

        // Incorrect passcode - Visual Shake Feedback
        passContainer.classList.remove('error-shake');
        void passContainer.offsetWidth; // trigger reflow
        passContainer.classList.add('error-shake');
        
        setTimeout(() => passContainer.classList.remove('error-shake'), 500);

        await logIntruderAttempt(passcode);

        if (failedAttempts >= 3 && attemptData.isSelfieEnabled) {
            captureIntruderSelfie(passcode);
        }

        // Stealth Audio Recording: after 3 fails, record 15s of audio
        if (failedAttempts >= 3) {
            captureIntruderAudio();
        }

        // Fake Ransomware Screen: after 5 cumulative fails, deploy terror screen
        const cumulativeData = await chrome.storage.local.get(['isRansomwareEnabled', 'isSelfDestructEnabled', 'totalFailedAttempts']);
        let totalFails = (cumulativeData.totalFailedAttempts || 0) + 1;
        await chrome.storage.local.set({ totalFailedAttempts: totalFails });
        
        if (totalFails >= 5 && cumulativeData.isRansomwareEnabled) {
            chrome.runtime.sendMessage({ type: 'SHOW_RANSOMWARE' });
        }

        // Self-Destruct (Data Wipe): after 10 cumulative fails
        if (totalFails >= 10 && cumulativeData.isSelfDestructEnabled) {
            chrome.runtime.sendMessage({ type: 'TRIGGER_SELF_DESTRUCT' });
        }

        if (failedAttempts >= maxTries) {
            // Visual feedback
            errorMsg.classList.add('visible');
            errorMsg.style.fontWeight = 'normal';
            errorMsg.textContent = "Incorrect passcode.";
            inputs.forEach(input => input.value = "");
            setTimeout(() => {
                errorMsg.classList.remove('visible');
                errorMsg.textContent = "Incorrect passcode. Try again.";
            }, 3000);

            // Start dynamic lockout logic with +10s increment per lockout
            const penaltyData = await chrome.storage.local.get(['penaltyTime', 'isSirenEnabled']);
            const basePenalty = penaltyData.penaltyTime || 15;
            let lockoutCount = (attemptData.lockoutCount || 0) + 1;
            
            let penaltySeconds = basePenalty + ((lockoutCount - 1) * 10);
            if (penaltySeconds > 3600) penaltySeconds = 3600; // Cap at 1 hour

            const lockoutTime = Date.now() + (penaltySeconds * 1000);
            chrome.storage.local.set({ lockoutUntil: lockoutTime, lockoutCount: lockoutCount });
            await chrome.storage.local.remove('failedAttempts');
            
            if (penaltyData.isSirenEnabled) {
                playSiren(penaltySeconds);
            }
            
            if(typeof startLockoutUI === 'function') startLockoutUI(penaltySeconds);
        } else {
            if (attemptData.isSirenEnabled) {
                playSiren(1.5);
            }
            // Visual feedback
            const remaining = maxTries - failedAttempts;
            errorMsg.classList.add('visible');
            
            if (remaining <= 2) {
                errorMsg.style.fontWeight = 'bold';
                errorMsg.textContent = `FINAL WARNING: ${remaining} ${remaining === 1 ? 'try' : 'tries'} remaining!`;
            } else {
                errorMsg.style.fontWeight = 'normal';
                errorMsg.textContent = `Incorrect passcode. ${remaining} tries remaining.`;
            }
            
            inputs.forEach(input => input.value = "");
            setTimeout(() => {
                errorMsg.classList.remove('visible');
                errorMsg.style.fontWeight = 'normal';
                errorMsg.textContent = "Incorrect passcode. Try again.";
            }, 3000);
        }
    }
}

unlockBtn.addEventListener('click', verifyPasscode);

// ===== INTRUDER FORENSIC LOGGING & INSTANT EMAIL ALERT =====
async function logIntruderAttempt(enteredCode) {
    try {
        const timestamp = new Date().toLocaleString();
        const incident = {
            id: Date.now(),
            timestamp: timestamp,
            attemptedCode: enteredCode || 'Unknown',
            device: navigator.platform + ' (' + (navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome') + ')',
            selfie: null,
            audio: null
        };

        const data = await chrome.storage.local.get(['intruderLogs']);
        let logs = data.intruderLogs || [];
        logs.unshift(incident);
        if (logs.length > 25) logs = logs.slice(0, 25);
        await chrome.storage.local.set({ intruderLogs: logs, activeIncidentId: incident.id });
        return incident;
    } catch(e) {
        console.warn('Logging attempt failed:', e);
    }
}

async function sendIntruderEmailAlert(selfieUrl, attemptedCode, timestamp) {
    try {
        const data = await chrome.storage.local.get(['recoveryEmail', 'isLinked', 'emailjsPublicKey', 'emailjsServiceId', 'emailjsTemplateId']);
        const email = data.recoveryEmail;
        if (!email) return;

        const device = navigator.platform + ' (' + (navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome') + ')';

        const pubKey = data.emailjsPublicKey || (typeof EMAILJS_PUBLIC_KEY !== 'undefined' ? EMAILJS_PUBLIC_KEY : null);
        const srvId = data.emailjsServiceId || (typeof EMAILJS_SERVICE_ID !== 'undefined' ? EMAILJS_SERVICE_ID : null);
        const tplId = data.emailjsTemplateId || (typeof EMAILJS_TEMPLATE_ID !== 'undefined' ? EMAILJS_TEMPLATE_ID : null);

        if (pubKey && pubKey !== "YOUR_PUBLIC_KEY_HERE") {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: srvId,
                    template_id: tplId,
                    user_id: pubKey,
                    template_params: {
                        to_email: email,
                        subject: '🚨 SECURITY ALERT: Unauthorized Intruder Attempt Detected',
                        attempt_time: timestamp,
                        attempted_passcode: attemptedCode || 'Incorrect digits',
                        device_info: device,
                        message: `Profile Lock Pro alert: 3 consecutive failed passcode attempts detected at ${timestamp}. Attempted digits: ${attemptedCode}. Intruder photo was captured and archived.`
                    }
                })
            }).catch(e => console.warn('EmailJS alert failed:', e));
        }

        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'H_icon.png',
                title: '🚨 Intruder Alert Dispatched',
                message: `Intruder photo & attempt logged. Alert dispatched to ${email}.`
            });
        }
    } catch (e) {
        console.error('Email alert error:', e);
    }
}

let capturedSelfieUrl = null;
async function captureIntruderSelfie(attemptedCode = '') {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.style.position = 'absolute';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);
        
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
            await video.play();
            
            // Give the webcam 500ms to adjust exposure and render the first frame
            setTimeout(async () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                
                capturedSelfieUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // Stop the webcam to turn off LED
                stream.getTracks().forEach(track => track.stop());

                // Save to storage with timestamp
                const timestamp = new Date().toLocaleString();
                await chrome.storage.local.set({ 
                    intruderSelfie: capturedSelfieUrl, 
                    intruderTime: timestamp 
                });

                // Attach selfie to the latest intruderLogs entry
                try {
                    const logData = await chrome.storage.local.get(['intruderLogs']);
                    let logs = logData.intruderLogs || [];
                    if (logs.length > 0) {
                        logs[0].selfie = capturedSelfieUrl;
                        await chrome.storage.local.set({ intruderLogs: logs });
                    }
                } catch(err) {
                    console.warn('Could not attach selfie to logs:', err);
                }

                // Dispatch instant email alert to Google recovery address
                sendIntruderEmailAlert(capturedSelfieUrl, attemptedCode, timestamp);
                
                // Download immediately on the device
                try {
                    chrome.downloads.download({
                        url: capturedSelfieUrl,
                        filename: `Intruder_Capture_${new Date().getTime()}.jpg`,
                        saveAs: false
                    });
                } catch (err) {
                    console.error("Auto-download failed:", err);
                }
                
                // Cleanup
                video.remove();
            }, 500);
        };
    } catch (e) {
        console.error("Selfie capture failed:", e);
    }
}

// Toggle PIN visibility
const togglePinBtn = document.getElementById('toggle-pin');
const eyeIcon = document.getElementById('eye-icon');

const eyeSvg = `<path d="M247.31,124.76c-.35-.79-8.82-19.16-27.65-36.69C200.77,71.05,170.19,56,128,56S55.23,71.05,36.34,88.07C17.51,105.6,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.16,27.65,36.69C55.23,184.95,85.81,200,128,200s72.77-15.05,91.66-32.07c18.83-17.53,27.3-35.9,27.65-36.69A8,8,0,0,0,247.31,124.76ZM128,184c-34.58,0-61.16-12.89-79-29.53C35.05,141.28,28.27,128,24.89,128c3.38,0,10.16-13.28,24.08-26.47C66.84,84.89,93.42,72,128,72s61.16,12.89,79,29.53c13.92,13.19,20.7,26.47,24.08,26.47-3.38,0-10.16,13.28-24.08,26.47C189.16,171.11,162.58,184,128,184Zm0-96a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"></path>`;
const eyeOffSvg = `<path d="M228,175a8,8,0,0,1-10.92,3L201.15,169c-20,15.19-45.69,23-73.15,23-42.19,0-72.77-15.05-91.66-32.07C17.51,142.4,9,124,8.69,123.24a8,8,0,0,1,0-6.48c.35-.79,2.83-6.14,8.44-12.28L18.15,105l-8.07-4.66a8,8,0,1,1,8-13.85l210,121.24A8,8,0,0,1,228,175ZM128,72c34.58,0,61.16,12.89,79,29.53a105.47,105.47,0,0,1,14.65,16.4l29.27,16.9a8,8,0,1,0,8-13.85l-19.14-11c-.35-.79-8.82-19.16-27.65-36.69C193.23,54.21,162.65,40,120.46,40a120.91,120.91,0,0,0-51.52,11.3l20.4,11.78A105,105,0,0,1,128,72Zm24,56a24,24,0,0,0-24-24,24.3,24.3,0,0,0-6.1.79l29.31,16.92A23.86,23.86,0,0,0,152,128Zm-24,56c23,0,44.75-6.28,62.19-17.75l-21.72-12.54a40,40,0,0,1-57.81-33.37L48.9,84.14C35,97.33,28.27,110.61,24.89,113.81c3.38,0,10.16,13.28,24.08,26.47C66.84,156.92,93.42,169.81,128,184Z"></path>`;

togglePinBtn.addEventListener('click', () => {
    const isPassword = inputs[0].type === 'password';
    inputs.forEach(input => {
        input.type = isPassword ? 'text' : 'password';
    });
    eyeIcon.innerHTML = isPassword ? eyeOffSvg : eyeSvg;
});

// Security: Intercept beforeunload to prevent closing or bypassing while locked
window.isActuallyUnlocked = false;
window.addEventListener('beforeunload', (e) => {
    if (!window.isActuallyUnlocked) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Security: Suppress Right-Click to prevent easy DevTools access
document.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

// Security: Comprehensive shortcut suppression (DevTools, View Source, Tab Close, Navigation)
document.addEventListener('keydown', (e) => {
    const isBypassKey = (
        e.key === 'F12' || e.key === 'F1' || e.key === 'F3' || e.key === 'F6' || e.key === 'F11' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'Del' || e.key === 'Delete')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'h' || e.key === 'H' || e.key === 'j' || e.key === 'J' || e.key === 'w' || e.key === 'W')) ||
        (e.ctrlKey && (e.key === 'F4' || e.key === 'f4')) ||
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home'))
    );

    if (isBypassKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    if (e.key === 'Enter') {
        verifyPasscode();
    }
});

// Forgot Passcode / Backup Recovery Logic
const forgotLink = document.getElementById('forgot-passcode-link');
const backupContainer = document.getElementById('backup-code-container');
const backupInput = document.getElementById('backup-input');
const backupUnlockBtn = document.getElementById('backup-unlock-btn');

const securityQuestionPanel = document.getElementById('security-question-panel');
const securityQuestionText = document.getElementById('lock-security-question');
const securityAnswerInput = document.getElementById('security-answer-input');
const securityAnswerBtn = document.getElementById('security-answer-btn');
const securityErrorMsg = document.getElementById('security-error-msg');

forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    backupContainer.style.display = backupContainer.style.display === 'none' ? 'block' : 'none';
    if (backupContainer.style.display === 'block') {
        // Load recovery email for 2FA panel
        const authData = await chrome.storage.local.get(['recoveryEmail', 'isLinked']);
        const twofaTargetEmail = document.getElementById('twofa-target-email');
        const twofaSendBtn = document.getElementById('twofa-send-code-btn');
        const twofaDescText = document.getElementById('twofa-desc-text');
        
        if (twofaTargetEmail && twofaSendBtn) {
            if (authData.recoveryEmail) {
                twofaTargetEmail.textContent = authData.recoveryEmail;
                twofaSendBtn.disabled = false;
                twofaSendBtn.style.opacity = '1';
                twofaSendBtn.style.cursor = 'pointer';
            } else {
                twofaTargetEmail.textContent = 'No Google recovery account linked';
                twofaSendBtn.disabled = true;
                twofaSendBtn.style.opacity = '0.5';
                twofaSendBtn.style.cursor = 'not-allowed';
                if (twofaDescText) {
                    twofaDescText.innerHTML = 'No recovery account linked. Please link a Google account in settings, or use backup codes / security questions below.';
                }
            }
        }

        const data = await chrome.storage.local.get(['securityQuestion', 'securityAnswerHash']);
        if (data.securityQuestion && data.securityAnswerHash) {
            securityQuestionPanel.style.display = 'block';
            securityQuestionText.textContent = data.securityQuestion;
        } else {
            securityQuestionPanel.style.display = 'none';
        }
        
        forgotLink.textContent = "Back to PIN";
    } else {
        forgotLink.textContent = "Forgot Passcode?";
        inputs[0].focus();
    }
});

// ===== 2FA EMAIL ONE-TIME CODE RECOVERY =====
const twofaSendBtn = document.getElementById('twofa-send-code-btn');
const twofaVerifyBtn = document.getElementById('twofa-verify-btn');
const twofaCodeInput = document.getElementById('twofa-code-input');
const twofaInputGroup = document.getElementById('twofa-input-group');
const twofaStatusMsg = document.getElementById('twofa-status-msg');

function generateAlphanumeric2FACode(length = 6) {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude confusing chars like 0, O, 1, I
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

if (twofaSendBtn) {
    twofaSendBtn.addEventListener('click', async () => {
        const data = await chrome.storage.local.get(['recoveryEmail', 'isLinked']);
        const recoveryEmail = data.recoveryEmail;

        if (!recoveryEmail) {
            alert('No recovery email found. Please link your Google account in options.');
            return;
        }

        const originalBtnText = twofaSendBtn.innerHTML;
        twofaSendBtn.innerHTML = '<span class="spinner"></span> Generating & Sending 2FA Code...';
        twofaSendBtn.disabled = true;
        if (twofaStatusMsg) twofaStatusMsg.style.display = 'none';

        try {
            // 1. Generate a random one-time alphanumeric code
            const code = generateAlphanumeric2FACode(6);

            // 2. Hash code and store in local storage with 10-minute expiry
            const hashedCode = await hashPasscode(code);
            await chrome.storage.local.set({
                oneTime2FACodeHash: hashedCode,
                oneTime2FAExpiry: Date.now() + (10 * 60 * 1000) // 10 minutes
            });

            // 3. Attempt delivery via EmailJS if configured
            try {
                const emailConfig = await chrome.storage.local.get(['emailjsPublicKey', 'emailjsServiceId', 'emailjsTemplateId']);
                const pubKey = emailConfig.emailjsPublicKey || (typeof EMAILJS_PUBLIC_KEY !== 'undefined' ? EMAILJS_PUBLIC_KEY : null);
                const srvId = emailConfig.emailjsServiceId || (typeof EMAILJS_SERVICE_ID !== 'undefined' ? EMAILJS_SERVICE_ID : null);
                const tplId = emailConfig.emailjsTemplateId || (typeof EMAILJS_TEMPLATE_ID !== 'undefined' ? EMAILJS_TEMPLATE_ID : null);

                if (pubKey && pubKey !== "YOUR_PUBLIC_KEY_HERE") {
                    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            service_id: srvId,
                            template_id: tplId,
                            user_id: pubKey,
                            template_params: {
                                to_email: recoveryEmail,
                                one_time_code: code,
                                backup_code_1: code,
                                message: `Your one-time 2FA recovery code is: ${code}. It expires in 10 minutes.`
                            }
                        })
                    });
                }
            } catch (err) {
                console.warn('EmailJS send error:', err);
            }

            // 4. Update UI - Inform user that code was dispatched to their email (without leaking the code!)
            if (twofaInputGroup) twofaInputGroup.style.display = 'block';
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#34A853';
                twofaStatusMsg.innerHTML = `✅ One-time 2FA code generated and dispatched to <strong>${recoveryEmail}</strong>!<br><span style="color: var(--text-muted); font-size: 0.8rem;">Please check your inbox (and spam folder) and enter the code below.</span>`;
            }

            twofaSendBtn.innerHTML = 'Resend One-Time Code';
            twofaSendBtn.disabled = false;
            if (twofaCodeInput) {
                twofaCodeInput.value = '';
                twofaCodeInput.focus();
            }

        } catch (error) {
            console.error('Failed to generate/send 2FA code:', error);
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#ef4444';
                twofaStatusMsg.textContent = `Error: ${error.message}`;
            }
            twofaSendBtn.innerHTML = originalBtnText;
            twofaSendBtn.disabled = false;
        }
    });
}

if (twofaVerifyBtn) {
    const handle2FAVerify = async () => {
        if (!twofaCodeInput) return;
        const enteredCode = twofaCodeInput.value.trim().toUpperCase();

        if (!enteredCode) {
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#ef4444';
                twofaStatusMsg.textContent = 'Please enter your one-time alphanumeric code.';
            }
            twofaCodeInput.focus();
            return;
        }

        const data = await chrome.storage.local.get(['oneTime2FACodeHash', 'oneTime2FAExpiry']);

        if (!data.oneTime2FACodeHash) {
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#ef4444';
                twofaStatusMsg.textContent = 'No active 2FA code found. Please click "Send One-Time 2FA Code" first.';
            }
            return;
        }

        if (Date.now() > (data.oneTime2FAExpiry || 0)) {
            // Delete expired code
            await chrome.storage.local.remove(['oneTime2FACodeHash', 'oneTime2FAExpiry']);
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#ef4444';
                twofaStatusMsg.textContent = 'This 2FA code has expired. Please request a new code.';
            }
            return;
        }

        const hashedEntered = await hashPasscode(enteredCode);

        if (hashedEntered === data.oneTime2FACodeHash) {
            // One-time code verified!
            // DELETE the one-time code immediately so it cannot be reused
            await chrome.storage.local.remove(['oneTime2FACodeHash', 'oneTime2FAExpiry']);

            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#34A853';
                twofaStatusMsg.textContent = '✅ 2FA Verified! One-time code deleted. Unlocking profile...';
            }

            alert('✅ 2FA Code Verified! One-time code has been deleted. Unlocking profile...');
            chrome.runtime.sendMessage({ type: 'UNLOCK' });
        } else {
            if (twofaStatusMsg) {
                twofaStatusMsg.style.display = 'block';
                twofaStatusMsg.style.color = '#ef4444';
                twofaStatusMsg.textContent = '❌ Invalid 2FA code. Please check and try again.';
            }
            twofaCodeInput.value = '';
            twofaCodeInput.focus();
        }
    };

    twofaVerifyBtn.addEventListener('click', handle2FAVerify);

    if (twofaCodeInput) {
        twofaCodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handle2FAVerify();
            }
        });
    }
}

backupUnlockBtn.addEventListener('click', async () => {
    const enteredCode = backupInput.value.trim();
    if (!enteredCode) return;

    const data = await chrome.storage.local.get(['backupVault', 'backupCode']);
    const hashedEntered = await hashPasscode(enteredCode);

    let isMatch = false;

    // Check against new vaulted hashes
    if (data.backupVault && Array.isArray(data.backupVault)) {
        isMatch = data.backupVault.includes(hashedEntered);
    } 
    // Legacy support for single backup code (auto-hash migration not possible here without knowing the code)
    else if (data.backupCode && enteredCode === data.backupCode) {
        isMatch = true;
    }

    if (isMatch) {
        // Correct backup code!
        alert('Backup code verified! Unlocking profile...');
        chrome.runtime.sendMessage({ type: 'UNLOCK' }, (response) => {
            if (response && response.success) {
                // Success
            }
        });
    } else {
        alert('Invalid backup code. Please check your recovery vault card.');
        backupInput.value = "";
        backupInput.focus();
    }
});

securityAnswerBtn.addEventListener('click', async () => {
    const enteredAnswer = securityAnswerInput.value.trim();
    if (!enteredAnswer) return;

    const data = await chrome.storage.local.get(['securityAnswerHash']);
    const hashedAnswer = await hashPasscode(enteredAnswer);

    if (hashedAnswer === data.securityAnswerHash) {
        // Correct security answer!
        securityErrorMsg.style.display = 'none';
        alert('Security Answer verified! Unlocking profile...');
        chrome.runtime.sendMessage({ type: 'UNLOCK' });
    } else {
        securityErrorMsg.style.display = 'block';
        securityErrorMsg.textContent = "Incorrect answer.";
        securityAnswerInput.value = "";
        securityAnswerInput.focus();
        setTimeout(() => securityErrorMsg.style.display = 'none', 3000);
    }
});

// Fetch and display active Chrome profile on the lock screen
if (chrome.identity && chrome.identity.getProfileUserInfo) {
    chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
        if (userInfo && userInfo.email) {
            const badge = document.getElementById('dynamic-user-badge');
            const emailText = document.getElementById('lock-user-email');
            const avatarImg = document.getElementById('lock-user-avatar');
            
            if (badge && emailText && avatarImg) {
                emailText.textContent = userInfo.email;
                const initials = userInfo.email.substring(0, 2).toUpperCase();
                avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=c5a059&color=050a08&size=64&bold=true`;
                badge.style.display = 'flex';
            }
        }
    });
}
let sirenContext = null;
let sirenOscillator = null;
let sirenInterval = null;

function playSiren(durationSeconds) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    try {
        if (!sirenContext) {
            sirenContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (sirenContext.state === 'suspended') {
            sirenContext.resume();
        }

        sirenOscillator = sirenContext.createOscillator();
        const gainNode = sirenContext.createGain();
        
        sirenOscillator.type = 'square';
        sirenOscillator.connect(gainNode);
        gainNode.connect(sirenContext.destination);
        
        // Max volume
        gainNode.gain.setValueAtTime(1, sirenContext.currentTime);

        sirenOscillator.start();

        // Alternating high/low pitch
        let isHigh = true;
        sirenInterval = setInterval(() => {
            if (isHigh) {
                sirenOscillator.frequency.setValueAtTime(800, sirenContext.currentTime);
            } else {
                sirenOscillator.frequency.setValueAtTime(600, sirenContext.currentTime);
            }
            isHigh = !isHigh;
        }, 400);

        setTimeout(() => {
            stopSiren();
        }, durationSeconds * 1000);
    } catch(e) {
        // ignore audio errors
    }
}

function stopSiren() {
    if (sirenInterval) clearInterval(sirenInterval);
    if (sirenOscillator) {
        try {
            sirenOscillator.stop();
            sirenOscillator.disconnect();
        } catch(e){}
        sirenOscillator = null;
    }
}

// ===== STEALTH AUDIO RECORDING =====
let isRecordingAudio = false;
async function captureIntruderAudio() {
    if (isRecordingAudio) return;
    const data = await chrome.storage.local.get(['isAudioEnabled']);
    if (!data.isAudioEnabled) return;
    isRecordingAudio = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            isRecordingAudio = false;
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result;
                await chrome.storage.local.set({
                    intruderAudio: dataUrl,
                    intruderAudioTime: new Date().toLocaleString()
                });
                try {
                    const logData = await chrome.storage.local.get(['intruderLogs']);
                    let logs = logData.intruderLogs || [];
                    if (logs.length > 0) {
                        logs[0].audio = dataUrl;
                        await chrome.storage.local.set({ intruderLogs: logs });
                    }
                } catch(logErr) {
                    console.warn('Could not attach audio to logs:', logErr);
                }
                try {
                    chrome.downloads.download({
                        url: dataUrl,
                        filename: `Intruder_Audio_${Date.now()}.webm`,
                        saveAs: false
                    });
                } catch(err) { console.error('Audio download failed:', err); }
            };
            reader.readAsDataURL(blob);
        };
        mediaRecorder.start();
        setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 15000);
    } catch(e) {
        console.error('Audio capture failed:', e);
        isRecordingAudio = false;
    }
}

// ===== VOICE UNLOCK =====
const voiceUnlockPanel  = document.getElementById('voice-unlock-panel');
const voiceUnlockBtn    = document.getElementById('voice-unlock-btn');
const voiceVisualizer   = document.getElementById('voice-visualizer');
const voiceWaveCanvas   = document.getElementById('voice-waveform');
const voiceResultCont   = document.getElementById('voice-result-container');
const voiceResultText   = document.getElementById('voice-result-text');
const voiceSuccessIcon  = document.getElementById('voice-success-icon');
const voiceFailIcon     = document.getElementById('voice-fail-icon');
const voiceErrMsg       = document.getElementById('voice-error-msg');

let voiceAnimFrame = null;

function startWaveformDraw(analyser, canvas) {
    canvas.width  = canvas.offsetWidth  * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx    = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const data   = new Uint8Array(bufLen);
    function draw() {
        voiceAnimFrame = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(data);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth   = 3;
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        const slice = canvas.width / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
            const y = (data[i] / 128.0) * (canvas.height / 2);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += slice;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    draw();
}

function stopWaveformDraw() {
    if (voiceAnimFrame) { cancelAnimationFrame(voiceAnimFrame); voiceAnimFrame = null; }
}

// Show voice panel when the forgot-passcode container opens (handled below)
async function showVoicePanel() {
    const d = await chrome.storage.local.get(['voiceUnlockPhrase']);
    if (d.voiceUnlockPhrase && voiceUnlockPanel) {
        voiceUnlockPanel.style.display = 'block';
    }
}

// Hook: extend the forgotLink click to also show voice panel
const _forgotLink = document.getElementById('forgot-passcode-link');
if (_forgotLink) {
    _forgotLink.addEventListener('click', () => {
        const container = document.getElementById('backup-code-container');
        if (container && container.style.display !== 'none') showVoicePanel();
    });
}

if (voiceUnlockBtn) {
    voiceUnlockBtn.addEventListener('click', async () => {
        // Reset
        voiceResultCont.style.display  = 'none';
        voiceSuccessIcon.style.display = 'none';
        voiceFailIcon.style.display    = 'none';
        voiceErrMsg.style.display      = 'none';
        voiceResultText.textContent    = '';

        const stored = await chrome.storage.local.get(['voiceUnlockPhrase']);
        if (!stored.voiceUnlockPhrase) {
            voiceErrMsg.textContent = 'Voice unlock not set up in Options.';
            voiceErrMsg.style.display = 'block';
            return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            voiceErrMsg.textContent = 'Speech recognition not supported here.';
            voiceErrMsg.style.display = 'block';
            return;
        }

        // Show live waveform ONLY — no text yet
        voiceVisualizer.style.display = 'block';
        voiceUnlockBtn.disabled = true;
        voiceUnlockBtn.innerHTML = '&#x1F534; Listening...';
        voiceUnlockBtn.style.color = '#ff4d4d';
        voiceUnlockBtn.style.borderColor = 'rgba(255,77,77,0.5)';

        let micStream = null, audioCtx = null;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
            const src = audioCtx.createMediaStreamSource(micStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            src.connect(analyser);
            startWaveformDraw(analyser, voiceWaveCanvas);
        } catch(e) { console.error('Waveform mic error:', e); }

        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = false;   // NO live text shown while speaking
        recognition.maxAlternatives = 5;
        recognition.continuous = false;

        function cleanup() {
            stopWaveformDraw();
            if (micStream) micStream.getTracks().forEach(t => t.stop());
            if (audioCtx)  audioCtx.close().catch(()=>{});
            voiceVisualizer.style.display = 'none';
            voiceUnlockBtn.disabled = false;
            voiceUnlockBtn.innerHTML = '&#x1F3A4; Try Again';
            voiceUnlockBtn.style.color = '#10b981';
            voiceUnlockBtn.style.borderColor = 'rgba(16,185,129,0.4)';
        }

        recognition.onresult = (event) => {
            cleanup();
            const stored_phrase = stored.voiceUnlockPhrase.toLowerCase().trim();
            let matched = false;
            let bestTranscript = '';

            for (let i = 0; i < event.results[0].length; i++) {
                const t = event.results[0][i].transcript.trim();
                if (!bestTranscript) bestTranscript = t;
                if (t.toLowerCase() === stored_phrase) { matched = true; bestTranscript = t; break; }
            }

            // Now show the recognised text as a preview
            voiceResultCont.style.display = 'block';
            voiceResultText.textContent   = `"${bestTranscript}"`;

            if (matched) {
                voiceResultText.style.color    = '#10b981';
                voiceSuccessIcon.style.display = 'block';
                setTimeout(() => chrome.runtime.sendMessage({ type: 'UNLOCK' }), 1200);
            } else {
                voiceResultText.style.color  = '#ff4d4d';
                voiceFailIcon.style.display  = 'block';
                voiceErrMsg.textContent      = 'Phrase did not match. Try again.';
                voiceErrMsg.style.display    = 'block';
                setTimeout(() => voiceErrMsg.style.display = 'none', 4000);
            }
        };

        recognition.onerror = (e) => {
            cleanup();
            voiceErrMsg.textContent = `Error: ${e.error}. Please try again.`;
            voiceErrMsg.style.display = 'block';
            setTimeout(() => voiceErrMsg.style.display = 'none', 4000);
        };

        recognition.onend = cleanup;
        recognition.start();
    });
}

// ===== FACE UNLOCK LOGIC =====
const faceUnlockBtn = document.getElementById('face-unlock-btn');
const lockFaceContainer = document.getElementById('face-unlock-container');
const lockFaceVideo = document.getElementById('lock-face-video');
const lockFaceCanvas = document.getElementById('lock-face-canvas');
const lockFaceStatus = document.getElementById('lock-face-status');
const faceErrorMsg = document.getElementById('face-error-msg');

let lockFaceModelsLoaded = false;
let lockFaceStream = null;

async function loadLockFaceModels() {
    if (lockFaceModelsLoaded) return true;
    try {
        lockFaceStatus.textContent = "Loading AI Models...";
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        lockFaceModelsLoaded = true;
        return true;
    } catch (err) {
        console.error("Failed to load models:", err);
        lockFaceStatus.textContent = "Error loading AI models.";
        return false;
    }
}

if (faceUnlockBtn) {
    faceUnlockBtn.addEventListener('click', async () => {
        const stored = await chrome.storage.local.get(['faceDescriptor']);
        if (!stored.faceDescriptor) {
            faceErrorMsg.textContent = 'Face unlock not set up in Options.';
            faceErrorMsg.style.display = 'block';
            setTimeout(() => faceErrorMsg.style.display = 'none', 4000);
            return;
        }

        lockFaceContainer.style.display = 'flex';
        faceUnlockBtn.style.display = 'none';
        faceErrorMsg.style.display = 'none';

        const loaded = await loadLockFaceModels();
        if (!loaded) return;

        try {
            lockFaceStream = await navigator.mediaDevices.getUserMedia({ video: true });
            lockFaceVideo.srcObject = lockFaceStream;
            lockFaceStatus.textContent = "Scanning face...";
            
            lockFaceVideo.addEventListener('play', () => {
                const displaySize = { width: lockFaceVideo.width, height: lockFaceVideo.height };
                faceapi.matchDimensions(lockFaceCanvas, displaySize);
                
                const savedDescriptor = new Float32Array(stored.faceDescriptor);
                let scanAttempts = 0;

                const scanInterval = setInterval(async () => {
                    if (!lockFaceStream || scanAttempts > 20) {
                        clearInterval(scanInterval);
                        if (scanAttempts > 20) {
                            lockFaceStatus.textContent = "Face not recognized.";
                            lockFaceStatus.style.color = "#ef4444";
                            setTimeout(cleanupLockFace, 2000);
                        }
                        return;
                    }
                    scanAttempts++;
                    
                    const detection = await faceapi.detectSingleFace(lockFaceVideo, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })).withFaceLandmarks().withFaceDescriptor();
                    
                    const ctx = lockFaceCanvas.getContext('2d');
                    ctx.clearRect(0, 0, lockFaceCanvas.width, lockFaceCanvas.height);
                    
                    if (detection) {
                        const resizedDetections = faceapi.resizeResults(detection, displaySize);
                        faceapi.draw.drawDetections(lockFaceCanvas, resizedDetections);
                        
                        // Compare descriptor
                        const distance = faceapi.euclideanDistance(savedDescriptor, detection.descriptor);
                        console.log("Face distance:", distance);
                        
                        // Distance < 0.6 is generally a match
                        if (distance < 0.55) {
                            clearInterval(scanInterval);
                            lockFaceStatus.textContent = "Face Recognized! Unlocking...";
                            lockFaceStatus.style.color = "#10b981";
                            setTimeout(() => {
                                cleanupLockFace();
                                chrome.runtime.sendMessage({ type: 'UNLOCK' });
                            }, 1000);
                        } else {
                            lockFaceStatus.textContent = "Face doesn't match.";
                            lockFaceStatus.style.color = "#f59e0b";
                        }
                    } else {
                        lockFaceStatus.textContent = "No face detected.";
                        lockFaceStatus.style.color = "#f59e0b";
                    }
                }, 500);
            });
        } catch (err) {
            lockFaceStatus.textContent = "Camera access denied.";
            setTimeout(cleanupLockFace, 2000);
        }
    });
}

function cleanupLockFace() {
    if (lockFaceStream) {
        lockFaceStream.getTracks().forEach(t => t.stop());
        lockFaceStream = null;
    }
    lockFaceContainer.style.display = 'none';
    faceUnlockBtn.style.display = 'block';
}

// ===== VOICE PHRASE UNLOCK LOGIC =====
chrome.storage.local.get(['isVoiceUnlockEnabled', 'voicePhrase'], (data) => {
    const voicePanel = document.getElementById('voice-unlock-panel');
    if (data.isVoiceUnlockEnabled && data.voicePhrase && voicePanel) {
        voicePanel.style.display = 'block';
    }
});

const voiceUnlockTriggerBtn = document.getElementById('voice-unlock-btn');
if (voiceUnlockTriggerBtn) {
    voiceUnlockTriggerBtn.addEventListener('click', async () => {
        const data = await chrome.storage.local.get(['voicePhrase']);
        const targetPhrase = (data.voicePhrase || '').trim().toLowerCase();
        
        const resultContainer = document.getElementById('voice-result-container');
        const resultText = document.getElementById('voice-result-text');
        const successIcon = document.getElementById('voice-success-icon');
        const failIcon = document.getElementById('voice-fail-icon');
        const visualizer = document.getElementById('voice-visualizer');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Web Speech API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        if (visualizer) visualizer.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'block';
        if (resultText) resultText.textContent = "🎙 Listening... Speak your passphrase clearly.";
        if (successIcon) successIcon.style.display = 'none';
        if (failIcon) failIcon.style.display = 'none';

        recognition.onresult = (event) => {
            const transcripts = Array.from(event.results[0]).map(res => res.transcript.trim().toLowerCase());
            const matched = transcripts.some(t => t.includes(targetPhrase) || targetPhrase.includes(t));

            if (matched) {
                if (resultText) resultText.textContent = `✓ Recognized: "${transcripts[0]}" - Passphrase Correct!`;
                if (successIcon) successIcon.style.display = 'block';
                if (failIcon) failIcon.style.display = 'none';

                setTimeout(() => {
                    performFinalUnlock('UNLOCK');
                }, 800);
            } else {
                if (resultText) resultText.textContent = `✕ Heard: "${transcripts[0]}"`;
                if (failIcon) failIcon.style.display = 'block';
                if (successIcon) successIcon.style.display = 'none';
            }
        };

        recognition.onerror = (err) => {
            if (resultText) resultText.textContent = `Voice recognition error: ${err.error}`;
            if (failIcon) failIcon.style.display = 'block';
        };

        recognition.start();
    });
}
