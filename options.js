const setInputs = document.querySelectorAll('[id^="set-"]');
const confirmInputs = document.querySelectorAll('[id^="confirm-"]');
const stealthInputs = document.querySelectorAll('.stealth-input');
const poisonInputs = document.querySelectorAll('.poison-input');
const saveBtn = document.getElementById('save-btn');
const errorMsg = document.getElementById('error-msg');
const setupContainer = document.getElementById('setup-container');
const securityActiveContainer = document.getElementById('security-active-container');
const changePasscodeBtn = document.getElementById('change-passcode-btn');
const deactivateBtn = document.getElementById('deactivate-btn');
const signinTriggerBtn = document.getElementById('signin-trigger-btn');
const divider = document.querySelector('.divider');
const downloadBackupBtn = document.getElementById('download-backup-btn');
let setupCompleted = false;
let activeBackupCodes = null;

const googleOAuthBtn = document.getElementById('google-oauth-btn');
const googleContainer = document.getElementById('google-signin-container');
const backupDisplay = document.getElementById('backup-code-display');
const googleOAuthError = document.getElementById('google-oauth-error');

const GOOGLE_CLIENT_ID = "699528092509-ah6i6n3nfc5cr52ac5v92rg0to5jcub7.apps.googleusercontent.com";
const EXTENSION_ID = "ggeonaekliokjhnlplonmgkccfgmkhmg";

const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY_HERE";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID_HERE";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID_HERE";

const eyeSvg = `<path d="M247.31,124.76c-.35-.79-8.82-19.16-27.65-36.69C200.77,71.05,170.19,56,128,56S55.23,71.05,36.34,88.07C17.51,105.6,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.16,27.65,36.69C55.23,184.95,85.81,200,128,200s72.77-15.05,91.66-32.07c18.83-17.53,27.3-35.9,27.65-36.69A8,8,0,0,0,247.31,124.76ZM128,184c-34.58,0-61.16-12.89-79-29.53C35.05,141.28,28.27,128,24.89,128c3.38,0,10.16-13.28,24.08-26.47C66.84,84.89,93.42,72,128,72s61.16,12.89,79,29.53c13.92,13.19,20.7,26.47,24.08,26.47-3.38,0-10.16,13.28-24.08,26.47C189.16,171.11,162.58,184,128,184Zm0-96a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"></path>`;
const eyeOffSvg = `<path d="M228,175a8,8,0,0,1-10.92,3L201.15,169c-20,15.19-45.69,23-73.15,23-42.19,0-72.77-15.05-91.66-32.07C17.51,142.4,9,124,8.69,123.24a8,8,0,0,1,0-6.48c.35-.79,2.83-6.14,8.44-12.28L18.15,105l-8.07-4.66a8,8,0,1,1,8-13.85l210,121.24A8,8,0,0,1,228,175ZM128,72c34.58,0,61.16,12.89,79,29.53a105.47,105.47,0,0,1,14.65,16.4l29.27,16.9a8,8,0,1,0,8-13.85l-19.14-11c-.35-.79-8.82-19.16-27.65-36.69C193.23,54.21,162.65,40,120.46,40a120.91,120.91,0,0,0-51.52,11.3l20.4,11.78A105,105,0,0,1,128,72Zm24,56a24,24,0,0,0-24-24,24.3,24.3,0,0,0-6.1.79l29.31,16.92A23.86,23.86,0,0,0,152,128Zm-24,56c23,0,44.75-6.28,62.19-17.75l-21.72-12.54a40,40,0,0,1-57.81-33.37L48.9,84.14C35,97.33,28.27,110.61,24.89,113.81c3.38,0,10.16,13.28,24.08,26.47C66.84,156.92,93.42,169.81,128,184Z"></path>`;


async function hashPasscode(passcode) {
    let saltData = await chrome.storage.local.get(['passcodeSalt']);
    let salt = saltData.passcodeSalt;
    if (!salt) {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        salt = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        await chrome.storage.local.set({ passcodeSalt: salt });
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + passcode);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function checkExistingPasscode() {
    const data = await chrome.storage.local.get([
        'passcode', 'isLinked', 'recoveryEmail', 'maxTries', 
        'idleTime', 'penaltyTime', 'stealthClearHistory', 
        'softBlurTime', 'isSirenEnabled', 'isSelfieEnabled', 'securityQuestion',
        'isTotpEnabled', 'totpSecret', 'isVoiceUnlockEnabled', 'voicePhrase',
        'googleUserPicture', 'googleUserName',
        'lockScreenTheme', 'isTamperProtectionEnabled', 'isIncognitoLockdownEnabled', 'isLockOnMinimizeEnabled',
        'intruderLogs'
    ]);
    
    if (data.maxTries !== undefined && document.getElementById('max-tries')) {
        document.getElementById('max-tries').value = data.maxTries;
    }
    if (data.idleTime !== undefined && document.getElementById('auto-lock-time')) {
        document.getElementById('auto-lock-time').value = data.idleTime;
    }
    if (data.penaltyTime !== undefined && document.getElementById('penalty-time')) {
        document.getElementById('penalty-time').value = data.penaltyTime;
    }
    if (data.softBlurTime !== undefined && document.getElementById('soft-blur-time')) {
        document.getElementById('soft-blur-time').value = data.softBlurTime;
    }
    if (data.stealthClearHistory !== undefined && document.getElementById('clear-history-checkbox')) {
        document.getElementById('clear-history-checkbox').checked = data.stealthClearHistory;
    }
    if (data.isSirenEnabled !== undefined && document.getElementById('enable-siren-checkbox')) {
        document.getElementById('enable-siren-checkbox').checked = data.isSirenEnabled;
    }
    if (data.isSelfieEnabled !== undefined && document.getElementById('enable-selfie-checkbox')) {
        document.getElementById('enable-selfie-checkbox').checked = data.isSelfieEnabled;
        if (data.isSelfieEnabled) {
            const cameraStatus = document.getElementById('camera-status');
            if (cameraStatus) {
                cameraStatus.textContent = 'Granted Successfully!';
                cameraStatus.style.color = '#10b981';
                cameraStatus.style.display = 'block';
            }
        }
    }
    if (data.securityQuestion && document.getElementById('security-question')) {
        document.getElementById('security-question').value = data.securityQuestion;
    }

    // Lock Screen Theme Setup
    const currentTheme = data.lockScreenTheme || 'gold';
    applyTheme(currentTheme);

    // Anti-Uninstall / Tamper Protection (Enabled by default for maximum security)
    const tamperCb = document.getElementById('enable-tamper-checkbox');
    const isTamperActive = data.isTamperProtectionEnabled !== undefined ? data.isTamperProtectionEnabled : true;
    if (tamperCb) {
        tamperCb.checked = isTamperActive;
    }

    // Incognito Lockdown (Enabled by default)
    const incognitoCb = document.getElementById('enable-incognito-lockdown-checkbox');
    const isIncognitoActive = data.isIncognitoLockdownEnabled !== undefined ? data.isIncognitoLockdownEnabled : true;
    if (incognitoCb) {
        incognitoCb.checked = isIncognitoActive;
    }

    // Ensure defaults are saved in storage if first time loaded
    if (data.isTamperProtectionEnabled === undefined || data.isIncognitoLockdownEnabled === undefined) {
        chrome.storage.local.set({
            isTamperProtectionEnabled: isTamperActive,
            isIncognitoLockdownEnabled: isIncognitoActive
        });
    }

    // Lock On Minimize
    const minimizeCb = document.getElementById('enable-minimize-lock-checkbox');
    if (minimizeCb) {
        minimizeCb.checked = data.isLockOnMinimizeEnabled !== undefined ? data.isLockOnMinimizeEnabled : false;
    }

    // Render Intruder Forensic Logs
    renderForensicLogs(data.intruderLogs || []);

    // LockBrowse Pro Domain Rules Setup
    const domainData = await chrome.storage.local.get(['isDomainLockEnabled', 'domainLockMode', 'domainRules']);
    const isDomainLockEnabled = domainData.isDomainLockEnabled !== undefined ? domainData.isDomainLockEnabled : false;
    const domainLockMode = domainData.domainLockMode || 'blacklist';
    const domainRules = domainData.domainRules || [];

    const domainCb = document.getElementById('enable-domain-lock-checkbox');
    if (domainCb) domainCb.checked = isDomainLockEnabled;

    const modeRadios = document.querySelectorAll('input[name="domain-lock-mode"]');
    modeRadios.forEach(r => {
        r.checked = (r.value === domainLockMode);
    });

    renderDomainRules(domainRules);

    // 2FA TOTP Setup Load
    let currentTotpSecret = data.totpSecret || (typeof TOTP !== 'undefined' ? TOTP.generateBase32Secret(16) : 'JBSWY3DPEHPK3PXP');
    const totpSecretEl = document.getElementById('totp-secret-key');
    const totpQrImg = document.getElementById('totp-qr-img');
    const enableTotpCb = document.getElementById('enable-totp-checkbox');
    const totpBox = document.getElementById('totp-setup-box');
    const copySecretBtn = document.getElementById('copy-totp-secret-btn');

    if (totpSecretEl) {
        totpSecretEl.textContent = currentTotpSecret.match(/.{1,4}/g) ? currentTotpSecret.match(/.{1,4}/g).join(' ') : currentTotpSecret;
        totpSecretEl.dataset.secret = currentTotpSecret;
    }
    if (copySecretBtn) {
        copySecretBtn.onclick = () => {
            navigator.clipboard.writeText(currentTotpSecret).then(() => {
                copySecretBtn.textContent = '? Copied!';
                copySecretBtn.style.color = '#10b981';
                setTimeout(() => {
                    copySecretBtn.textContent = '?? Copy';
                    copySecretBtn.style.color = '';
                }, 2000);
            }).catch(() => {});
        };
    }
    if (totpQrImg) {
        const otpUrl = `otpauth://totp/ProfileLockPro?secret=${currentTotpSecret}&issuer=ProfileLockPro`;
        totpQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(otpUrl)}`;
    }
    if (enableTotpCb) {
        enableTotpCb.checked = !!data.isTotpEnabled;
        if (totpBox) totpBox.style.display = data.isTotpEnabled ? 'block' : 'none';
        enableTotpCb.onchange = () => {
            if (totpBox) totpBox.style.display = enableTotpCb.checked ? 'block' : 'none';
        };
    }

    // Voice Phrase Setup Load
    const voiceInput = document.getElementById('voice-phrase-input');
    const enableVoiceCb = document.getElementById('enable-voice-unlock-checkbox');
    if (voiceInput) voiceInput.value = data.voicePhrase || '';
    if (enableVoiceCb) enableVoiceCb.checked = !!data.isVoiceUnlockEnabled;

    if (data.passcode) {
        setupContainer.style.display = 'none';
        securityActiveContainer.style.display = 'block';
    } else {
        setupContainer.style.display = 'block';
        securityActiveContainer.style.display = 'none';
    }

    if (data.isLinked) {
        if (signinTriggerBtn) signinTriggerBtn.style.display = 'none';
        if (divider) divider.style.display = 'none';
        
        const linkedStatus = document.getElementById('linked-account-status');
        const emailDisplay = document.getElementById('display-recovery-email');
        if (linkedStatus && emailDisplay) {
            emailDisplay.textContent = data.recoveryEmail || 'Secured Account';
            
            // Use stored Google profile picture from OAuth
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg && data.googleUserPicture) {
                avatarImg.src = data.googleUserPicture;
            } else if (chrome.identity && chrome.identity.getProfileUserInfo) {
                chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
                    if (userInfo && userInfo.email) {
                        emailDisplay.textContent = userInfo.email;
                        if (avatarImg) {
                            const initials = userInfo.email.substring(0, 2).toUpperCase();
                            avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=c5a059&color=050a08&size=128&bold=true`;
                        }
                    }
                });
            }

            linkedStatus.style.display = 'block';
        }
    }

    // Incognito Check
    if (chrome.extension && chrome.extension.isAllowedIncognitoAccess) {
        chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
            if (!isAllowed) {
                document.getElementById('incognito-warning').style.display = 'block';
            }
        });
    }
}

const configureSettingsBtn = document.getElementById('configure-settings-btn');
if (configureSettingsBtn) {
    configureSettingsBtn.addEventListener('click', () => {
        securityActiveContainer.style.display = 'none';
        setupContainer.style.display = 'block';
        setupContainer.scrollIntoView({ behavior: 'smooth' });
    });
}

changePasscodeBtn.addEventListener('click', () => {
    securityActiveContainer.style.display = 'none';
    setupContainer.style.display = 'block';
    setupCompleted = false;
    activeBackupCodes = null;
    saveBtn.textContent = (typeof t === 'function' ? t('btn_save_lock', 'Save \u0026 Lock Profile') : 'Save \u0026 Lock Profile');
    if (downloadBackupBtn) {
        downloadBackupBtn.style.display = 'flex';
        downloadBackupBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,144v64a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V144a8,8,0,0,1,16,0v64H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69L93.66,98.34A8,8,0,0,0,82.34,109.66Z"></path>
            </svg>
            Download Backup Codes (PNG)
        `;
    }
    backupDisplay.style.display = 'none';
    setInputs.forEach(i => i.value = '');
    confirmInputs.forEach(i => i.value = '');
    setInputs[0].focus();
});

deactivateBtn.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to deactivate the Global Lock? This will remove your passcode and backup vault.");
    if (confirmed) {
        await chrome.storage.local.remove(['passcode', 'backupCode', 'backupVault', 'isLinked', 'recoveryEmail']);
        alert("Global Lock deactivated.");
        location.reload();
    }
});

// Run on load
checkExistingPasscode();

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

function setupInputFocus(inputs) {
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Add micro-interaction "pop" animation
            e.target.classList.remove('type-pop');
            void e.target.offsetWidth; /* trigger reflow */
            e.target.classList.add('type-pop');

            setTimeout(() => e.target.classList.remove('type-pop'), 350);

            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}


setupInputFocus(setInputs);
setupInputFocus(confirmInputs);
if (stealthInputs.length > 0) setupInputFocus(stealthInputs);
if (poisonInputs.length > 0) setupInputFocus(poisonInputs);

async function processPasscodeSetup() {
    let passcode1 = "";
    let passcode2 = "";
    setInputs.forEach(i => passcode1 += i.value);
    confirmInputs.forEach(i => passcode2 += i.value);

    const penaltyInput = document.getElementById('penalty-time');
    let penaltyTimeRaw = penaltyInput ? parseInt(penaltyInput.value) : 15;
    if (isNaN(penaltyTimeRaw) || penaltyTimeRaw < 10 || penaltyTimeRaw > 60) {
        errorMsg.textContent = "Lockout Penalty Time must be between 10 and 60 seconds.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }
    let penaltyTime = penaltyTimeRaw;

    const autoLockInput = document.getElementById('auto-lock-time');
    let idleTimeRaw = autoLockInput ? parseInt(autoLockInput.value) : 15;
    if (isNaN(idleTimeRaw) || idleTimeRaw < 0 || idleTimeRaw > 60) {
        errorMsg.textContent = "Idle Auto-Lock must be between 0 and 60 minutes.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }
    let idleTime = idleTimeRaw;

    const softBlurInput = document.getElementById('soft-blur-time');
    let softBlurRaw = softBlurInput ? parseInt(softBlurInput.value) : 30;
    if (isNaN(softBlurRaw) || softBlurRaw < 0 || softBlurRaw > 300) {
        errorMsg.textContent = "Soft-Blur Time must be between 0 and 300 seconds.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }
    let softBlurTime = softBlurRaw;

    const maxTriesInput = document.getElementById('max-tries');
    let maxTriesRaw = maxTriesInput ? parseInt(maxTriesInput.value) : 5;
    if (isNaN(maxTriesRaw) || maxTriesRaw < 1 || maxTriesRaw > 30) {
        errorMsg.textContent = "Maximum Tries must be between 1 and 30.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }
    let maxTries = maxTriesRaw;

    let stealthPasscode = "";
    if (stealthInputs) stealthInputs.forEach(i => stealthPasscode += i.value);
    
    let isStealthEnabled = false;
    let hashedStealth = null;
    let clearHistory = document.getElementById('clear-history-checkbox') ? document.getElementById('clear-history-checkbox').checked : false;
    let isSirenEnabled = document.getElementById('enable-siren-checkbox') ? document.getElementById('enable-siren-checkbox').checked : false;
    let isSelfieEnabled = document.getElementById('enable-selfie-checkbox') ? document.getElementById('enable-selfie-checkbox').checked : false;

    // Advanced security settings
    let isAudioEnabled = document.getElementById('enable-audio-checkbox') ? document.getElementById('enable-audio-checkbox').checked : false;
    let isRansomwareEnabled = document.getElementById('enable-ransomware-checkbox') ? document.getElementById('enable-ransomware-checkbox').checked : false;
    let isSelfDestructEnabled = document.getElementById('enable-self-destruct-checkbox') ? document.getElementById('enable-self-destruct-checkbox').checked : false;
    let isDeepSuspendEnabled = document.getElementById('enable-deep-suspend-checkbox') ? document.getElementById('enable-deep-suspend-checkbox').checked : false;
    let isFaceIdEnabled = document.getElementById('enable-face-id-checkbox') ? document.getElementById('enable-face-id-checkbox').checked : false;

    if (stealthPasscode.length > 0) {
        if (stealthPasscode.length !== 8) {
            errorMsg.textContent = "Stealth Passcode must be exactly 8 digits if enabled.";
            errorMsg.classList.add('visible');
            setTimeout(() => errorMsg.classList.remove('visible'), 3000);
            return false;
        }
        if (stealthPasscode === passcode1) {
            errorMsg.textContent = "Stealth Passcode must be different from primary passcode.";
            errorMsg.classList.add('visible');
            setTimeout(() => errorMsg.classList.remove('visible'), 3000);
            return false;
        }
        hashedStealth = await hashPasscode(stealthPasscode);
        isStealthEnabled = true;
    }

    let poisonPasscode = "";
    if (poisonInputs) poisonInputs.forEach(i => poisonPasscode += i.value);
    
    let isPoisonEnabled = false;
    let hashedPoison = null;

    if (poisonPasscode.length > 0) {
        if (poisonPasscode.length !== 8) {
            errorMsg.textContent = "Poison Passcode must be exactly 8 digits if enabled.";
            errorMsg.classList.add('visible');
            setTimeout(() => errorMsg.classList.remove('visible'), 3000);
            return false;
        }
        if (poisonPasscode === passcode1 || poisonPasscode === stealthPasscode) {
            errorMsg.textContent = "Poison Passcode must be unique.";
            errorMsg.classList.add('visible');
            setTimeout(() => errorMsg.classList.remove('visible'), 3000);
            return false;
        }
        hashedPoison = await hashPasscode(poisonPasscode);
        isPoisonEnabled = true;
    }

    const securityQuestionInput = document.getElementById('security-question');
    const securityAnswerInput = document.getElementById('security-answer');
    let securityQuestion = securityQuestionInput ? securityQuestionInput.value.trim() : "";
    let securityAnswer = securityAnswerInput ? securityAnswerInput.value.trim() : "";
    let hashedSecurityAnswer = null;

    if ((securityQuestion && !securityAnswer) || (!securityQuestion && securityAnswer)) {
        errorMsg.textContent = "Both Security Question and Answer must be filled if setting a backup question.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }

    if (securityQuestion && securityAnswer) {
        // Case-sensitive hash
        hashedSecurityAnswer = await hashPasscode(securityAnswer);
    }

    if (passcode1.length === 8 && passcode1 === passcode2) {
        const hashedPasscode = await hashPasscode(passcode1);
        
        let codes = activeBackupCodes;
        if (!codes) {
            codes = await generateVault();
            activeBackupCodes = codes;
        }
        
        const hashedCodes = await Promise.all(codes.map(c => hashPasscode(c)));
        const primaryPair = [codes[0], codes[1]];

        let isTotpEnabled = document.getElementById('enable-totp-checkbox') ? document.getElementById('enable-totp-checkbox').checked : false;
        let totpSecretEl = document.getElementById('totp-secret-key');
        let totpSecret = totpSecretEl ? (totpSecretEl.dataset.secret || totpSecretEl.textContent.replace(/\s+/g, '')) : '';
        let isVoiceUnlockEnabled = document.getElementById('enable-voice-unlock-checkbox') ? document.getElementById('enable-voice-unlock-checkbox').checked : false;
        let voicePhrase = document.getElementById('voice-phrase-input') ? document.getElementById('voice-phrase-input').value.trim().toLowerCase() : '';

        // Tamper protection disabled
        let isIncognitoLockdown = document.getElementById('enable-incognito-lockdown-checkbox') ? document.getElementById('enable-incognito-lockdown-checkbox').checked : true;
        let isMinimizeLock = document.getElementById('enable-minimize-lock-checkbox') ? document.getElementById('enable-minimize-lock-checkbox').checked : false;
        const activeThemeEl = document.querySelector('.theme-card.active');
        let selectedTheme = activeThemeEl ? activeThemeEl.dataset.theme : 'gold';

        await chrome.storage.local.set({ 
            passcode: hashedPasscode,
            isHashed: true,
            penaltyTime: penaltyTime,
            idleTime: idleTime,
            softBlurTime: softBlurTime,
            maxTries: maxTries,
            stealthPasscode: hashedStealth,
            isStealthEnabled: isStealthEnabled,
            stealthClearHistory: clearHistory,
            poisonPasscode: hashedPoison,
            isPoisonEnabled: isPoisonEnabled,
            securityQuestion: securityQuestion,
            securityAnswerHash: hashedSecurityAnswer,
            isSirenEnabled: isSirenEnabled,
            isSelfieEnabled: isSelfieEnabled,
            isAudioEnabled: isAudioEnabled,
            isRansomwareEnabled: isRansomwareEnabled,
            isSelfDestructEnabled: isSelfDestructEnabled,
            isDeepSuspendEnabled: isDeepSuspendEnabled,
            isFaceIdEnabled: isFaceIdEnabled,
            isTotpEnabled: isTotpEnabled,
            totpSecret: totpSecret,
            isVoiceUnlockEnabled: isVoiceUnlockEnabled,
            voicePhrase: voicePhrase,
            isTamperProtectionEnabled: false,
            isIncognitoLockdownEnabled: isIncognitoLockdown,
            isLockOnMinimizeEnabled: isMinimizeLock,
            lockScreenTheme: selectedTheme,
            isEnabled: true,
            failedAttempts: 0,
            totalFailedAttempts: 0,
            backupVault: hashedCodes
        });

        document.getElementById('code-1').textContent = primaryPair[0];
        document.getElementById('code-2').textContent = primaryPair[1];

        const downloadBtn = document.getElementById('download-codes-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => downloadVaultCard(codes);
        }



        backupDisplay.style.display = 'block';
        backupDisplay.scrollIntoView({ behavior: 'smooth' });

        return true;
    } else {
        errorMsg.textContent = "Passcodes do not match or are incomplete.";
        errorMsg.classList.add('visible');
        setTimeout(() => errorMsg.classList.remove('visible'), 3000);
        return false;
    }
}

async function handleDownloadBackupBtnClick() {
    const success = await processPasscodeSetup();
    if (success) {
        try {
            await downloadVaultCard(activeBackupCodes);
        } catch (err) {
            console.error("Auto-download failed:", err);
        }
        if (downloadBackupBtn) {
            downloadBackupBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,144v64a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V144a8,8,0,0,1,16,0v64H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69L93.66,98.34A8,8,0,0,0,82.34,109.66Z"></path>
                </svg>
                Re-download Backup Codes (PNG)
            `;
        }
        saveBtn.textContent = (typeof t === 'function' ? t('btn_complete_setup', 'Complete Setup \u0026 Lock Profile') : 'Complete Setup \u0026 Lock Profile');
        setupCompleted = true;
    }
}

async function savePasscode() {
    if (setupCompleted) {
        chrome.runtime.sendMessage({ type: 'LOCK_NOW' });
        window.close();
        return;
    }

    const success = await processPasscodeSetup();
    if (success) {
        try {
            await downloadVaultCard(activeBackupCodes);
        } catch (err) {
            console.error("Auto-download failed:", err);
        }
        if (downloadBackupBtn) {
            downloadBackupBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,144v64a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V144a8,8,0,0,1,16,0v64H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69L93.66,98.34A8,8,0,0,0,82.34,109.66Z"></path>
                </svg>
                Re-download Backup Codes (PNG)
            `;
        }
        saveBtn.textContent = (typeof t === 'function' ? t('btn_complete_setup', 'Complete Setup \u0026 Lock Profile') : 'Complete Setup \u0026 Lock Profile');
        setupCompleted = true;
        
        alert('Passcode set successfully! 10 recovery backup codes have been generated and your Vault Card (PNG) has been downloaded.\n\nPlease keep it safe and click "Complete Setup & Lock Profile" when you are ready.');
    }
}

saveBtn.addEventListener('click', savePasscode);
if (downloadBackupBtn) downloadBackupBtn.addEventListener('click', handleDownloadBackupBtnClick);

// Visibility toggles for all password fields
function setupToggle(btnId, iconId, inputs) {
    const btn = document.getElementById(btnId);
    const icon = document.getElementById(iconId);
    if (!btn || !icon) return;

    btn.addEventListener('click', () => {
        const isPassword = inputs[0].type === 'password';
        inputs.forEach(input => input.type = isPassword ? 'text' : 'password');
        icon.innerHTML = isPassword ? eyeOffSvg : eyeSvg;
    });
}

setupToggle('toggle-pin-set', 'eye-icon-set', setInputs);
setupToggle('toggle-pin-confirm', 'eye-icon-confirm', confirmInputs);
setupToggle('toggle-pin-stealth', 'eye-icon-stealth', stealthInputs);

const grantCameraBtn = document.getElementById('grant-camera-btn');
const cameraStatus = document.getElementById('camera-status');
if (grantCameraBtn) {
    grantCameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop tracks immediately to turn off the light
            stream.getTracks().forEach(track => track.stop());
            cameraStatus.textContent = 'Granted Successfully!';
            cameraStatus.style.color = '#10b981';
            cameraStatus.style.display = 'block';
            document.getElementById('enable-selfie-checkbox').checked = true;
        } catch (err) {
            console.error('Camera access denied:', err);
            cameraStatus.textContent = 'Denied. Please allow camera access in Chrome settings.';
            cameraStatus.style.color = '#ef4444';
            cameraStatus.style.display = 'block';
            document.getElementById('enable-selfie-checkbox').checked = false;
        }
    });
}

// Microphone / Audio Recording setup
const grantAudioBtn = document.getElementById('grant-audio-btn');
const audioStatus = document.getElementById('audio-grant-status');
if (grantAudioBtn) {
    grantAudioBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            audioStatus.textContent = 'Microphone Granted Successfully!';
            audioStatus.style.color = '#10b981';
            audioStatus.style.display = 'block';
            document.getElementById('enable-audio-checkbox').checked = true;
        } catch (err) {
            console.error('Audio access denied:', err);
            audioStatus.textContent = 'Denied. Please allow microphone access in Chrome settings.';
            audioStatus.style.color = '#ef4444';
            audioStatus.style.display = 'block';
            document.getElementById('enable-audio-checkbox').checked = false;
        }
    });
}

// Test Intruder Selfie Capture
async function testCaptureIntruderSelfie() {
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
            setTimeout(async () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                // Cleanup
                stream.getTracks().forEach(t => t.stop());
                video.remove();
                // Show preview
                const previewImg = document.getElementById('test-selfie-img');
                if (previewImg) {
                    previewImg.src = dataUrl;
                    document.getElementById('test-selfie-preview').style.display = 'block';
                }
                // Auto-download
                try {
                    chrome.downloads.download({ url: dataUrl, filename: `Intruder_Test_${Date.now()}.jpg`, saveAs: false });
                } catch (e) { console.error('Download failed', e); }
            }, 500);
        };
    } catch (e) {
        console.error('Selfie test failed:', e);
        alert('Selfie capture failed. Check console for details.');
    }
}

// Test Intruder Audio Capture
async function testCaptureIntruderAudio() {
    const data = await chrome.storage.local.get(['isAudioEnabled']);
    if (!data.isAudioEnabled) {
        alert('Audio capture is disabled in settings. Enable it first.');
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const chunks = [];
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result;
                // Show preview
                const audioPlayer = document.getElementById('test-audio-player');
                if (audioPlayer) {
                    audioPlayer.src = dataUrl;
                    document.getElementById('test-audio-preview').style.display = 'block';
                }
                // Auto-download
                try { chrome.downloads.download({ url: dataUrl, filename: `Intruder_Audio_Test_${Date.now()}.webm`, saveAs: false }); } catch (e) { console.error('Audio download failed', e); }
            };
            reader.readAsDataURL(blob);
        };
        mediaRecorder.start();
        setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 15000);
    } catch (e) {
        console.error('Audio test failed:', e);
        alert('Audio capture failed. Check console for details.');
    }
}

// Wire up test buttons
const testSelfieBtn = document.getElementById('test-selfie-btn');
if (testSelfieBtn) testSelfieBtn.addEventListener('click', testCaptureIntruderSelfie);
const testAudioBtn = document.getElementById('test-audio-btn');
if (testAudioBtn) testAudioBtn.addEventListener('click', testCaptureIntruderAudio);


// Ransomware Preview
const previewRansomwareBtn = document.getElementById('preview-ransomware-btn');
if (previewRansomwareBtn) {
    previewRansomwareBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('ransomware.html'), active: true });
    });
}

// ===== VOICE UNLOCK LOGIC FOR OPTIONS PAGE =====
const recordVoiceBtn = document.getElementById('record-voice-btn');
const voiceErrOpts = document.getElementById('voice-err-opts');
const voiceSavedBadge = document.getElementById('voice-saved-badge');
const voicePreviewText = document.getElementById('voice-phrase-text');
const voicePreviewCont = document.getElementById('voice-phrase-preview');
const voiceWaveCanvasOpts = document.getElementById('voice-waveform-opts');
const voiceVisOpts = document.getElementById('voice-visualizer-opts');
const voiceCurPhrase = document.getElementById('voice-current-phrase');
const clearVoiceBtn = document.getElementById('clear-voice-btn');
let optsVoiceAnimFrame = null;

function startOptsWaveform(analyser, canvas) {
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    
    function draw() {
        optsVoiceAnimFrame = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(data);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
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

function stopOptsWaveform() {
    if (optsVoiceAnimFrame) {
        cancelAnimationFrame(optsVoiceAnimFrame);
        optsVoiceAnimFrame = null;
    }
}

async function loadExistingVoicePhrase() {
    const d = await chrome.storage.local.get(['voiceUnlockPhrase']);
    if (d.voiceUnlockPhrase && voiceCurPhrase && clearVoiceBtn) {
        voiceCurPhrase.textContent = `Current Phrase: "${d.voiceUnlockPhrase}"`;
        voiceCurPhrase.style.display = 'block';
        clearVoiceBtn.style.display = 'block';
    }
}
loadExistingVoicePhrase();

if (clearVoiceBtn) {
    clearVoiceBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove(['voiceUnlockPhrase']);
        voiceCurPhrase.style.display = 'none';
        clearVoiceBtn.style.display = 'none';
        voiceSavedBadge.style.display = 'none';
        voicePreviewCont.style.display = 'none';
        alert('Voice phrase removed.');
    });
}

if (recordVoiceBtn) {
    recordVoiceBtn.addEventListener('click', async () => {
        voiceErrOpts.style.display = 'none';
        voiceSavedBadge.style.display = 'none';
        voicePreviewCont.style.display = 'none';
        
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            voiceErrOpts.textContent = 'Speech recognition not supported in this browser.';
            voiceErrOpts.style.display = 'block';
            return;
        }

        voiceVisOpts.style.display = 'block';
        recordVoiceBtn.disabled = true;
        recordVoiceBtn.innerHTML = '?? Listening... Speak now.';
        recordVoiceBtn.style.borderColor = 'rgba(255,77,77,0.6)';
        recordVoiceBtn.style.color = '#ff4d4d';

        let micStream = null;
        let audioCtx = null;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(micStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            startOptsWaveform(analyser, voiceWaveCanvasOpts);
        } catch(e) { console.error('Waveform error:', e); }

        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        function cleanup() {
            stopOptsWaveform();
            if (micStream) micStream.getTracks().forEach(t => t.stop());
            if (audioCtx) audioCtx.close().catch(()=>{});
            voiceVisOpts.style.display = 'none';
            recordVoiceBtn.disabled = false;
            recordVoiceBtn.innerHTML = '?? Record Voice Unlock Phrase';
            recordVoiceBtn.style.borderColor = 'rgba(16,185,129,0.4)';
            recordVoiceBtn.style.color = '#10b981';
        }

        recognition.onresult = async (event) => {
            cleanup();
            const phrase = event.results[0][0].transcript.trim();
            if (phrase) {
                await chrome.storage.local.set({ voiceUnlockPhrase: phrase });
                // Capture a short voice fingerprint for added security
                captureVoicePrint();
                voicePreviewText.textContent = `"${phrase}"`;
                voicePreviewCont.style.display = 'block';
                voiceSavedBadge.style.display = 'block';
                loadExistingVoicePhrase();
            } else {
                voiceErrOpts.textContent = 'No phrase detected. Try again.';
                voiceErrOpts.style.display = 'block';
            }
        };

        recognition.onerror = (e) => {
            cleanup();
            voiceErrOpts.textContent = `Error: ${e.error}. Try again.`;
            voiceErrOpts.style.display = 'block';
        };

        recognition.onend = cleanup;
        recognition.start();
    });
}

const configureShortcutBtn = document.getElementById('configure-shortcut-btn');
if (configureShortcutBtn) {
    configureShortcutBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
}


// Backup Code Generation & Security
function generateSecureCode() {
    // Restored all letters for maximum security.
    // Excluded: I, l, 1, 0, O (ambiguous numbers/letters)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(array[i] % chars.length);
    }
    return result;
}

async function generateVault() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push(generateSecureCode());
    }
    return codes;
}

async function downloadVaultCard(codes) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    // Background - Deep Dark Mesh
    ctx.fillStyle = '#0a110d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1600);
    gradient.addColorStop(0, 'rgba(197, 160, 89, 0.05)');
    gradient.addColorStop(1, 'rgba(10, 17, 13, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borders
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, 1120, 1520);
    
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1080, 1480);

    // Header
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 80px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SECURITY RECOVERY VAULT', 600, 200);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '300 40px Outfit, sans-serif';
    ctx.fillText('Profile Lock Pro - Secure Export', 600, 270);
    
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.5)';
    ctx.beginPath();
    ctx.moveTo(300, 320);
    ctx.lineTo(900, 320);
    ctx.stroke();

    // Icon (Simple Shield Shape)
    ctx.beginPath();
    ctx.moveTo(600, 380);
    ctx.lineTo(660, 410);
    ctx.lineTo(660, 500);
    ctx.quadraticCurveTo(600, 550, 540, 500);
    ctx.lineTo(540, 410);
    ctx.closePath();
    ctx.fillStyle = '#c5a059';
    ctx.fill();

    // Body Text
    ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
    ctx.font = '30px Outfit, sans-serif';
    ctx.fillText('The following codes provide emergency access to your profile.', 600, 620);
    ctx.fillText('Keep this document offline and secure. (CODES ARE CASE-SENSITIVE)', 600, 660);

    // Grid of Codes
    codes.forEach((code, i) => {
        const x = 600;
        const y = 780 + (i * 75);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x - 200, y - 50, 400, 70);
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.2)';
        ctx.strokeRect(x - 200, y - 50, 400, 70);
        
        ctx.font = '60px Consolas, Monaco, "Courier New", monospace';
        const charWidth = ctx.measureText('A').width;
        let startX = x - ((charWidth * 8) / 2) + (charWidth / 2);

        for (let j = 0; j < code.length; j++) {
            const char = code[j];
            if (char >= 'a' && char <= 'z') {
                ctx.font = '40px Consolas, Monaco, "Courier New", monospace';
                ctx.fillStyle = '#f1f5f9'; // Silver/White
            } else {
                ctx.font = '60px Consolas, Monaco, "Courier New", monospace';
                ctx.fillStyle = '#c5a059'; // Gold
            }
            ctx.fillText(char, startX + (j * charWidth), y);
        }
    });

    // Footer
    ctx.font = 'italic 25px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
    const date = new Date().toLocaleDateString();
    ctx.fillText(`Generated on ${date} | Valid until deactivated`, 600, 1540);

    // Trigger Download
    const filename = `Security_Vault_Card_${date.replace(/\//g, '-')}.png`;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    if (chrome.downloads && chrome.downloads.download) {
        chrome.downloads.download({
            url: dataUrl,
            filename: filename,
            saveAs: true
        });
    } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===== REAL GOOGLE OAUTH SIGN-IN =====
async function launchGoogleOAuth() {
    const redirectUri = `https://${EXTENSION_ID}.chromiumapp.org/`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=consent`;

    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
            { url: authUrl, interactive: true },
            (redirectUrl) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                if (!redirectUrl) {
                    reject(new Error('No redirect URL received'));
                    return;
                }
                // Extract access token from the redirect URL fragment
                const hashParams = new URLSearchParams(redirectUrl.split('#')[1]);
                const accessToken = hashParams.get('access_token');
                if (accessToken) {
                    resolve(accessToken);
                } else {
                    reject(new Error('No access token found in response'));
                }
            }
        );
    });
}

async function fetchGoogleUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user info from Google');
    return response.json();
}

if (googleOAuthBtn) {
    googleOAuthBtn.addEventListener('click', async () => {
        // Show loading state
        const originalText = googleOAuthBtn.innerHTML;
        googleOAuthBtn.innerHTML = '<span class="spinner"></span> Signing in...';
        googleOAuthBtn.disabled = true;
        if (googleOAuthError) googleOAuthError.style.display = 'none';

        try {
            // 1. Launch the real Google sign-in popup
            const accessToken = await launchGoogleOAuth();

            // 2. Fetch user info from Google
            const userInfo = await fetchGoogleUserInfo(accessToken);
            const recoveryEmail = userInfo.email;
            const userName = userInfo.name || recoveryEmail.split('@')[0];
            const userPicture = userInfo.picture;

            // 3. Generate vault backup codes
            const codes = await generateVault();
            const primaryPair = [codes[0], codes[1]];

            // 4. Hash all codes for secure storage
            const hashedCodes = await Promise.all(codes.map(c => hashPasscode(c)));

            // 5. Optionally email codes via EmailJS
            if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_email: recoveryEmail,
                    backup_code_1: primaryPair[0],
                    backup_code_2: primaryPair[1],
                    user_name: userName
                });
            }

            // 6. Save to storage
            await chrome.storage.local.set({
                recoveryEmail: recoveryEmail,
                googleUserName: userName,
                googleUserPicture: userPicture || '',
                googleAccessToken: accessToken,
                backupVault: hashedCodes,
                isLinked: true
            });

            // 7. Update UI ? show linked account status
            document.getElementById('code-1').textContent = primaryPair[0];
            document.getElementById('code-2').textContent = primaryPair[1];

            const linkedStatus = document.getElementById('linked-account-status');
            const emailDisplay = document.getElementById('display-recovery-email');
            if (linkedStatus && emailDisplay) {
                emailDisplay.textContent = recoveryEmail;

                // Use Google profile picture if available
                const avatarImg = document.getElementById('user-avatar');
                if (avatarImg && userPicture) {
                    avatarImg.src = userPicture;
                } else if (avatarImg) {
                    const initials = recoveryEmail.substring(0, 2).toUpperCase();
                    avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=c5a059&color=050a08&size=128&bold=true`;
                }

                linkedStatus.style.display = 'block';
            }

            backupDisplay.style.display = 'block';
            backupDisplay.scrollIntoView({ behavior: 'smooth' });

            // Set up download button
            const downloadBtn = document.getElementById('download-codes-btn');
            downloadBtn.onclick = () => downloadVaultCard(codes);

            alert(`? Google Sign-In Successful!\n\nWelcome, ${userName}!\nRecovery email: ${recoveryEmail}\n\nYour security vault codes have been generated. Please download your Vault Card.`);

            if (googleContainer) googleContainer.style.display = 'none';
            if (signinTriggerBtn) signinTriggerBtn.style.display = 'none';
            if (divider) divider.style.display = 'none';

        } catch (error) {
            console.error("Google OAuth failed:", error);
            if (googleOAuthError) {
                googleOAuthError.textContent = `Sign-in failed: ${error.message}`;
                googleOAuthError.style.display = 'block';
            }
        } finally {
            googleOAuthBtn.innerHTML = originalText;
            googleOAuthBtn.disabled = false;
        }
    });
}

if (signinTriggerBtn) {
    signinTriggerBtn.addEventListener('click', () => {
        if (googleContainer) googleContainer.style.display = 'block';
        if (divider) divider.style.display = 'none';
        signinTriggerBtn.style.display = 'none';
        if (backupDisplay) backupDisplay.style.display = 'none';
    });
}

const googleSignoutBtn = document.getElementById('google-signout-btn');
if (googleSignoutBtn) {
    googleSignoutBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to sign out and unlink your Google recovery account?')) {
            return;
        }

        // Clear stored auth & recovery details
        await chrome.storage.local.remove([
            'isLinked',
            'recoveryEmail',
            'googleUserName',
            'googleUserPicture',
            'googleAccessToken',
            'backupVault'
        ]);

        // Revoke / clear cached token if supported
        try {
            if (chrome.identity && chrome.identity.clearAllCachedAuthTokens) {
                chrome.identity.clearAllCachedAuthTokens(() => {});
            }
        } catch (e) {
            console.warn('Could not clear cached auth tokens:', e);
        }

        // Update UI
        const linkedStatus = document.getElementById('linked-account-status');
        if (linkedStatus) linkedStatus.style.display = 'none';
        if (signinTriggerBtn) signinTriggerBtn.style.display = 'block';
        if (divider) divider.style.display = 'block';
        if (backupDisplay) backupDisplay.style.display = 'none';
        if (googleContainer) googleContainer.style.display = 'none';

        alert('Signed out successfully. Your Google recovery account has been unlinked.');
    });
}

// ===== FACE ID SETUP LOGIC =====
const startFaceBtn = document.getElementById('start-face-setup-btn');
const captureFaceBtn = document.getElementById('capture-face-btn');
const clearFaceBtn = document.getElementById('clear-face-btn');
const faceContainer = document.getElementById('face-setup-container');
const faceVideo = document.getElementById('face-video');
const faceCanvas = document.getElementById('face-canvas');
const faceStatus = document.getElementById('face-setup-status');
const faceSavedBadge = document.getElementById('face-saved-badge');

let modelsLoaded = false;
let faceStream = null;

async function loadFaceModels() {
    if (modelsLoaded) return true;
    try {
        faceStatus.textContent = "Loading AI Models... (might take a few seconds)";
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        modelsLoaded = true;
        return true;
    } catch (err) {
        console.error("Failed to load models:", err);
        faceStatus.textContent = "Error loading AI models. Check console.";
        return false;
    }
}

async function checkExistingFaceDescriptor() {
    const data = await chrome.storage.local.get(['faceDescriptor']);
    if (data.faceDescriptor) {
        faceSavedBadge.style.display = 'block';
        clearFaceBtn.style.display = 'block';
        startFaceBtn.innerHTML = '?? Update Face ID';
    } else {
        faceSavedBadge.style.display = 'none';
        clearFaceBtn.style.display = 'none';
        startFaceBtn.innerHTML = '?? Set Up Face ID';
    }
}
checkExistingFaceDescriptor();

if (clearFaceBtn) {
    clearFaceBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove(['faceDescriptor']);
        alert('Face profile removed successfully.');
        checkExistingFaceDescriptor();
    });
}

if (startFaceBtn) {
    startFaceBtn.addEventListener('click', async () => {
        faceContainer.style.display = 'flex';
        startFaceBtn.style.display = 'none';
        captureFaceBtn.style.display = 'none';
        
        const loaded = await loadFaceModels();
        if (!loaded) return;

        try {
            faceStream = await navigator.mediaDevices.getUserMedia({ video: true });
            faceVideo.srcObject = faceStream;
            faceStatus.textContent = "Looking for your face... Please position yourself clearly.";
            
            faceVideo.addEventListener('play', () => {
                const displaySize = { width: faceVideo.width, height: faceVideo.height };
                faceapi.matchDimensions(faceCanvas, displaySize);
                
                const drawInterval = setInterval(async () => {
                    if (!faceStream) {
                        clearInterval(drawInterval);
                        return;
                    }
                    const detection = await faceapi.detectSingleFace(faceVideo, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })).withFaceLandmarks().withFaceDescriptor();
                    
                    const ctx = faceCanvas.getContext('2d');
                    ctx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
                    
                    if (detection) {
                        const resizedDetections = faceapi.resizeResults(detection, displaySize);
                        faceapi.draw.drawDetections(faceCanvas, resizedDetections);
                        faceStatus.textContent = "Face detected! You can capture now.";
                        faceStatus.style.color = "#10b981";
                        captureFaceBtn.style.display = 'block';
                    } else {
                        faceStatus.textContent = "No face detected. Please adjust lighting/position.";
                        faceStatus.style.color = "#f59e0b";
                        captureFaceBtn.style.display = 'none';
                    }
                }, 500);
            });
        } catch (err) {
            faceStatus.textContent = "Camera access denied. Please allow camera permissions.";
        }
    });
}

if (captureFaceBtn) {
    captureFaceBtn.addEventListener('click', async () => {
        faceStatus.textContent = "Analyzing face... Please hold still.";
        captureFaceBtn.style.display = 'none';
        
        let detection = null;
        let attempts = 0;
        
        // Try up to 20 times (approx 10 seconds)
        while (!detection && attempts < 20) {
            if (!faceStream) break;
            detection = await faceapi.detectSingleFace(faceVideo, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })).withFaceLandmarks().withFaceDescriptor();
            if (!detection) {
                attempts++;
                await new Promise(r => setTimeout(r, 500));
            }
        }
        
        if (detection) {
            // Descriptor is a Float32Array, store it as an Array
            const descriptorArray = Array.from(detection.descriptor);
            await chrome.storage.local.set({ faceDescriptor: descriptorArray });
            
            faceStatus.textContent = "Profile saved successfully!";
            faceStatus.style.color = "#10b981";
            
            // Cleanup
            if (faceStream) {
                faceStream.getTracks().forEach(t => t.stop());
                faceStream = null;
            }
            setTimeout(() => {
                faceContainer.style.display = 'none';
                startFaceBtn.style.display = 'block';
                checkExistingFaceDescriptor();
            }, 1500);
        } else {
            faceStatus.textContent = "Failed to capture after multiple attempts. Please try again.";
            captureFaceBtn.style.display = 'block';
        }
    });
}

// 2FA TOTP Test Verification Handler
const totpVerifyBtn = document.getElementById('totp-verify-btn');
if (totpVerifyBtn) {
    totpVerifyBtn.addEventListener('click', async () => {
        const testInput = document.getElementById('totp-test-input');
        const statusEl = document.getElementById('totp-verify-status');
        const totpSecretEl = document.getElementById('totp-secret-key');
        const secretKey = totpSecretEl ? (totpSecretEl.dataset.secret || totpSecretEl.textContent.replace(/\s+/g, '')) : '';

        if (!testInput || !statusEl) return;
        const code = testInput.value.trim();

        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            statusEl.textContent = 'Enter a valid 6-digit number.';
            statusEl.style.color = '#ef4444';
            statusEl.style.display = 'block';
            return;
        }

        if (typeof TOTP !== 'undefined') {
            const isValid = await TOTP.verifyTOTP(secretKey, code);
            if (isValid) {
                statusEl.textContent = '? 2FA Code Verified Successfully!';
                statusEl.style.color = '#10b981';
                statusEl.style.display = 'block';
            } else {
                statusEl.textContent = '? Incorrect or expired 2FA code.';
                statusEl.style.color = '#ef4444';
                statusEl.style.display = 'block';
            }
        }
    });
}

// Voice Recognition Test Handler
const testVoiceBtn = document.getElementById('test-voice-btn');
if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
        const statusEl = document.getElementById('voice-test-status');
        const phraseInput = document.getElementById('voice-phrase-input');
        if (!statusEl || !phraseInput) return;

        const targetPhrase = phraseInput.value.trim().toLowerCase();
        if (!targetPhrase) {
            statusEl.textContent = 'Please enter a target passphrase above first.';
            statusEl.style.color = '#ef4444';
            statusEl.style.display = 'block';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            statusEl.textContent = 'Web Speech API is not supported in this browser.';
            statusEl.style.color = '#ef4444';
            statusEl.style.display = 'block';
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        statusEl.textContent = '?? Listening... Speak your phrase clearly into the mic.';
        statusEl.style.color = '#60a5fa';
        statusEl.style.display = 'block';

        recognition.onresult = (event) => {
            const transcripts = Array.from(event.results[0]).map(res => res.transcript.trim().toLowerCase());
            const matched = transcripts.some(t => t.includes(targetPhrase) || targetPhrase.includes(t));

            if (matched) {
                statusEl.textContent = `? Recognized: "${transcripts[0]}" - Match Successful!`;
                statusEl.style.color = '#10b981';
            } else {
                statusEl.textContent = `? Heard: "${transcripts[0]}". Expected: "${targetPhrase}".`;
                statusEl.style.color = '#ef4444';
            }
        };

        recognition.onerror = (e) => {
            statusEl.textContent = `Voice test error: ${e.error}. Please check mic permissions.`;
            statusEl.style.color = '#ef4444';
        };

        recognition.start();
    });
}

let optionsMatrixAnimId = null;

function applyTheme(theme) {
    document.body.classList.remove('theme-gold', 'theme-matrix', 'theme-oled', 'theme-apple', 'theme-blossom', 'theme-orange', 'theme-sunset');
    document.body.classList.add(`theme-${theme}`);

    document.querySelectorAll('.theme-card').forEach(c => {
        if (c.dataset.theme === theme) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    const canvas = document.getElementById('matrix-canvas');
    if (theme === 'matrix' && canvas) {
        canvas.style.display = 'block';
        startOptionsMatrixRain(canvas);
    } else if (canvas) {
        canvas.style.display = 'none';
        if (optionsMatrixAnimId) {
            cancelAnimationFrame(optionsMatrixAnimId);
            optionsMatrixAnimId = null;
        }
    }
}

function startOptionsMatrixRain(canvas) {
    if (optionsMatrixAnimId) cancelAnimationFrame(optionsMatrixAnimId);
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
        optionsMatrixAnimId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== CUSTOM LOCK SCREEN THEMES =====
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', async () => {
        const theme = card.dataset.theme;
        applyTheme(theme);
        await chrome.storage.local.set({ lockScreenTheme: theme });
    });
});

// ===== TOGGLE LISTENERS (AUTO-SAVE) =====
const tamperToggle = document.getElementById('enable-tamper-checkbox');
if (tamperToggle) {
    tamperToggle.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ isTamperProtectionEnabled: e.target.checked });
    });
}

const incognitoToggle = document.getElementById('enable-incognito-lockdown-checkbox');
if (incognitoToggle) {
    incognitoToggle.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ isIncognitoLockdownEnabled: e.target.checked });
    });
}

const minimizeLockToggle = document.getElementById('enable-minimize-lock-checkbox');
if (minimizeLockToggle) {
    minimizeLockToggle.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ isLockOnMinimizeEnabled: e.target.checked });
    });
}

// ===== INTRUDER FORENSIC DASHBOARD =====
function renderForensicLogs(logs = []) {
    const container = document.getElementById('forensic-logs-container');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = '<p id="no-forensics-text" style="color: var(--text-muted); font-size: 0.85rem; text-align: center; font-style: italic; padding: 1.5rem 0;">No intruder attempts recorded. Your profile is secure.</p>';
        return;
    }

    container.innerHTML = '';
    logs.forEach(log => {
        const card = document.createElement('div');
        card.className = 'forensic-card';
        card.style.cssText = 'background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 0.8rem; padding: 0.8rem 1rem; margin-bottom: 0.8rem; display: flex; gap: 1rem; align-items: center;';

        let mediaHtml = '';
        if (log.selfie) {
            mediaHtml += `<img src="${log.selfie}" alt="Intruder Photo" style="width: 65px; height: 65px; border-radius: 0.5rem; object-fit: cover; border: 1px solid rgba(239,68,68,0.5); cursor: pointer;" title="Click to open full photo" onclick="window.open('${log.selfie}')">`;
        } else {
            mediaHtml += `<div style="width: 65px; height: 65px; border-radius: 0.5rem; background: rgba(239,68,68,0.1); border: 1px dashed rgba(239,68,68,0.3); display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 1.2rem;">??</div>`;
        }

        let audioHtml = '';
        if (log.audio) {
            audioHtml = `<audio controls src="${log.audio}" style="width: 100%; height: 28px; margin-top: 0.4rem; border-radius: 4px;"></audio>`;
        }

        card.innerHTML = `
            ${mediaHtml}
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                    <span style="color: #ef4444; font-size: 0.8rem; font-weight: bold;">?? Failed Attempt</span>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">${log.timestamp}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 0.2rem;">
                    Attempted Digits: <strong style="font-family: monospace; background: rgba(239,68,68,0.15); color: #ef4444; padding: 0.1rem 0.4rem; border-radius: 4px;">${log.attemptedCode || 'Unknown'}</strong>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    Device: ${log.device || 'Desktop Browser'}
                </div>
                ${audioHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

const clearForensicsBtn = document.getElementById('clear-forensic-logs-btn');
if (clearForensicsBtn) {
    clearForensicsBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear all recorded intruder forensic logs?')) return;
        await chrome.storage.local.remove(['intruderLogs', 'intruderSelfie', 'intruderAudio']);
        renderForensicLogs([]);
    });
}

// ===== ENCRYPTED CLOUD / FILE BACKUP (AES-256) =====
async function deriveAesKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

function bufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
}

const exportVaultBtn = document.getElementById('export-vault-btn');
if (exportVaultBtn) {
    exportVaultBtn.addEventListener('click', async () => {
        const password = prompt('Enter a secure password to encrypt your .vault backup file:');
        if (!password) return;

        const statusEl = document.getElementById('vault-backup-status');
        if (statusEl) {
            statusEl.textContent = 'Encrypting vault with AES-256...';
            statusEl.style.color = '#10b981';
            statusEl.style.display = 'block';
        }

        try {
            // Collect all relevant profile security settings
            const allData = await chrome.storage.local.get(null);
            
            // Clean out transient keys
            delete allData.failedAttempts;
            delete allData.lockoutUntil;
            delete allData.maintenanceExpiry;

            const payloadStr = JSON.stringify(allData);
            const enc = new TextEncoder();
            const rawData = enc.encode(payloadStr);

            // Generate cryptographically secure random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const key = await deriveAesKey(password, salt);
            const cipherBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                rawData
            );

            const vaultFileObj = {
                app: "ProfileLockPro",
                version: "2.0",
                format: "AES-256-GCM-PBKDF2",
                salt: bufToHex(salt),
                iv: bufToHex(iv),
                ciphertext: bufToHex(cipherBuffer),
                createdAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(vaultFileObj, null, 2)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ProfileLockPro_Backup_${Date.now()}.vault`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (statusEl) {
                statusEl.textContent = '? Vault exported and encrypted with AES-256 successfully!';
                statusEl.style.color = '#10b981';
            }
        } catch (err) {
            console.error('Vault export failed:', err);
            if (statusEl) {
                statusEl.textContent = `Export failed: ${err.message}`;
                statusEl.style.color = '#ef4444';
            }
        }
    });
}

const importVaultBtn = document.getElementById('import-vault-btn');
const vaultFileInput = document.getElementById('vault-file-input');
if (importVaultBtn && vaultFileInput) {
    importVaultBtn.addEventListener('click', () => {
        vaultFileInput.value = '';
        vaultFileInput.click();
    });

    vaultFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const password = prompt('Enter the decryption password for this .vault file:');
        if (!password) return;

        const statusEl = document.getElementById('vault-backup-status');
        if (statusEl) {
            statusEl.textContent = 'Decrypting and verifying vault...';
            statusEl.style.color = '#10b981';
            statusEl.style.display = 'block';
        }

        try {
            const fileText = await file.text();
            const vaultObj = JSON.parse(fileText);

            if (!vaultObj.salt || !vaultObj.iv || !vaultObj.ciphertext) {
                throw new Error('Invalid .vault file structure.');
            }

            const salt = new Uint8Array(hexToBuf(vaultObj.salt));
            const iv = new Uint8Array(hexToBuf(vaultObj.iv));
            const cipherBuffer = hexToBuf(vaultObj.ciphertext);

            const key = await deriveAesKey(password, salt);
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                cipherBuffer
            );

            const dec = new TextDecoder();
            const restoredJson = dec.decode(decryptedBuffer);
            const restoredData = JSON.parse(restoredJson);

            // Save restored data to storage
            await chrome.storage.local.set(restoredData);

            if (statusEl) {
                statusEl.textContent = '? Vault decrypted & restored successfully! Reloading...';
                statusEl.style.color = '#10b981';
            }

            alert('? Vault credentials and settings successfully restored! The page will now reload.');
            window.location.reload();

        } catch (err) {
            console.error('Import failed:', err);
            if (statusEl) {
                statusEl.textContent = '? Decryption failed! Incorrect password or corrupted vault file.';
                statusEl.style.color = '#ef4444';
            }
            alert('? Decryption failed! Please check your password.');
        }
    });
}

// ===== LOCKBROWSE PRO: DOMAIN RULES & TAB LOCKING CONTROLS =====
function renderDomainRules(rules) {
    const container = document.getElementById('domain-rules-container');
    if (!container) return;

    if (!rules || rules.length === 0) {
        container.innerHTML = '<span style=\"color: var(--text-muted); font-size: 0.8rem; font-style: italic;\" data-i18n=\"lockbrowse_no_domains\">No domain rules configured yet.</span>';
        if (typeof applyLanguage === 'function' && window.currentLanguage) {
            applyLanguage(window.currentLanguage);
        }
        return;
    }

    container.innerHTML = '';
    rules.forEach((rule, idx) => {
        const badge = document.createElement('div');
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';
        badge.style.background = 'rgba(212, 175, 55, 0.15)';
        badge.style.border = '1px solid rgba(212, 175, 55, 0.4)';
        badge.style.color = 'var(--text-main)';
        badge.style.padding = '0.3rem 0.6rem';
        badge.style.borderRadius = '0.5rem';
        badge.style.fontSize = '0.8rem';
        badge.style.fontFamily = 'monospace';

        const textSpan = document.createElement('span');
        textSpan.textContent = rule;

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '?';
        delBtn.style.background = 'none';
        delBtn.style.border = 'none';
        delBtn.style.color = '#ef4444';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontWeight = 'bold';
        delBtn.style.padding = '0 2px';
        delBtn.style.marginLeft = '4px';

        delBtn.onclick = async () => {
            const data = await chrome.storage.local.get(['domainRules']);
            let current = data.domainRules || [];
            current.splice(idx, 1);
            await chrome.storage.local.set({ domainRules: current });
            renderDomainRules(current);
        };

        badge.appendChild(textSpan);
        badge.appendChild(delBtn);
        container.appendChild(badge);
    });
}

// Lock Active Tab button
const lockActiveTabBtn = document.getElementById('btn-lock-active-tab');
if (lockActiveTabBtn) {
    lockActiveTabBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'LOCK_ACTIVE_TAB' }, () => {
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'H_icon.png',
                    title: '?? Tab Locked',
                    message: 'Active tab has been locked by LockBrowse Pro.'
                });
            }
        });
    });
}

// Add Domain Rule
const addDomainRuleBtn = document.getElementById('btn-add-domain-rule');
const domainRuleInput = document.getElementById('domain-rule-input');
if (addDomainRuleBtn && domainRuleInput) {
    const handleAddRule = async () => {
        const val = domainRuleInput.value.trim().toLowerCase();
        if (!val) return;
        const data = await chrome.storage.local.get(['domainRules']);
        let current = data.domainRules || [];
        if (!current.includes(val)) {
            current.push(val);
            await chrome.storage.local.set({ domainRules: current });
            renderDomainRules(current);
        }
        domainRuleInput.value = '';
    };

    addDomainRuleBtn.addEventListener('click', handleAddRule);
    domainRuleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRule();
        }
    });
}

// Presets
document.querySelectorAll('.btn-preset-domain').forEach(btn => {
    btn.addEventListener('click', async () => {
        const preset = btn.dataset.preset;
        let additions = [];
        if (preset === 'banking') {
            additions = ['*.chase.com', '*.paypal.com', '*.bankofamerica.com', '*.wellsfargo.com'];
        } else if (preset === 'social') {
            additions = ['*.facebook.com', '*.x.com', '*.twitter.com', '*.instagram.com', '*.tiktok.com'];
        }
        const data = await chrome.storage.local.get(['domainRules']);
        let current = data.domainRules || [];
        additions.forEach(item => {
            if (!current.includes(item)) current.push(item);
        });
        await chrome.storage.local.set({ domainRules: current });
        renderDomainRules(current);
    });
});

// Domain Lock toggle
const domainLockCb = document.getElementById('enable-domain-lock-checkbox');
if (domainLockCb) {
    domainLockCb.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ isDomainLockEnabled: e.target.checked });
    });
}

// Domain Lock mode radios
document.querySelectorAll('input[name=\"domain-lock-mode\"]').forEach(r => {
    r.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ domainLockMode: e.target.value });
    });
});