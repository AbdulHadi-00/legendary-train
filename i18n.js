// i18n.js - Multilingual Internationalization Engine for Profile Lock Pro
// Supported: English (en), Urdu (ur), Arabic (ar), Chinese (zh)

const TRANSLATIONS = {
    en: {
        // Common & Headers
        app_title: "Profile Lock Pro",
        app_subtitle: "Set up your 8-digit security passcode below.",
        confirm_passcode: "Confirm Passcode:",
        passcode_mismatch: "Passcodes do not match or are incomplete.",
        btn_save_lock: "Save & Lock Profile",
        btn_complete_setup: "Complete Setup & Lock Profile",
        btn_download_codes_png: "Download Backup Codes (PNG)",
        btn_signin_recovery: "Sign In for Recovery",
        btn_sign_out: "Sign Out",
        btn_clear_logs: "Clear Logs",
        secured_account: "Secured Google Account",
        or_divider: "OR",
        
        // Language Picker
        lang_title: "🌐 Interface Language",
        lang_desc: "Switch language across Settings and the Lock Screen (English, اردو, العربية, 中文).",

        // Penalty, Auto-Lock, Blur, Max Tries
        penalty_title: "Lockout Penalty Time (Seconds)",
        penalty_desc: "Set the timeout duration after a wrong passcode attempt to increase strength. (10s - 60s)",
        autolock_title: "Idle Auto-Lock (Minutes)",
        autolock_desc: "Automatically lock the profile if you step away. (0 to disable, up to 60 mins)",
        blur_title: "Soft-Blur Privacy Time (Seconds)",
        blur_desc: "Screen will gently blur after this many seconds of inactivity. (Set to 0 to disable)",
        maxtries_title: "Maximum Passcode Tries",
        maxtries_desc: "Set the number of tries allowed before lockout. (1 - 30)",

        // Intruder & Security
        siren_title: "Intruder Siren Alarm",
        siren_label: "Play loud siren when maximum lockout is triggered",
        selfie_title: "Silent Webcam Selfie Capture",
        selfie_desc: "Silently take a webcam photo of the intruder if they fail the passcode 3 times.",
        selfie_label: "Enable silent selfie capture",
        camera_perm_req: "Permission Required:",
        camera_perm_desc: "To use this feature silently, you must grant the extension camera access now.",
        btn_test_camera: "Test & Grant Camera Permission",

        // Stealth & Poison
        stealth_title: "Stealth \"Duress\" Passcode",
        stealth_desc: "Set a secondary 8-digit passcode. If forced to unlock, enter this to close active tabs and hide your work.",
        stealth_clear_label: "Clear browsing history & cache on Stealth Unlock",
        poison_title: "Poison \"Wipe\" Passcode",
        poison_badge: "Extreme Security",
        poison_desc: "Set a tertiary 8-digit passcode. If entered, instantly and permanently wipes all saved passwords, autofill, cookies, and history.",

        // 2FA TOTP
        totp_title: "🔐 2FA / TOTP Authenticator Support",
        totp_badge: "Enhanced Security",
        totp_desc: "Require a 6-digit code from Google Authenticator, Authy, or 1Password when unlocking.",
        totp_label: "Enable 2FA Authenticator Requirement",
        totp_step1: "1. Scan QR Code inside Authenticator App:",
        totp_step2: "2. Verify Test 6-Digit Code:",
        btn_verify_code: "Verify Code",
        btn_copy: "📋 Copy",

        // Voice Unlock
        voice_title: "🎙 Voice Phrase Unlock",
        voice_badge: "Hands-Free",
        voice_desc: "Unlock your profile by speaking a custom secret passphrase into your microphone.",
        voice_custom_label: "Custom Secret Phrase",
        voice_enable_label: "Enable Voice Phrase Recognition",
        btn_test_voice: "🎙 Test Voice Recognition",
        btn_record_voice: "🎤 Record Voice Unlock Phrase",
        btn_remove_voice: "✕ Remove Saved Phrase",

        // Panic Shortcut & Security Question
        panic_title: "Panic Button (Quick Lock)",
        panic_desc: "Quickly lock your profile using a keyboard shortcut from anywhere.",
        btn_configure_shortcut: "Configure Shortcut (Default: Ctrl+Shift+L)",
        sec_question_title: "Security Question Backup",
        sec_question_desc: "A final fallback to recover your profile if you lose your passcode and backup Vault.",
        sec_question_label: "Custom Question",
        sec_answer_label: "Answer (Case-Sensitive)",

        // Extreme Features
        audio_title: "🎙 Stealth Audio Recording",
        audio_badge: "Extreme",
        audio_perm_title: "Required: Microphone Permission",
        audio_perm_desc: "Click the button below to grant the extension microphone access before enabling this feature.",
        ransomware_badge: "Extreme",
        tab_suspend_badge: "Optional",
        face_badge: "New",
        audio_desc: "After 3 failed passcode attempts, silently records 15 seconds of ambient audio and saves it.",
        audio_label: "Enable stealth audio recording after 3 failed attempts",
        btn_grant_audio: "Test & Grant Microphone",
        ransomware_title: "☠ Fake Ransomware Terror Screen",
        ransomware_desc: "After 5 total failed attempts, displays a terrifying full-screen \"SYSTEM ENCRYPTED\" countdown to scare intruders away.",
        ransomware_label: "Enable fake ransomware terror screen",
        btn_preview_ransomware: "Preview Ransomware Screen",
        selfdestruct_title: "💥 Self-Destruct (Data Wipe)",
        selfdestruct_badge: "Irreversible",
        selfdestruct_desc: "If the passcode is entered wrong 10 times, permanently erases all browsing history, cache, and cookies.",
        selfdestruct_label: "Enable Self-Destruct after 10 failed attempts",
        tab_suspend_title: "🧠 Deep Tab Suspension (RAM Wipe)",
        tab_suspend_desc: "When locked, background tabs are unloaded from RAM to prevent page memory extraction.",
        tab_suspend_label: "Enable deep tab suspension when locked",

        // Continuous Face ID
        face_title: "👁 Continuous Face ID & Face Unlock",
        face_desc: "Unlocks the browser using your face, and periodically checks the webcam while you browse. If it detects a different person, it locks immediately.",
        btn_setup_face: "📸 Set Up Face ID",
        btn_remove_face: "✕ Remove Saved Face Profile",
        face_label: "Enable Continuous Face ID Background Lock",

        // New Advanced Features
        theme_title: "🎨 Lock Screen Theme Style",
        theme_desc: "Select the visual aesthetic for your lock screen interface.",
        theme_gold: "Luxury Gold",
        theme_matrix: "Cyber Matrix",
        theme_oled: "OLED Dark",
        theme_apple: "Apple Glass",
        tamper_title: "🛡️ Anti-Uninstall & Tamper Protection",
        tamper_badge: "Armor",
        tamper_desc: "Strictly requires entering your master passcode before anyone can open chrome://extensions or attempt to disable or remove Profile Lock Pro.",
        tamper_label: "Lock extensions & block unauthorized uninstall",
        incognito_title: "🕶️ Incognito Window Lockdown",
        incognito_desc: "Automatically intercepts and blocks Incognito mode the moment any private window is opened, preventing history and extension bypass.",
        incognito_label: "Auto-block and close all Incognito windows",
        minimize_title: "⚡ Instant Lock on Window Minimize & Screen Lock",
        minimize_desc: "Immediately activates the lock screen whenever Chrome is minimized, you switch to another app, or your laptop lid is closed.",
        minimize_label: "Instant lock on minimize / screen lock",
        forensic_title: "🕵️ Intruder Forensic Dashboard",
        forensic_desc: "Live audit log of unauthorized attempts. Shows timestamp, attempted passcode digits, captured webcam photos, and audio recordings.",
        no_forensics: "No intruder attempts recorded. Your profile is secure.",
        vault_backup_title: "🔐 Encrypted Vault Backup & Restore (AES-256)",
        vault_backup_desc: "Export your full profile configuration and recovery credentials as a password-protected .vault file encrypted with military-grade AES-256-GCM.",
        btn_export_vault: "Export .vault File",
        btn_import_vault: "Import & Restore .vault",

        // Lock Screen Translations
        lock_title: "Profile Locked",
        lock_subtitle: "Enter your 8-digit passcode to continue.",
        btn_unlock: "Unlock Profile",
        link_forgot_passcode: "Forgot Passcode?",
        link_back_to_pin: "Back to PIN",
        err_incorrect_passcode: "Incorrect passcode. Try again.",
        err_invalid_2fa: "Invalid 2FA Authenticator Code.",
        lock_totp_title: "🔐 Two-Factor Authentication",
        lock_totp_desc: "Enter 6-digit code from Google Authenticator or Authy",
        btn_totp_unlock: "Verify 2FA & Unlock",
        lock_email_2fa_title: "2FA Email Recovery",
        lock_email_2fa_desc: "Send a one-time alphanumeric code to your linked recovery email:",
        btn_send_2fa: "Send One-Time 2FA Code",
        btn_verify_2fa: "Verify 2FA & Unlock",
        lock_backup_title: "Backup Recovery",
        input_enter_backup: "Enter Backup Code",
        btn_verify_unlock: "Verify & Unlock",
        lock_sec_title: "Security Question",
        input_sec_answer: "Enter Answer (Case-Sensitive)",
        btn_submit_answer: "Submit Answer",
        err_incorrect_answer: "Incorrect answer.",
        lock_voice_title: "🎙 Voice Unlock",
        lock_voice_desc: "Press the button and speak your unlock phrase clearly.",
        btn_start_voice: "Start Voice Unlock",
        err_voice_fail: "Voice did not match.",
        lock_face_title: "Face Unlock",
        btn_start_face: "📸 Start Face Unlock",
        err_face_fail: "Face did not match.",

        // Additional Supplemental Keys
        security_active_title: "Security Active",
        security_active_desc: "Your 8-digit security profile is currently active and protected.",
        btn_configure_settings: "⚙️ Configure All Security Settings",
        btn_change_passcode: "Change Passcode",
        btn_deactivate: "Deactivate Global Lock",
        incognito_warning_title: "⚠️ Security Vulnerability Detected",
        incognito_warning_desc: "Profile Lock Pro is not allowed in Incognito mode. An attacker could bypass the lock by opening an Incognito window. Please go to chrome://extensions, find this extension, and enable 'Allow in Incognito'.",
        test_capture_title: "Test Intruder Capture",
        test_capture_desc: "Use these buttons to test selfie and audio capture.",
        btn_test_selfie: "Test Selfie Capture",
        btn_test_audio: "Test Audio Capture",
        totp_step1_sub: "Open Google Authenticator or Authy → Tap + → Tap Scan a QR Code",
        totp_secret_desc: "Or tap \"Enter a setup key\" in Authenticator app & use Secret Key:",
        voice_rec_title: "🎤 Voice Unlock Phrase",
        voice_rec_desc: "Record a secret spoken phrase. On the lock screen, click \"Forgot Passcode?\" and use Voice Unlock to speak your phrase and unlock the browser.",
        google_signin_title: "Sign in with Google",
        google_signin_desc: "Click below to sign in with your real Google account via a secure popup. Your email will be used as the recovery address for your security vault.",
        btn_google_oauth: "Sign in with Google",
        vault_active_title: "Success! Security Vault Active",
        recovery_pair_title: "Your Primary Recovery Pair:",
        full_vault_title: "Full Vault (10 Codes Generated)",
        btn_download_card: "Download Vault Card (PNG/JPG)",
        vault_offline_note: "(Primary codes sent to recovery email. Full vault must be downloaded for offline access.)",
        creator_made_by: "Made by",
        lockbrowse_pro_title: "🔒 LockBrowse Pro: Anti-Bypass & Domain/Tab Shield",
        lockbrowse_pro_badge: "Anti-Bypass Mode",
        lockbrowse_pro_desc: "Modern anti-bypass session architecture. Enforces true page-redirection to locked.html instead of vulnerable CSS overlays, with domain list locking and individual tab protection.",
        lockbrowse_status_redirection: "✓ True Page-Redirection Architecture (locked.html)",
        lockbrowse_status_session: "✓ Session State Suspender & Target URL Restorer",
        lockbrowse_status_salt: "✓ Salted SHA-256 Cryptographic Hash Engine",
        lockbrowse_tab_title: "📌 Individual Tab Lock",
        lockbrowse_tab_desc: "Lock specific tabs via right-click context menu ('Lock This Tab') or click below. When unlocked, smoothly restores the original page.",
        btn_lock_current_tab: "🔒 Lock Current Active Tab Now",
        lockbrowse_domain_title: "🌐 Domain / URL List Locking",
        lockbrowse_domain_desc: "Automatically intercept and redirect visits to specified domains to the lock screen until master passcode is entered.",
        lockbrowse_enable_domain_label: "Enable Domain / List Auto-Locking",
        lockbrowse_mode_blacklist: "Blacklist Mode (Block listed domains)",
        lockbrowse_mode_whitelist: "Whitelist Mode (Block all except listed)",
        lockbrowse_domain_input_ph: "e.g., *.banking.com, facebook.com",
        btn_add_domain_rule: "+ Add Rule",
        lockbrowse_presets_label: "Quick Presets:",
        lockbrowse_no_domains: "No domain rules configured yet.",
        lock_tab_title: "Tab Locked",
        lock_tab_subtitle: "Enter your 8-digit passcode to unlock this tab.",
        btn_unlock_tab: "Unlock Tab",
        lock_domain_title: "Domain Protected",
        lock_domain_subtitle: "Access to this website is locked. Enter passcode to proceed.",
        btn_unlock_domain: "Unlock Domain & Browse"
    },

    ur: {
        // Urdu (اردو) - Right to Left
        app_title: "پروفائل لاک پرو",
        app_subtitle: "اپنا 8 ہندسوں کا سیکیورٹی پاس کوڈ نیچے سیٹ کریں۔",
        confirm_passcode: "پاس کوڈ کی تصدیق کریں:",
        passcode_mismatch: "پاس کوڈز مماثل نہیں ہیں یا نامکمل ہیں۔",
        btn_save_lock: "محفوظ کریں اور پروفائل لاک کریں",
        btn_complete_setup: "سیٹ اپ مکمل کریں اور پروفائل لاک کریں",
        btn_download_codes_png: "بیک اپ کوڈز ڈاؤن لوڈ کریں (PNG)",
        btn_signin_recovery: "بازیابی کے لیے گوگل سائن ان",
        btn_sign_out: "لاگ آؤٹ",
        btn_clear_logs: "لاگز صاف کریں",
        secured_account: "محفوظ شدہ گوگل اکاؤنٹ",
        or_divider: "یا",

        // Language Picker
        lang_title: "🌐 انٹرفیس کی زبان",
        lang_desc: "سیٹنگز اور لاک اسکرین کی زبان منتخب کریں (انگریزی، اردو، عربی، چینی)۔",

        // Penalty, Auto-Lock, Blur, Max Tries
        penalty_title: "لاک آؤٹ تاخیر کا وقت (سیکنڈز)",
        penalty_desc: "غلط پاس کوڈ کے بعد انتظار کا وقت طے کریں تاکہ سیکیورٹی بڑھے۔ (10 تا 60 سیکنڈ)",
        autolock_title: "غیر فعال خودکار لاک (منٹ)",
        autolock_desc: "جب آپ کمپیوٹر سے دور ہوں تو براؤزر کو خودکار طریقے سے لاک کریں۔ (0 تا 60 منٹ)",
        blur_title: "سافٹ بلر پرائیویسی ٹائم (سیکنڈز)",
        blur_desc: "غیر فعالی کے بعد اسکرین آہستہ سے دھندلی ہو جائے گی۔ (0 غیر فعال کرنے کے لیے)",
        maxtries_title: "زیادہ سے زیادہ کوششیں",
        maxtries_desc: "لاک آؤٹ سے پہلے اجازت دی گئی کوششوں کی تعداد۔ (1 تا 30)",

        // Intruder & Security
        siren_title: "گھس بیٹھیا سائرن الارم",
        siren_label: "حد سے زیادہ غلط کوششوں پر تیز سائرن بجائیں",
        selfie_title: "خفیہ کیمرہ سیلفی",
        selfie_desc: "3 غلط کوششوں کے بعد گھس بیٹھیا کی خاموشی سے ویب کیم تصویر لیں۔",
        selfie_label: "خاموش سیلفی کیپچر کو فعال کریں",
        camera_perm_req: "اجازت درکار ہے:",
        camera_perm_desc: "اس فیچر کے خاموش استعمال کے لیے کیمرے کی اجازت دیں۔",
        btn_test_camera: "کیمرے کی اجازت چیک کریں اور دیں",

        // Stealth & Poison
        stealth_title: "خفیہ دباؤ پاس کوڈ (سٹائلتھ موڈ)",
        stealth_desc: "اگر کوئی آپ کو زبردستی انلاک کرنے پر مجبور کرے تو یہ کوڈ درج کریں۔ یہ فوری تمام ٹیبز بند کر دے گا۔",
        stealth_clear_label: "سٹائلتھ انلاک پر براؤزنگ ہسٹری اور کیشے صاف کریں",
        poison_title: "پوائزن وائپ پاس کوڈ (تمام ڈیٹا ختم)",
        poison_badge: "انتہائی سیکیورٹی",
        poison_desc: "یہ کوڈ درج کرنے سے تمام محفوظ پاس ورڈز، کوکیز اور ہسٹری مستقل طور پر مٹ جائے گی۔",

        // 2FA TOTP
        totp_title: "🔐 2FA / TOTP توثیق کار سپورٹ",
        totp_badge: "بہترین سیکیورٹی",
        totp_desc: "انلاک کرنے کے لیے گوگل توثیق کار یا اوتھی سے 6 ہندسوں کا کوڈ لازمی قرار دیں۔",
        totp_label: "2FA توثیق کار کی ضرورت فعال کریں",
        totp_step1: "1. توثیق کار ایپ میں QR کوڈ اسکین کریں:",
        totp_step2: "2. امتحانی 6 ہندسوں کا کوڈ درج کر کے تصدیق کریں:",
        btn_verify_code: "کوڈ کی تصدیق کریں",
        btn_copy: "📋 کاپی کریں",

        // Voice Unlock
        voice_title: "🎙 آواز کے فقرے سے انلاک",
        voice_badge: "ہینڈز فری",
        voice_desc: "مائیکروفون میں اپنا خفیہ فقرہ بول کر پروفائل انلاک کریں۔",
        voice_custom_label: "آپ کا خفیہ فقرہ",
        voice_enable_label: "وائس فقرے کی شناخت فعال کریں",
        btn_test_voice: "🎙 آواز کی شناخت ٹیسٹ کریں",
        btn_record_voice: "🎤 وائس انلاک فقرہ ریکارڈ کریں",
        btn_remove_voice: "✕ محفوظ شدہ فقرہ ہٹائیں",

        // Panic Shortcut & Security Question
        panic_title: "فوری پینک بٹن (فوری لاک)",
        panic_desc: "کہیں سے بھی کی بورڈ شارٹ کٹ کے ذریعے براؤزر کو فوری لاک کریں۔",
        btn_configure_shortcut: "شارٹ کٹ سیٹ کریں (طے شدہ: Ctrl+Shift+L)",
        sec_question_title: "حفاظتی سوال کا بیک اپ",
        sec_question_desc: "اگر آپ پاس کوڈ بھول جائیں تو بازیابی کے لیے سوال کا جواب دیں۔",
        sec_question_label: "حفاظتی سوال",
        sec_answer_label: "جواب (حروف کا خیال رکھیں)",

        // Extreme Features
        audio_title: "🎙 خفیہ آڈیو ریکارڈنگ",
        audio_badge: "انتہائی",
        audio_perm_title: "ضروری: مائیکروفون اجازت",
        audio_perm_desc: "مائیکروفون اجازت دینے کے لیے بٹن دبائیں۔",
        ransomware_badge: "انتہائی",
        tab_suspend_badge: "اختیاری",
        face_badge: "نیا",
        audio_desc: "3 غلط کوششوں کے بعد ارد گرد کی 15 سیکنڈ کی آواز خاموشی سے ریکارڈ کریں۔",
        audio_label: "3 غلط کوششوں پر خفیہ آڈیو ریکارڈنگ فعال کریں",
        btn_grant_audio: "مائیکروفون ٹیسٹ کریں اور اجازت دیں",
        ransomware_title: "☠ جعلی رینسم ویئر وارننگ اسکرین",
        ransomware_desc: "5 غلط کوششوں کے بعد ہیکرز کو بھگانے کے لیے جعلی لاک وارننگ دکھائیں۔",
        ransomware_label: "جعلی رینسم ویئر اسکرین فعال کریں",
        btn_preview_ransomware: "رینسم ویئر اسکرین دیکھیں",
        selfdestruct_title: "💥 خودکار بربادی (مکمل ڈیٹا ختم)",
        selfdestruct_badge: "ناقابل واپسی",
        selfdestruct_desc: "10 غلط کوششوں پر تمام براؤزنگ ڈیٹا، کیشے اور کوکیز ہمیشہ کے لیے مٹا دیں۔",
        selfdestruct_label: "10 غلط کوششوں پر ڈیٹا ختم کریں",
        tab_suspend_title: "🧠 ٹیبز معطلی (ریم صفائی)",
        tab_suspend_desc: "لاک ہونے پر تمام پس منظر ٹیبز کو میموری سے خالی کریں۔",
        tab_suspend_label: "لاک ہونے پر ٹیبز معطل کریں",

        // Continuous Face ID
        face_title: "👁 مسلسل چہرے کی شناخت (Face ID)",
        face_desc: "اپنے چہرے سے انلاک کریں اور براؤزنگ کے دوران کیمرہ خودکار چیک کرے گا۔",
        btn_setup_face: "📸 فیس آئی ڈی سیٹ کریں",
        btn_remove_face: "✕ محفوظ شدہ چہرہ ہٹائیں",
        face_label: "مسلسل فیس آئی ڈی لاک فعال کریں",

        // New Advanced Features
        theme_title: "🎨 لاک اسکرین تھیم کا انداز",
        theme_desc: "اپنی لاک اسکرین کے لیے پسندیدہ رنگ اور اسٹائل چنیں۔",
        theme_gold: "لگژری گولڈ",
        theme_matrix: "سائبر میٹرکس",
        theme_oled: "او ایل ای ڈی ڈارک",
        theme_apple: "ایپل گلاس",
        tamper_title: "🛡️ اینٹی اَن انسٹال اور چھیڑ چھاڑ تحفظ",
        tamper_badge: "فولادی سیکیورٹی",
        tamper_desc: "ایکسٹینشنز کو کھولنے یا ڈیلیٹ کرنے سے پہلے ماسٹر پاس کوڈ لازمی ہوگا۔",
        tamper_label: "ایکسٹینشنز محفوظ کریں اور بلا اجازت ہٹانا روکیں",
        incognito_title: "🕶️ انکوگنیٹو پرائیویٹ ونڈو لاک ڈاؤن",
        incognito_desc: "پرائیویٹ ونڈو کھلتے ہی اسے فوری بند کر کے محفوظ رکھیں تاکہ کوئی بائی پاس نہ کر سکے۔",
        incognito_label: "تمام انکوگنیٹو ونڈوز خودکار بند کریں",
        minimize_title: "⚡ منیمائز یا اسکرین لاک پر فوری لاک",
        minimize_desc: "جب بھی کروم منیمائز ہو یا لیپ ٹاپ کا ڈھکن بند ہو، فوری لاک ہو جائے گا۔",
        minimize_label: "منیمائز اور اسکرین لاک پر فوری لاک فعال کریں",
        forensic_title: "🕵️ گھس بیٹھیا فرانزک ڈیش بورڈ",
        forensic_desc: "غلط پاس کوڈ کی تمام کوششوں کی لائیو رپورٹ، تصاویر اور آڈیو ریکارڈنگز۔",
        no_forensics: "کوئی غیر مجاز کوشش ریکارڈ نہیں ہوئی۔ آپ کا پروفائل محفوظ ہے۔",
        vault_backup_title: "🔐 انکرپٹڈ والٹ بیک اپ اور بحالی (AES-256)",
        vault_backup_desc: "اپنی تمام سیٹنگز اور والٹ کوڈز کو پاس ورڈ کے ساتھ محفوظ .vault فائل میں ایکسپورٹ کریں۔",
        btn_export_vault: ".vault فائل ایکسپورٹ کریں",
        btn_import_vault: ".vault فائل امپورٹ اور بحال کریں",

        // Lock Screen Translations
        lock_title: "پروفائل مقفل ہے",
        lock_subtitle: "جاری رکھنے کے لیے اپنا 8 ہندسوں کا پاس کوڈ درج کریں۔",
        btn_unlock: "پروفائل انلاک کریں",
        link_forgot_passcode: "پاس کوڈ بھول گئے؟",
        link_back_to_pin: "پن پر واپس جائیں",
        err_incorrect_passcode: "غلط پاس کوڈ۔ دوبارہ کوشش کریں۔",
        err_invalid_2fa: "غلط 2FA توثیق کار کوڈ۔",
        lock_totp_title: "🔐 دو مرحلہ تصدیق (2FA)",
        lock_totp_desc: "گوگل توثیق کار یا اوتھی سے 6 ہندسوں کا کوڈ درج کریں",
        btn_totp_unlock: "2FA کی تصدیق کریں اور انلاک کریں",
        lock_email_2fa_title: "ای میل 2FA ریکوری",
        lock_email_2fa_desc: "اپنے منسلک ریکوری ای میل پر یک وقتی کوڈ بھیجیں:",
        btn_send_2fa: "یک وقتی 2FA کوڈ بھیجیں",
        btn_verify_2fa: "2FA تصدیق کریں اور انلاک کریں",
        lock_backup_title: "بیک اپ کوڈ سے بازیابی",
        input_enter_backup: "بیک اپ کوڈ درج کریں",
        btn_verify_unlock: "تصدیق کریں اور انلاک کریں",
        lock_sec_title: "حفاظتی سوال",
        input_sec_answer: "جواب درج کریں",
        btn_submit_answer: "جواب جمع کرائیں",
        err_incorrect_answer: "غلط جواب۔",
        lock_voice_title: "🎙 آواز سے انلاک",
        lock_voice_desc: "بٹن دبائیں اور اپنا انلاک فقرہ واضح بولیں۔",
        btn_start_voice: "وائس انلاک شروع کریں",
        err_voice_fail: "آواز مماثل نہیں ہے۔",
        lock_face_title: "چہرے سے انلاک",
        btn_start_face: "📸 فیس انلاک شروع کریں",
        err_face_fail: "چہرہ مماثل نہیں ہے۔",

        // Additional Supplemental Keys
        security_active_title: "سیکیورٹی فعال ہے",
        security_active_desc: "آپ کا 8 ہندسوں کا سیکیورٹی پروفائل اس وقت فعال اور محفوظ ہے۔",
        btn_configure_settings: "⚙️ تمام سیکیورٹی سیٹنگز تشکیل دیں",
        btn_change_passcode: "پاس کوڈ تبدیل کریں",
        btn_deactivate: "گلوبل لاک غیر فعال کریں",
        incognito_warning_title: "⚠️ سیکیورٹی خطرہ دریافت ہوا",
        incognito_warning_desc: "پروفائل لاک پرو انکوگنیٹو موڈ میں فعال نہیں ہے۔ براہ کرم chrome://extensions پر جا کر Allow in Incognito آن کریں۔",
        test_capture_title: "گھس بیٹھیا ٹیسٹ کیپچر",
        test_capture_desc: "سیلفی اور آڈیو ریکارڈنگ ٹیسٹ کرنے کے لیے نیچے دیے گئے بٹن استعمال کریں۔",
        btn_test_selfie: "سیلفی کیپچر ٹیسٹ کریں",
        btn_test_audio: "آڈیو کیپچر ٹیسٹ کریں",
        totp_step1_sub: "توثیق کار ایپ کھولیں ← + دبائیں ← کیو آر کوڈ اسکین کریں",
        totp_secret_desc: "یا توثیق کار ایپ میں خفیہ کلید درج کریں:",
        voice_rec_title: "🎤 وائس انلاک فقرہ",
        voice_rec_desc: "اپنا خفیہ فقرہ ریکارڈ کریں۔ لاک اسکرین پر آواز سے براؤزر انلاک کریں۔",
        google_signin_title: "گوگل سے سائن ان کریں",
        google_signin_desc: "اپنے گوگل اکاؤنٹ سے سائن ان کریں تاکہ پاس کوڈ بھولنے کی صورت میں اکاؤنٹ بازیاب کیا جا سکے۔",
        btn_google_oauth: "گوگل کے ذریعے سائن ان کریں",
        vault_active_title: "کامیابی! سیکیورٹی والٹ فعال ہے",
        recovery_pair_title: "آپ کا بنیادی ریکوری جوڑا:",
        full_vault_title: "مکمل والٹ (10 کوڈز تیار ہو چکے ہیں)",
        btn_download_card: "والٹ کارڈ ڈاؤن لوڈ کریں (PNG/JPG)",
        vault_offline_note: "(بنیادی کوڈز ریکوری ای میل پر بھیجے گئے ہیں۔ آف لائن رسائی کے لیے کارڈ ڈاؤن لوڈ کریں۔)",
        creator_made_by: "تیار کردہ",
        lockbrowse_pro_title: "🔒 لاک براؤز پرو: اینٹی بائی پاس اور ڈومین/ٹیب شیلڈ",
        lockbrowse_pro_badge: "اینٹی بائی پاس موڈ",
        lockbrowse_pro_desc: "جدید اینٹی بائی پاس سیشن آرکیٹیکچر۔ کمزور سی ایس ایس اوورلے کے بجائے اصلی پیج ری ڈائریکشن نافذ کرتا ہے۔",
        lockbrowse_status_redirection: "✓ اصلی صفحہ ری ڈائریکشن آرکیٹیکچر (locked.html)",
        lockbrowse_status_session: "✓ سیشن معطلی اور اصل یو آر ایل بحالی",
        lockbrowse_status_salt: "✓ سالٹڈ SHA-256 کرپٹوگرافک ہیش انجن",
        lockbrowse_tab_title: "📌 انفرادی ٹیب لاک",
        lockbrowse_tab_desc: "رائٹ کلک مینو یا نیچے والے بٹن کے ذریعے مخصوص ٹیبز کو لاک کریں۔ ان لاک پر اصل صفحہ بحال ہو جائے گا۔",
        btn_lock_current_tab: "🔒 موجودہ ایکٹو ٹیب کو فوراً لاک کریں",
        lockbrowse_domain_title: "🌐 ڈومین / یو آر ایل لسٹ لاکنگ",
        lockbrowse_domain_desc: "مخصوص ڈومینز وزٹ کرنے پر خودکار طریقے سے لاک اسکرین پر ری ڈائریکٹ کریں۔",
        lockbrowse_enable_domain_label: "ڈومین خودکار لاکنگ فعال کریں",
        lockbrowse_mode_blacklist: "بلیک لسٹ موڈ (درج شدہ ویب سائٹس لاک کریں)",
        lockbrowse_mode_whitelist: "وائٹ لسٹ موڈ (صرف درج شدہ کی اجازت دیں)",
        lockbrowse_domain_input_ph: "مثال: *.banking.com، facebook.com",
        btn_add_domain_rule: "+ ڈومین شامل کریں",
        lockbrowse_presets_label: "فوری پہلے سے طے شدہ:",
        lockbrowse_no_domains: "ابھی کوئی ڈومین اصول شامل نہیں کیا گیا۔",
        lock_tab_title: "ٹیب لاک ہے",
        lock_tab_subtitle: "اس ٹیب کو کھولنے کے لیے اپنا 8 ہندسوں کا پاس کوڈ درج کریں۔",
        btn_unlock_tab: "ٹیب ان لاک کریں",
        lock_domain_title: "ڈومین محفوظ ہے",
        lock_domain_subtitle: "اس ویب سائٹ تک رسائی لاک ہے۔ آگے بڑھنے کے لیے پاس کوڈ درج کریں۔",
        btn_unlock_domain: "ڈومین ان لاک کریں"
    },

    ar: {
        // Arabic (العربية) - Right to Left
        app_title: "بروفايل لوك برو",
        app_subtitle: "قم بتعيين رمز المرور المكون من 8 أرقام أدناه.",
        confirm_passcode: "تأكيد رمز المرور:",
        passcode_mismatch: "رموز المرور غير متطابقة أو غير مكتملة.",
        btn_save_lock: "حفظ وقفل الملف الشخصي",
        btn_complete_setup: "إكمال الإعداد وقفل الملف",
        btn_download_codes_png: "تنزيل رموز النسخ الاحتياطي (PNG)",
        btn_signin_recovery: "تسجيل الدخول باستخدام Google للاسترداد",
        btn_sign_out: "تسجيل الخروج",
        btn_clear_logs: "مسح السجلات",
        secured_account: "حساب Google المؤمّن",
        or_divider: "أو",

        // Language Picker
        lang_title: "🌐 لغة الواجهة",
        lang_desc: "تبديل اللغة عبر شاشة القفل والإعدادات (الإنجليزية، الأردية، العربية، الصينية).",

        // Penalty, Auto-Lock, Blur, Max Tries
        penalty_title: "مدة عقوبة القفل (بالثواني)",
        penalty_desc: "تعيين مدة الانتظار بعد كل محاولة خاطئة لزيادة الحماية. (10 إلى 60 ثانية)",
        autolock_title: "القفل التلقائي عند الخمول (بالدقائق)",
        autolock_desc: "قفل المتصفح تلقائيًا عند الابتعاد عن الجهاز. (0 للتعطيل، حتى 60 دقيقة)",
        blur_title: "وقت الخصوصية بالتمويه الخفيف (بالثواني)",
        blur_desc: "سيتم تمويه الشاشة بلطف بعد هذه المدة من عدم النشاط. (0 للتعطيل)",
        maxtries_title: "الحد الأقصى للمحاولات",
        maxtries_desc: "حدد عدد المحاولات المسموح بها قبل الإغلاق المؤقت. (1 إلى 30)",

        // Intruder & Security
        siren_title: "إنذار صفارة الدخيل",
        siren_label: "تشغيل صفارة إنذار عالية عند تجاوز الحد الأقصى للمحاولات",
        selfie_title: "التقاط صورة ذاتية صامتة للمتسلل",
        selfie_desc: "التقاط صورة صامتة عبر كاميرا الويب إذا فشل المتسلل في إدخال الرمز 3 مرات.",
        selfie_label: "تفعيل التقاط السيلفي الصامت",
        camera_perm_req: "الإذن مطلوب:",
        camera_perm_desc: "لاستخدام هذه الميزة بشكل صامت، يجب منح الإذن للكاميرا الآن.",
        btn_test_camera: "اختبار ومنح إذن الكاميرا",

        // Stealth & Poison
        stealth_title: "رمز مرور الطوارئ الخفي (Duress)",
        stealth_desc: "إذا أُجبرت على الفتح، أدخل هذا الرمز لإغلاق جميع علامات التبويب وإخفاء عملك فوراً.",
        stealth_clear_label: "مسح سجل التصفح والذاكرة المؤقتة عند الفتح الخفي",
        poison_title: "رمز المحو السام (Poison Wipe)",
        poison_badge: "أمان فائق",
        poison_desc: "إذا تم إدخال هذا الرمز، سيتم مسح جميع كلمات المرور المحفوظة وملفات تعريف الارتباط والتاريخ نهائياً.",

        // 2FA TOTP
        totp_title: "🔐 دعم المصادقة الثنائية (TOTP)",
        totp_badge: "حماية مشددة",
        totp_desc: "طلب رمز من 6 أرقام من Google Authenticator أو Authy عند فتح القفل.",
        totp_label: "تفعيل طلب المصادقة الثنائية",
        totp_step1: "1. امسح رمز الاستجابة السريعة (QR) في تطبيق المصادقة:",
        totp_step2: "2. تحقق من الرمز التجريبي المكون من 6 أرقام:",
        btn_verify_code: "التحقق من الرمز",
        btn_copy: "📋 نسخ",

        // Voice Unlock
        voice_title: "🎙 الفتح بالعبارة الصوتية",
        voice_badge: "بدون لمس",
        voice_desc: "افتح ملفك الشخصي عن طريق نطق عبارة سرية مخصصة في الميكروفون.",
        voice_custom_label: "عبارتك السرية المخصصة",
        voice_enable_label: "تفعيل التعرف على العبارة الصوتية",
        btn_test_voice: "🎙 اختبار التعرف الصوتي",
        btn_record_voice: "🎤 تسجيل عبارة الفتح الصوتية",
        btn_remove_voice: "✕ إزالة العبارة المحفوظة",

        // Panic Shortcut & Security Question
        panic_title: "زر الطوارئ (قفل سريع)",
        panic_desc: "قفل المتصفح على الفور باستخدام اختصار لوحة المفاتيح من أي مكان.",
        btn_configure_shortcut: "تكوين الاختصار (الافتراضي: Ctrl+Shift+L)",
        sec_question_title: "النسخ الاحتياطي بسؤال الأمان",
        sec_question_desc: "الملاذ الأخير لاستعادة ملفك الشخصي في حال فقدان رمز المرور والرموز الاحتياطية.",
        sec_question_label: "سؤال مخصص",
        sec_answer_label: "الإجابة (حساسة لحالة الأحرف)",

        // Extreme Features
        audio_title: "🎙 التسجيل الصوتي الخفي",
        audio_badge: "شديد",
        audio_perm_title: "مطلوب: إذن الميكروفون",
        audio_perm_desc: "انقر فوق الزر أدناه لمنح الإضافة إذن الوصول إلى الميكروفون قبل تفعيل هذه الميزة.",
        ransomware_badge: "شديد",
        tab_suspend_badge: "اختياري",
        face_badge: "جديد",
        audio_desc: "بعد 3 محاولات فاشلة، يسجل الميكروفون بصمت 15 ثانية من الصوت المحيط.",
        audio_label: "تفعيل التسجيل الصوتي الخفي بعد 3 محاولات فاشلة",
        btn_grant_audio: "اختبار ومنح إذن الميكروفون",
        ransomware_title: "☠ شاشة الفدية الوهمية للترهيب",
        ransomware_desc: "بعد 5 محاولات فاشلة، يعرض تحذيراً مرعباً بكامل الشاشة لإخافة المتسللين.",
        ransomware_label: "تفعيل شاشة الفدية الوهمية",
        btn_preview_ransomware: "معاينة شاشة الفدية",
        selfdestruct_title: "💥 التدمير الذاتي (مسح البيانات)",
        selfdestruct_badge: "لا يمكن التراجع عنه",
        selfdestruct_desc: "إذا تم إدخال رمز المرور بشكل خاطئ 10 مرات، يتم مسح كافة البيانات للأبد.",
        selfdestruct_label: "تفعيل التدمير الذاتي بعد 10 محاولات فاشلة",
        tab_suspend_title: "🧠 تعليق التبويبات العميق (تفريغ الذاكرة)",
        tab_suspend_desc: "عند القفل، يتم تفريغ التبويبات الخلفية من الذاكرة العشوائية لحماية الخصوصية.",
        tab_suspend_label: "تفعيل تعليق التبويبات العميق عند القفل",

        // Continuous Face ID
        face_title: "👁 بصمة الوجه المستمرة (Face ID)",
        face_desc: "يفتح باستخدام وجهك ويفحص الكاميرا بانتظام؛ إذا لاحظ شخصاً آخر، يقفل فوراً.",
        btn_setup_face: "📸 إعداد بصمة الوجه",
        btn_remove_face: "✕ حذف بيانات الوجه المحفوظة",
        face_label: "تفعيل القفل التلقائي ببصمة الوجه",

        // New Advanced Features
        theme_title: "🎨 طراز مظهر شاشة القفل",
        theme_desc: "حدد المظهر الجمالي المفضل لشاشة القفل والإعدادات.",
        theme_gold: "الذهب الفاخر",
        theme_matrix: "سايبر ماتريكس",
        theme_oled: "أوليد داكن",
        theme_apple: "أبل جلاس",
        tamper_title: "🛡️ الحماية من إلغاء التثبيت والعبث",
        tamper_badge: "درع الأمان",
        tamper_desc: "يتطلب إدخال رمز المرور الرئيسي بدقة قبل أن يتمكن أي شخص من فتح الإضافات أو حذفها.",
        tamper_label: "قفل الإضافات ومنع إلغاء التثبيت غير المصرح به",
        incognito_title: "🕶️ إغلاق نافذة التصفح المتخفي",
        incognito_desc: "يغلق نوافذ التصفح المتخفي (Incognito) فور فتحها لمنع تجاوز التاريخ والإضافات.",
        incognito_label: "حظر وإغلاق نوافذ التصفح الخفي تلقائياً",
        minimize_title: "⚡ القفل الفوري عند التصغير وقفل الشاشة",
        minimize_desc: "يقفل المتصفح فور تصغير Chrome أو التبديل لتطبيق آخر أو إغلاق غطاء الكمبيوتر المحمول.",
        minimize_label: "تفعيل القفل الفوري عند التصغير أو قفل الشاشة",
        forensic_title: "🕵️ لوحة معلومات التحقيق في المتسللين",
        forensic_desc: "سجل مباشر لجميع المحاولات غير المصرح بها متضمناً الصور والأصوات والأوقات.",
        no_forensics: "لم يتم تسجيل أي محاولات تسلل. ملفك الشخصي آمن تماماً.",
        vault_backup_title: "🔐 النسخ الاحتياطي المشفر والاستعادة (AES-256)",
        vault_backup_desc: "تصدير كافة الإعدادات والرموز الاحتياطية في ملف .vault مشفر بتشفير عسكري AES-256.",
        btn_export_vault: "تصدير ملف .vault",
        btn_import_vault: "استيراد واستعادة .vault",

        // Lock Screen Translations
        lock_title: "الملف الشخصي مقفل",
        lock_subtitle: "أدخل رمز المرور المكون من 8 أرقام للمتابعة.",
        btn_unlock: "فتح الملف الشخصي",
        link_forgot_passcode: "هل نسيت رمز المرور؟",
        link_back_to_pin: "الرجوع إلى الرمز",
        err_incorrect_passcode: "رمز المرور غير صحيح. حاول مرة أخرى.",
        err_invalid_2fa: "رمز المصادقة الثنائية غير صحيح.",
        lock_totp_title: "🔐 المصادقة الثنائية",
        lock_totp_desc: "أدخل الرمز المكون من 6 أرقام من Google Authenticator أو Authy",
        btn_totp_unlock: "تحقق وافتح",
        lock_email_2fa_title: "استرداد المصادقة عبر البريد الإلكتروني",
        lock_email_2fa_desc: "إرسال رمز مؤقت لمرة واحدة إلى بريد الاسترداد:",
        btn_send_2fa: "إرسال رمز التحقق لمرة واحدة",
        btn_verify_2fa: "تحقق وافتح",
        lock_backup_title: "استرداد الرمز الاحتياطي",
        input_enter_backup: "أدخل رمز النسخ الاحتياطي",
        btn_verify_unlock: "تحقق وافتح",
        lock_sec_title: "سؤال الأمان",
        input_sec_answer: "أدخل الإجابة",
        btn_submit_answer: "إرسال الإجابة",
        err_incorrect_answer: "إجابة غير صحيحة.",
        lock_voice_title: "🎙 الفتح الصوتي",
        lock_voice_desc: "اضغط على الزر وتحدث بعبارة الفتح بوضوح.",
        btn_start_voice: "بدء الفتح بالصوت",
        err_voice_fail: "الصوت غير متطابق.",
        lock_face_title: "الفتح ببصمة الوجه",
        btn_start_face: "📸 بدء الفتح بالوجه",
        err_face_fail: "الوجه غير متطابق.",

        // Additional Supplemental Keys
        security_active_title: "الأمان نشط",
        security_active_desc: "ملفك الأمني المكون من 8 أرقام نشط ومحمي حاليًا.",
        btn_configure_settings: "⚙️ ضبط جميع إعدادات الأمان",
        btn_change_passcode: "تغيير رمز المرور",
        btn_deactivate: "تعطيل القفل الشامل",
        incognito_warning_title: "⚠️ تم اكتشاف ثغرة أمنية",
        incognito_warning_desc: "الملف غير مفعل في وضع التصفح المتخفي. يرجى التوجه إلى chrome://extensions وتفعيل السماح في التصفح المتخفي.",
        test_capture_title: "اختبار التقاط المتسلل",
        test_capture_desc: "استخدم الأزرار أدناه لاختبار التقاط الصور والتسجيل الصوتي.",
        btn_test_selfie: "اختبار التقاط الصورة",
        btn_test_audio: "اختبار تسجيل الصوت",
        totp_step1_sub: "افتح تطبيق المصادقة ← اضغط + ← امسح رمز QR",
        totp_secret_desc: "أو أدخل المفتاح السري يدويًا في تطبيق المصادقة:",
        voice_rec_title: "🎤 عبارة الفتح الصوتي",
        voice_rec_desc: "سجل عبارة صوتية سرية للفتح بدون لمس عند قفل الشاشة.",
        google_signin_title: "تسجيل الدخول باستخدام Google",
        google_signin_desc: "سجل الدخول بحساب Google لربط بريد الاسترداد الخاص بك بأمان.",
        btn_google_oauth: "تسجيل الدخول عبر Google",
        vault_active_title: "نجاح! الخزنة الأمنية نشطة",
        recovery_pair_title: "زوج رموز الاسترداد الأساسي:",
        full_vault_title: "الخزنة الكاملة (تم إنشاء 10 رموز)",
        btn_download_card: "تنزيل بطاقة الخزنة (PNG/JPG)",
        vault_offline_note: "(تم إرسال الرموز إلى بريدك. قم بتنزيل البطاقة للوصول بدون إنترنت.)",
        creator_made_by: "صنع بواسطة",
        lockbrowse_pro_title: "🔒 لوك براوز برو: حماية ضد التجاوز وقفل النطاقات والتبويبات",
        lockbrowse_pro_badge: "وضع مكافحة التجاوز",
        lockbrowse_pro_desc: "بنية جلسة أمنية تمنع التجاوز عبر إعادة توجيه حقيقية إلى locked.html بدلاً من طبقات CSS السطحية.",
        lockbrowse_status_redirection: "✓ بنية إعادة توجيه حقيقية للصفحات (locked.html)",
        lockbrowse_status_session: "✓ تعليق الجلسة واستعادة الروابط الأصلية بسلاسة",
        lockbrowse_status_salt: "✓ محرك تشفير SHA-256 مع ملح عشوائي",
        lockbrowse_tab_title: "📌 قفل التبويب الفردي",
        lockbrowse_tab_desc: "قفل أي تبويب محدد عبر قائمة النقر بالزر الأيمن أو الزر أدناه مع استعادة الصفحة عند إلغاء القفل.",
        btn_lock_current_tab: "🔒 قفل التبويب النشط الآن",
        lockbrowse_domain_title: "🌐 قفل قائمة النطاقات والمواقع",
        lockbrowse_domain_desc: "اعتراض فوري وإعادة توجيه أي زيارة للنطاقات المحددة إلى شاشة القفل.",
        lockbrowse_enable_domain_label: "تفعيل القفل التلقائي للنطاقات",
        lockbrowse_mode_blacklist: "وضع القائمة السوداء (قفل النطاقات المحددة)",
        lockbrowse_mode_whitelist: "وضع القائمة البيضاء (قفل كل المواقع عدا المحددة)",
        lockbrowse_domain_input_ph: "مثال: *.banking.com، facebook.com",
        btn_add_domain_rule: "+ إضافة نطاق",
        lockbrowse_presets_label: "خيارات سريعة:",
        lockbrowse_no_domains: "لم يتم تكوين أي نطاقات بعد.",
        lock_tab_title: "التبويب مقفل",
        lock_tab_subtitle: "أدخل رمز المرور المكون من 8 أرقام لفتح هذا التبويب.",
        btn_unlock_tab: "فتح التبويب",
        lock_domain_title: "نطاق محمي",
        lock_domain_subtitle: "تم تقييد الوصول لهذا الموقع. أدخل رمز المرور للمتابعة.",
        btn_unlock_domain: "فتح النطاق والتصفح"
    },

    zh: {
        // Chinese (中文) - Left to Right
        app_title: "Profile Lock Pro 专业锁",
        app_subtitle: "在下方设置您的 8 位安全密码。",
        confirm_passcode: "确认密码：",
        passcode_mismatch: "密码不匹配或输入不完整。",
        btn_save_lock: "保存并锁定个人资料",
        btn_complete_setup: "完成设置并锁定个人资料",
        btn_download_codes_png: "下载备用代码卡片 (PNG)",
        btn_signin_recovery: "登录 Google 账号进行恢复",
        btn_sign_out: "退出登录",
        btn_clear_logs: "清除日志",
        secured_account: "已绑定的 Google 账号",
        or_divider: "或",

        // Language Picker
        lang_title: "🌐 界面语言",
        lang_desc: "切换设置与锁定屏幕的界面语言（英语、乌尔都语、阿拉伯语、中文）。",

        // Penalty, Auto-Lock, Blur, Max Tries
        penalty_title: "锁定惩罚时间（秒）",
        penalty_desc: "输错密码后的强制等待时间，以增强防暴力破解能力。（10秒 - 60秒）",
        autolock_title: "空闲自动锁定（分钟）",
        autolock_desc: "离开电脑时自动锁定浏览器。（设为 0 禁用，最高 60 分钟）",
        blur_title: "轻度模糊防窥时间（秒）",
        blur_desc: "长时间无操作时屏幕将自动柔和模糊。（设为 0 禁用）",
        maxtries_title: "最大密码尝试次数",
        maxtries_desc: "触发临时锁屏前允许输错密码的次数。（1 - 30 次）",

        // Intruder & Security
        siren_title: "入侵者防盗警报声",
        siren_label: "达到最大尝试次数被锁定时播放刺耳防盗警报",
        selfie_title: "静默摄像头抓拍自拍",
        selfie_desc: "如果入侵者输错密码达到 3 次，将静默调用前置摄像头抓拍照片。",
        selfie_label: "启用静默自拍抓拍功能",
        camera_perm_req: "需要摄像头权限：",
        camera_perm_desc: "若要静默拍照，请立即授予扩展摄像头访问权限。",
        btn_test_camera: "测试并授予摄像头权限",

        // Stealth & Poison
        stealth_title: "隐秘胁迫密码 (Stealth)",
        stealth_desc: "设置备用 8 位密码。如果被迫解锁，输入此密码可立即关闭所有标签页并隐藏工作内容。",
        stealth_clear_label: "隐秘解锁时同时清空浏览历史记录和缓存",
        poison_title: "毁灭抹除密码 (Poison Wipe)",
        poison_badge: "极致安全",
        poison_desc: "输入该密码将假装正常解锁，但会立即永久删除所有已存密码、表单、Cookie 和历史记录。",

        // 2FA TOTP
        totp_title: "🔐 2FA / TOTP 双重身份验证器",
        totp_badge: "增强安全",
        totp_desc: "解锁时要求输入 Google Authenticator、Authy 或 1Password 生成的 6 位动态验证码。",
        totp_label: "强制要求 2FA 动态验证码",
        totp_step1: "1. 打开身份验证器应用扫描二维码：",
        totp_step2: "2. 输入 6 位动态测试代码验证：",
        btn_verify_code: "验证代码",
        btn_copy: "📋 复制密钥",

        // Voice Unlock
        voice_title: "🎙 语音口令解锁",
        voice_badge: "免提操作",
        voice_desc: "对着麦克风说出您的自定义秘密口令即可快速解锁。",
        voice_custom_label: "自定义秘密口令",
        voice_enable_label: "启用语音口令识别解锁",
        btn_test_voice: "🎙 测试语音口令识别",
        btn_record_voice: "🎤 录制语音解锁口令",
        btn_remove_voice: "✕ 移除已存口令",

        // Panic Shortcut & Security Question
        panic_title: "紧急一键快锁 (Panic Button)",
        panic_desc: "在任何界面使用快捷键一键秒级锁定浏览器。",
        btn_configure_shortcut: "配置快捷键 (默认: Ctrl+Shift+L)",
        sec_question_title: "安全问题备用恢复",
        sec_question_desc: "如果遗忘主密码与备用代码，可通过安全问题回答进行终极验证恢复。",
        sec_question_label: "自定义问题",
        sec_answer_label: "答案 (区分大小写)",

        // Extreme Features
        audio_title: "🎙 隐秘环境录音",
        audio_badge: "极限",
        audio_perm_title: "需要：麦克风权限",
        audio_perm_desc: "请授予扩展麦克风访问权限以使用此功能。",
        ransomware_badge: "极限",
        tab_suspend_badge: "可选",
        face_badge: "新",
        audio_desc: "输错 3 次密码后，自动在后台静默录制 15 秒环境声音并存档下载。",
        audio_label: "连续输错 3 次密码时启动隐秘环境录音",
        btn_grant_audio: "测试并授予麦克风权限",
        ransomware_title: "☠ 伪装勒索病毒恐吓屏",
        ransomware_desc: "累计输错 5 次密码后，全屏弹出“系统已被加密”恐吓界面与警报声吓退窃密者。",
        ransomware_label: "启用伪装勒索病毒恐吓屏",
        btn_preview_ransomware: "预览恐吓界面",
        selfdestruct_title: "💥 自动销毁 (数据彻底擦除)",
        selfdestruct_badge: "不可逆",
        selfdestruct_desc: "若连续输错密码达到 10 次，彻底销毁清除所有历史记录、缓存和 Cookie。",
        selfdestruct_label: "达到 10 次错误时执行自动销毁",
        tab_suspend_title: "🧠 深度标签页冻结 (RAM 内存释放)",
        tab_suspend_desc: "锁定期间将所有后台网页从内存中释放，防止他人使用调试工具提取网页内存数据。",
        tab_suspend_label: "锁定时启用深度标签页内存冻结",

        // Continuous Face ID
        face_title: "👁 持续人脸识别 (Continuous Face ID)",
        face_desc: "支持人脸识别解锁，且在浏览时后台低频检测；一旦他人接管电脑即刻自动锁死。",
        btn_setup_face: "📸 录入人脸特征",
        btn_remove_face: "✕ 移除已存人脸特征",
        face_label: "启用持续人脸识别防偷窥锁定",

        // New Advanced Features
        theme_title: "🎨 锁定屏幕视觉主题",
        theme_desc: "自选锁屏及设置界面的艺术设计风格。",
        theme_gold: "黑金奢华",
        theme_matrix: "赛博黑客代码雨",
        theme_oled: "OLED 纯黑极夜",
        theme_apple: "Apple 原生毛玻璃",
        tamper_title: "🛡️ 防卸载与防篡改保护",
        tamper_badge: "装甲防护",
        tamper_desc: "在进入 chrome://extensions 扩展管理或试图卸载 Profile Lock Pro 之前，必须先输入主密码。",
        tamper_label: "锁定扩展页面并阻止未经授权的卸载与禁用",
        incognito_title: "🕶️ 无痕窗口锁定拦截",
        incognito_desc: "一旦开启无痕私密窗口，瞬间自动拦截并关闭，杜绝任何人借道无痕绕过扩展及记录。",
        incognito_label: "自动检测并强制关闭所有无痕窗口",
        minimize_title: "⚡ 窗口最小化或锁屏时立即锁定",
        minimize_desc: "只要浏览器窗口被最小化、切换至其他应用程序，或笔记本盒盖锁屏，即刻锁定。",
        minimize_label: "启用最小化或离开焦点时即刻锁定",
        forensic_title: "🕵️ 入侵者取证取样仪表板",
        forensic_desc: "非法入侵尝试的现场快照记录。包含精确时间戳、偷输入的密码、抓拍照片与录音。",
        no_forensics: "暂无任何入侵尝试记录。您的个人资料非常安全。",
        vault_backup_title: "🔐 加密保管库备份与恢复 (AES-256)",
        vault_backup_desc: "将所有配置与安全凭证导出为带密码保护的 .vault 文件，采用军工级 AES-256-GCM 加密。",
        btn_export_vault: "导出 .vault 加密文件",
        btn_import_vault: "导入并恢复 .vault",

        // Lock Screen Translations
        lock_title: "个人资料已锁定",
        lock_subtitle: "请输入您的 8 位密码以继续。",
        btn_unlock: "解锁个人资料",
        link_forgot_passcode: "忘记密码？",
        link_back_to_pin: "返回 PIN 码输入",
        err_incorrect_passcode: "密码错误。请重试。",
        err_invalid_2fa: "2FA 动态身份验证码无效。",
        lock_totp_title: "🔐 双重身份验证",
        lock_totp_desc: "输入来自 Google 身份验证器或 Authy 的 6 位验证码",
        btn_totp_unlock: "验证 2FA 并解锁",
        lock_email_2fa_title: "2FA 邮箱一次性码恢复",
        lock_email_2fa_desc: "发送一次性字母数字验证码至您的绑定恢复邮箱：",
        btn_send_2fa: "发送一次性 2FA 验证码",
        btn_verify_2fa: "验证 2FA 并解锁",
        lock_backup_title: "备用恢复代码",
        input_enter_backup: "输入备用代码",
        btn_verify_unlock: "验证并解锁",
        lock_sec_title: "安全问题验证",
        input_sec_answer: "输入答案（区分大小写）",
        btn_submit_answer: "提交答案",
        err_incorrect_answer: "安全问题答案错误。",
        lock_voice_title: "🎙 语音解锁",
        lock_voice_desc: "点击按钮并清晰说出您的口令。",
        btn_start_voice: "开始语音解锁",
        err_voice_fail: "语音口令未匹配。",
        lock_face_title: "人脸解锁",
        btn_start_face: "📸 开始人脸识别解锁",
        err_face_fail: "人脸特征未匹配。",

        // Additional Supplemental Keys
        security_active_title: "安全防护已激活",
        security_active_desc: "您的 8 位安全密码保护目前处于激活状态，安全守护中。",
        btn_configure_settings: "⚙️ 配置所有安全与防护设置",
        btn_change_passcode: "修改主密码",
        btn_deactivate: "停用全局锁定",
        incognito_warning_title: "⚠️ 检测到潜在安全隐患",
        incognito_warning_desc: "Profile Lock Pro 未在无痕模式中启用。他人可能通过无痕窗口绕过锁定。请前往 chrome://extensions 开启“在无痕模式下允许”。",
        test_capture_title: "入侵抓拍测试",
        test_capture_desc: "使用以下按钮测试摄像头拍照和环境录音功能。",
        btn_test_selfie: "测试人脸自拍抓拍",
        btn_test_audio: "测试环境录音抓取",
        totp_step1_sub: "打开 Google Authenticator 或 Authy → 点击 + → 扫描二维码",
        totp_secret_desc: "或在身份验证器中手动输入密钥设置：",
        voice_rec_title: "🎤 录制语音解锁口令",
        voice_rec_desc: "录制自定义口令。在锁屏界面点击“忘记密码？”即可使用语音口令免提解锁。",
        google_signin_title: "使用 Google 账号登录",
        google_signin_desc: "登录您的 Google 账号以将其绑定为安全保管库的紧急恢复邮箱。",
        btn_google_oauth: "使用 Google 账号登录",
        vault_active_title: "配置成功！安全保管库已生效",
        recovery_pair_title: "您的主恢复密钥对：",
        full_vault_title: "完整保管库凭证 (已生成 10 组备用代码)",
        btn_download_card: "下载离线凭证卡 (PNG/JPG)",
        vault_offline_note: "(主密钥已同步至恢复邮箱。请下载凭证卡以便离线恢复使用。)",
        creator_made_by: "开发者：",
        lockbrowse_pro_title: "🔒 LockBrowse Pro: 防绕过架构与域名/标签页锁",
        lockbrowse_pro_badge: "专业防绕过模式",
        lockbrowse_pro_desc: "先进的防绕过会话安全架构，采用真正的页面重定向（locked.html）代替脆弱的CSS覆盖层，支持域名黑白名单与单标签页锁定。",
        lockbrowse_status_redirection: "✓ 真正页面重定向架构 (locked.html)",
        lockbrowse_status_session: "✓ 会话挂起与原始URL平滑恢复",
        lockbrowse_status_salt: "✓ 加盐 SHA-256 加密验证引擎",
        lockbrowse_tab_title: "📌 独立单标签页锁",
        lockbrowse_tab_desc: "通过右键菜单（锁定此标签页）或下方按钮锁定当前标签页，解锁后自动恢复原网页。",
        btn_lock_current_tab: "🔒 立即锁定当前标签页",
        lockbrowse_domain_title: "🌐 域名/网址列表锁",
        lockbrowse_domain_desc: "访问指定域名（如 *.banking.com）时自动重定向至锁定屏幕，需验证主密码后访问。",
        lockbrowse_enable_domain_label: "启用域名/网址自动锁定",
        lockbrowse_mode_blacklist: "黑名单模式（锁定匹配的域名）",
        lockbrowse_mode_whitelist: "白名单模式（仅允许白名单，其余全锁定）",
        lockbrowse_domain_input_ph: "例如：*.banking.com, facebook.com",
        btn_add_domain_rule: "+ 添加规则",
        lockbrowse_presets_label: "快速预设：",
        lockbrowse_no_domains: "尚未配置任何域名规则。",
        lock_tab_title: "标签页已锁定",
        lock_tab_subtitle: "请输入8位安全密码以解锁此标签页。",
        btn_unlock_tab: "解锁此标签页",
        lock_domain_title: "受保护的域名",
        lock_domain_subtitle: "该网站已被LockBrowse Pro保护，请输入密码继续访问。",
        btn_unlock_domain: "解锁域名并访问"
    }
};

// Global translation lookup helper
function t(key, defaultText = '') {
    const lang = window.currentLanguage || 'en';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        return TRANSLATIONS[lang][key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
        return TRANSLATIONS.en[key];
    }
    return defaultText || key;
}

// Applies language across all matching data-i18n elements
function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'en';
    window.currentLanguage = lang;

    // Set document direction for RTL (Urdu & Arabic) vs LTR (English & Chinese)
    const isRtl = (lang === 'ur' || lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.dir = isRtl ? 'rtl' : 'ltr';

    if (isRtl) {
        document.body.classList.add('rtl-layout');
    } else {
        document.body.classList.remove('rtl-layout');
    }

    // Set language class for typography / Nastaliq font styling
    document.body.classList.remove('lang-en', 'lang-ur', 'lang-ar', 'lang-zh');
    document.body.classList.add('lang-' + lang);

    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
            el.innerHTML = TRANSLATIONS[lang][key];
        }
    });

    // Translate input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
            el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
        }
    });

    // Update active state in language selector pills/buttons
    document.querySelectorAll('.lang-btn, .lang-pill').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Save choice to chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ selectedLanguage: lang });
    }
}

// Auto-initialize language and bind click listeners
function initLanguage() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['selectedLanguage'], (data) => {
            const lang = data.selectedLanguage || 'en';
            applyLanguage(lang);
        });
    } else {
        applyLanguage('en');
    }
}

// Synchronize language changes in real-time across all open extension tabs/windows
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.selectedLanguage && changes.selectedLanguage.newValue) {
            if (changes.selectedLanguage.newValue !== window.currentLanguage) {
                applyLanguage(changes.selectedLanguage.newValue);
            }
        }
    });
}

// Delegated click listener ensures clicks on button, flag, or text ALWAYS trigger language switch
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn, .lang-pill');
    if (btn && btn.dataset && btn.dataset.lang) {
        e.preventDefault();
        applyLanguage(btn.dataset.lang);
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}