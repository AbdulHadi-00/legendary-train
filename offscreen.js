const video = document.getElementById('offscreen-video');
let modelsLoaded = false;
let savedDescriptor = null;
let stream = null;
let scanInterval = null;

async function loadModels() {
    if (modelsLoaded) return true;
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        modelsLoaded = true;
        return true;
    } catch (e) {
        console.error("Offscreen model load error:", e);
        return false;
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'START_FACE_ID') {
        startContinuousTracking(msg.descriptor);
        sendResponse({ success: true });
    } else if (msg.type === 'STOP_FACE_ID') {
        stopContinuousTracking();
        sendResponse({ success: true });
    }
    return true;
});

async function startContinuousTracking(descriptorArray) {
    if (!descriptorArray) return;
    savedDescriptor = new Float32Array(descriptorArray);
    
    const loaded = await loadModels();
    if (!loaded) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        
        video.addEventListener('play', () => {
            if (scanInterval) clearInterval(scanInterval);
            
            // Check every 5 seconds to save CPU
            scanInterval = setInterval(async () => {
                const detection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })).withFaceLandmarks().withFaceDescriptor();
                
                if (detection) {
                    const distance = faceapi.euclideanDistance(savedDescriptor, detection.descriptor);
                    if (distance >= 0.6) {
                        // Stranger detected!
                        console.warn("Stranger detected. Distance:", distance);
                        chrome.runtime.sendMessage({ type: 'STRANGER_DETECTED' });
                    }
                } else {
                    // No face detected, lock the screen!
                    console.warn("No face detected!");
                    chrome.runtime.sendMessage({ type: 'NO_FACE_DETECTED' });
                }
            }, 5000);
        });
    } catch (e) {
        console.error("Offscreen camera error:", e);
    }
}

function stopContinuousTracking() {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
}
