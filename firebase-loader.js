// Firebase SDK Loader - Standardized loading for all pages
// This ensures consistent Firebase SDK loading across all HTML files

(function() {
    'use strict';
    
    // Configuration
    const FIREBASE_VERSION = '9.23.0';
    const LOAD_TIMEOUT = 15000; // 15 seconds timeout
    
    // Firebase SDK URLs (using v9 compat mode for consistency)
    const FIREBASE_SCRIPTS = [
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database-compat.js`
    ];
    
    // Function to load a script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load: ${src}`);
                reject(new Error(`Failed to load Firebase script: ${src}`));
            };
            
            // Add timeout
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`Timeout loading Firebase script: ${src}`));
            }, LOAD_TIMEOUT);
            
            script.onload = () => {
                clearTimeout(timeout);
                console.log(`Loaded: ${src}`);
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Function to load all Firebase scripts in sequence
    async function loadFirebaseSDK() {
        console.log('Starting Firebase SDK loading...');
        
        try {
            // Load scripts sequentially to ensure proper dependency order
            for (const scriptUrl of FIREBASE_SCRIPTS) {
                await loadScript(scriptUrl);
            }
            
            // Wait a bit for Firebase to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify Firebase is available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase object not available after loading scripts');
            }
            
            console.log('Firebase SDK loaded successfully');
            
            // Dispatch custom event to notify that Firebase is ready
            window.dispatchEvent(new CustomEvent('firebaseSDKReady'));
            
            return true;
        } catch (error) {
            console.error('Error loading Firebase SDK:', error);
            
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('firebaseSDKError', { 
                detail: { error: error.message } 
            }));
            
            throw error;
        }
    }
    
    // Auto-load Firebase SDK when this script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFirebaseSDK);
    } else {
        loadFirebaseSDK();
    }
    
    // Export the loader function globally
    window.loadFirebaseSDK = loadFirebaseSDK;
    
})();
