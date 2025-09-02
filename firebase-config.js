// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDClVT8h1T6mBcfD4USQU3a6iINmyWTNmk",
    authDomain: "attendance-66f11.firebaseapp.com",
    databaseURL: "https://attendance-66f11-default-rtdb.firebaseio.com",
    projectId: "attendance-66f11",
    storageBucket: "attendance-66f11.appspot.com",
    messagingSenderId: "1041295884103",
    appId: "1:1041295884103:web:e7748b4c5a881e315b5662",
    measurementId: "G-7VNETMRH26"
};

// Make firebaseConfig globally available
window.firebaseConfig = firebaseConfig;

(function() {
// Auto Logout Configuration
if (typeof window.AUTO_LOGOUT_TIME === 'undefined') window.AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes
if (typeof window.autoLogoutTimer === 'undefined') window.autoLogoutTimer = null;
if (typeof window.activityListenersSet === 'undefined') window.activityListenersSet = false;

// Debounce function to limit activity listener calls
if (typeof window.debounce === 'undefined') {
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
}

// Function to start auto logout timer - DISABLED
window.startAutoLogoutTimer = function(userType) {
    console.log('Auto logout disabled - startAutoLogoutTimer called but doing nothing');
    // Auto logout functionality disabled
    return;
};

// Function to reset auto logout timer - DISABLED
window.resetAutoLogoutTimer = function(userType) {
    console.log('Auto logout disabled - resetAutoLogoutTimer called but doing nothing');
    // Auto logout functionality disabled
    return;
};

// Function to handle auto logout
window.handleAutoLogout = function(userType) {
    console.log('Handling auto logout for:', userType);
    sessionStorage.clear();
    localStorage.removeItem('adminToken');
    window.activityListenersSet = false;
    if (window.auth) {
        window.auth.signOut()
            .then(() => {
                console.log('Firebase sign out successful');
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    }
    alert('Your session has expired. Please login again.');
    window.location.href = 'welcome.html';
};

// Add event listeners for user activity - DISABLED
window.setupActivityListeners = function(userType) {
    console.log('Auto logout disabled - setupActivityListeners called but doing nothing');
    // Auto logout functionality disabled
    return;
};

// Wait for Firebase SDK to load with better error handling
window.waitForFirebaseSDK = function() {
    return new Promise((resolve, reject) => {
        // Check if Firebase is already loaded
        if (typeof firebase !== 'undefined') {
            console.log('Firebase SDK already loaded');
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 100; // Increased attempts
        const checkInterval = 50; // Reduced interval for faster detection
        
        function checkFirebase() {
            attempts++;
            console.log(`Checking Firebase SDK... Attempt ${attempts}/${maxAttempts}`);
            
            // Check if Firebase is available or if we have offline fallback
            if (typeof firebase !== 'undefined' && firebase.apps) {
                console.log('Firebase SDK loaded successfully');
                resolve();
            } else if (window.firebaseOfflineMode && attempts >= 5) {
                console.log('Using offline Firebase fallback mode');
                resolve(); // Use fallback after 5 attempts
            } else if (attempts >= maxAttempts) {
                console.error('Firebase SDK timeout - switching to offline mode');
                // Don't reject, use fallback instead
                window.firebaseOfflineMode = true;
                resolve();
            } else {
                setTimeout(checkFirebase, checkInterval);
            }
        }
        
        // Start checking immediately
        checkFirebase();
    });
};

// Initialize Firebase with improved error handling
window.initializeFirebase = async function() {
    try {
        console.log('Starting Firebase initialization...');
        
        // Check if we're in offline mode
        if (window.firebaseOfflineMode) {
            console.log('Running in offline mode - using mock Firebase');
            // Use mock objects directly, don't call firebase functions
            window.db = {
                ref: function() { return { on: function() {}, once: function() {}, off: function() {}, set: function() {}, update: function() {}, remove: function() {} }; }
            };
            window.auth = {
                onAuthStateChanged: function(cb) { cb(null); return function(){}; },
                signOut: function() { return Promise.resolve(); },
                currentUser: null
            };
            return;
        }
        
        // Wait for Firebase SDK to be available
        await window.waitForFirebaseSDK();
        
        // Check if Firebase is already initialized
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            console.log('Firebase already initialized');
            window.db = firebase.database();
            window.auth = firebase.auth();
            return;
        }
        
        // Check if Firebase SDK is available
        if (typeof firebase === 'undefined') {
            console.log('Firebase SDK not available - switching to offline mode');
            window.firebaseOfflineMode = true;
            // Use mock objects directly, don't call firebase functions
            window.db = {
                ref: function() { return { on: function() {}, once: function() {}, off: function() {}, set: function() {}, update: function() {}, remove: function() {} }; }
            };
            window.auth = {
                onAuthStateChanged: function(cb) { cb(null); return function(){}; },
                signOut: function() { return Promise.resolve(); },
                currentUser: null
            };
            return;
        }
        
        console.log('Initializing Firebase app...');
        
        // Check if firebase.initializeApp is available
        if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
            console.log('Firebase SDK not properly loaded, switching to offline mode');
            window.firebaseOfflineMode = true;
            // Use mock objects directly, don't call firebase functions
            window.db = {
                ref: function() { return { on: function() {}, once: function() {}, off: function() {}, set: function() {}, update: function() {}, remove: function() {} }; }
            };
            window.auth = {
                onAuthStateChanged: function(cb) { cb(null); return function(){}; },
                signOut: function() { return Promise.resolve(); },
                currentUser: null
            };
            return Promise.resolve();
        }
        
        // Initialize Firebase with your config
        // Use the global firebaseConfig from window
        const config = window.firebaseConfig;
        
        firebase.initializeApp(config);
        console.log('Firebase app initialized successfully');
        
        // Initialize database and auth references
        window.db = firebase.database();
        window.auth = firebase.auth();
        
        // Test database connection with timeout
        console.log('Testing database connection...');
        return new Promise((resolve, reject) => {
            const connectionTimeout = setTimeout(() => {
                console.error('Database connection timeout after 10 seconds');
                reject(new Error('Database connection timeout - Check your internet connection'));
            }, 10000);
            
            const connectedRef = window.db.ref(".info/connected");
            
            const onConnected = (snap) => {
                if (snap.val() === true) {
                    console.log("Database connected successfully");
                    clearTimeout(connectionTimeout);
                    connectedRef.off('value', onConnected); // Remove listener
                    resolve();
                }
            };
            
            const onError = (error) => {
                console.error("Database connection error:", error);
                clearTimeout(connectionTimeout);
                connectedRef.off('value', onConnected); // Remove listener
                reject(error);
            };
            
            connectedRef.on("value", onConnected, onError);
        });
        
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        console.log('Switching to offline mode due to Firebase error');
        
        // Switch to offline mode instead of throwing error
        window.firebaseOfflineMode = true;
        // Use mock objects directly, don't call firebase functions
        window.db = {
            ref: function() { return { on: function() {}, once: function() {}, off: function() {}, set: function() {}, update: function() {}, remove: function() {} }; }
        };
        window.auth = {
            onAuthStateChanged: function(cb) { cb(null); return function(){}; },
            signOut: function() { return Promise.resolve(); },
            currentUser: null
        };
        return Promise.resolve();
    }
};

// Wait for Firebase to initialize with retry
window.waitForFirebase = async function(retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1} to initialize Firebase...`);
            await window.initializeFirebase();
            console.log('Firebase initialized successfully');
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            lastError = error;
            if (i < retries - 1) {
                console.log(`Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    console.error('All attempts failed');
    // Don't throw error, switch to offline mode instead
    console.log('Switching to offline mode due to initialization failure');
    window.firebaseOfflineMode = true;
    // Use mock objects directly, don't call firebase functions
    window.db = {
        ref: function() { return { on: function() {}, once: function() {}, off: function() {}, set: function() {}, update: function() {}, remove: function() {} }; }
    };
    window.auth = {
        onAuthStateChanged: function(cb) { cb(null); return function(){}; },
        signOut: function() { return Promise.resolve(); },
        currentUser: null
    };
};

// Firebase initialization functions are ready
// Initialize Firebase automatically
console.log('Firebase config loaded - initializing Firebase automatically...');

// Create waitForFirebase function
window.waitForFirebase = async function() {
    if (window.db && window.auth) {
        console.log('Firebase already initialized and ready');
        return Promise.resolve();
    }
    
    console.log('Initializing Firebase...');
    try {
        await window.initializeFirebase();
        console.log('Firebase initialization completed');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        // Continue with offline mode
    }
};

// Auto-initialize Firebase when config loads
setTimeout(() => {
    window.waitForFirebase().then(() => {
        console.log('Firebase auto-initialization completed');
    }).catch((error) => {
        console.error('Firebase auto-initialization failed:', error);
    });
}, 100);

// Telegram Configuration
if (typeof window.TELEGRAM_BOT_TOKEN === 'undefined') window.TELEGRAM_BOT_TOKEN = '8302014924:AAEw6J8psK6P8Ve2Iw9KaWbqVLmBVTMPXE8';

// Function to send Telegram message directly to phone number
window.sendTelegramMessage = async function(message, phoneNumber) {
    phoneNumber = phoneNumber.replace(/^\+91/, '');
    try {
        const telegramUrl = `https://api.telegram.org/bot${window.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(`https://api.telegram.org/bot${window.TELEGRAM_BOT_TOKEN}/getChat?chat_id=${phoneNumber}`);
        const data = await response.json();
        if (data.ok) {
            const chatId = data.result.id;
            const messageResponse = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
            });
            const messageData = await messageResponse.json();
            console.log('Message sent successfully:', messageData);
            return messageData;
        } else {
            const directResponse = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: phoneNumber, text: message, parse_mode: 'HTML' })
            });
            const directData = await directResponse.json();
            console.log('Message sent directly:', directData);
            return directData;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Function to format attendance message
window.formatAttendanceMessage = function(teacherName, className, subject, presentCount, totalCount, date) {
    const percentage = Math.round((presentCount/totalCount) * 100);
    let statusEmoji = percentage >= 75 ? '✅' : '⚠️';
    return `
<b>📊 Attendance Update</b>

👨‍🏫 Teacher: ${teacherName}
📚 Class: ${className}
📖 Subject: ${subject}
📅 Date: ${date}

✅ Present: ${presentCount}
👥 Total Students: ${totalCount}
📊 Percentage: ${percentage}%

${statusEmoji} Status: ${percentage >= 75 ? 'Good' : 'Below Required'}
`;
};

// Function to test Telegram connection
window.testTelegramConnection = async function(chatId) {
    const testMessage = `
<b>🔔 Test Notification</b>

Your Telegram notifications are set up successfully!
You will receive attendance updates here.

Your Chat ID: ${chatId}
`;
    try {
        await window.sendTelegramMessage(testMessage, chatId);
        return true;
    } catch (error) {
        console.error('Telegram test failed:', error);
        return false;
    }
};

// Function to format teacher login message
window.formatTeacherLoginMessage = function(teacherName, loginTime) {
    return `
<b>👨‍🏫 Teacher Login</b>

Name: ${teacherName}
Time: ${loginTime}
`;
};

// Function to format new teacher message
window.formatNewTeacherMessage = function(teacherName, departments, classes) {
    return `
<b>🆕 New Teacher Added</b>

Name: ${teacherName}
Departments: ${departments.map(d => d.name).join(', ')}
Classes: ${classes.join(', ')}
`;
};

// Fast2SMS Configuration
if (typeof window.FAST2SMS_API_KEY === 'undefined') window.FAST2SMS_API_KEY = 'YOUR_FAST2SMS_API_KEY';

// Function to send SMS
window.sendSMS = async function(message, phoneNumber) {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authorization': window.FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'v3',
                sender_id: 'BVITMS',
                message: message,
                language: 'english',
                flash: 0,
                numbers: phoneNumber
            })
        });
        const data = await response.json();
        console.log('SMS sent:', data);
        return data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

})(); 