// Wait for Firebase SDK to load
window.waitForFirebaseSDK = function() {
    return new Promise((resolve, reject) => {
        if (typeof firebase !== 'undefined') {
            console.log('Firebase SDK already loaded');
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 100;
        const checkInterval = 50;
        
        function checkFirebase() {
            attempts++;
            console.log(`Checking Firebase SDK... Attempt ${attempts}/${maxAttempts}`);
            
            if (typeof firebase !== 'undefined' && firebase.apps) {
                console.log('Firebase SDK loaded successfully');
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Firebase SDK failed to load'));
            } else {
                setTimeout(checkFirebase, checkInterval);
            }
        }
        
        checkFirebase();
    });
};

// Initialize Firebase
async function initializeFirebase() {
    try {
        await window.waitForFirebaseSDK();
        
        // Check if Firebase is already initialized
        if (firebase.apps.length) {
            console.log('Firebase already initialized');
            window.db = firebase.database();
            window.auth = firebase.auth();
            return;
        }

        console.log('Initializing Firebase...');
        // Use the global firebaseConfig from firebase-config.js
        const config = window.firebaseConfig;
        if (!config) {
            console.error("Firebase config not found! Make sure firebase-config.js is loaded before firebase-init.js.");
            return;
        }
        firebase.initializeApp(config);
        console.log('Firebase initialized successfully');

        // Set global references
        window.db = firebase.database();
        window.auth = firebase.auth();

        // Set up authentication state observer
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User is signed in:', user.uid);
            } else {
                console.log('No user is signed in');
                const isTeacherLoggedIn = sessionStorage.getItem('isTeacherLoggedIn');
                const teacherData = sessionStorage.getItem('teacherData');
                
                if (isTeacherLoggedIn && teacherData) {
                    const teacherInfo = JSON.parse(teacherData);
                    firebase.auth().signInAnonymously()
                        .catch((error) => {
                            console.error('Error signing in anonymously:', error);
                        });
                }
            }
        });

        // Test database connection
        const connectedRef = window.db.ref(".info/connected");
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                console.log("Database connected successfully");
            } else {
                console.log("Database connection lost");
            }
        });

    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Firebase initialization is handled by firebase-config.js
// Do not auto-initialize here