 // Wait for Firebase to be available
(function() {
    'use strict';

    console.log('[FirebaseInterop] Script loaded');

    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('[FirebaseInterop] Firebase SDK not loaded!');
        window.firebaseInterop = {
            initialize: () => Promise.reject('Firebase SDK not available'),
            signInWithEmail: () => Promise.reject('Firebase SDK not available'),
            signUpWithEmail: () => Promise.reject('Firebase SDK notavailable'),
            signOut: () => Promise.reject('Firebase SDK not available'),
            getCurrentUser: () => null,
            sendPasswordResetEmail: () => Promise.reject('Firebase SDK not available'),
            uploadFile: () => Promise.reject('Firebase SDK not available'),
            getCollection: () => Promise.reject('Firebase SDK not available'),
            getDocumentById: () => Promise.reject('Firebase SDK not available'),
            saveDocument: () => Promise.reject('Firebase SDK not available'),
            updateDocument: () => Promise.reject('Firebase SDK not available'),
            deleteDocument: () => Promise.reject('Firebase SDK not available')
        };
        return;
    }

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBscJyXiFIyjc5Nn6ksaA131BItErkDrI0",
        authDomain: "thinkdrive-4ae44.firebaseapp.com",
        projectId: "thinkdrive-4ae44",
        storageBucket: "thinkdrive-4ae44.firebasestorage.app",
        messagingSenderId: "759490643351",
        appId: "1:759490643351:web:2b10ea03133d1eb8a3f0d2"
    };

    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('[FirebaseInterop] Firebase initialized successfully');
        }
    } catch (error) {
        console.error('[FirebaseInterop] Firebase initialization error:', error);
    }

    // Get Firestore database
    const db = firebase.firestore();

    // Create Firebase interop object
    window.firebaseInterop = {
        initialize: function() {
            console.log('[FirebaseInterop] Initialize called');
            return Promise.resolve('Firebase ready');
        },

        signInWithEmail: async function(email, password) {
            try {
                console.log('[FirebaseInterop] Signing in user:', email);
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                if (!user) {
                    throw new Error('Authentication failed');
                }

                console.log('[FirebaseInterop] Sign in successful');

                // ✅ Return object matching FirebaseAuthResponse C# model
                return {
                    userId: user.uid,
                    email: user.email,
                    token: await user.getIdToken(),
                    displayName: user.displayName || '',
                    photoUrl: user.photoURL || '',
                    emailVerified: user.emailVerified
                };
            } catch (error) {
                console.error('[FirebaseInterop] Sign in error:', error);
                throw error;
            }
        },

        signUpWithEmail: async function(email, password) {
            try {
                console.log('[FirebaseInterop] Creating user:', email);
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('[FirebaseInterop] User created:', userCredential.user.uid);
                return userCredential.user.uid;
            } catch (error) {
                console.error('[FirebaseInterop] Sign up error:', error);
                throw error;
            }
        },

        signOut: async function() {
            try {
                await firebase.auth().signOut();
                console.log('[FirebaseInterop] User signed out');
                return true;
            } catch (error) {
                console.error('[FirebaseInterop] Sign out error:', error);
                throw error;
            }
        },

        // ✅ Enhanced Password Reset with proper redirect URL
        sendPasswordResetEmail: async function(email) {
            try {
                // ✅ Use production URL or current origin
                const continueUrl = window.location.origin.includes('localhost') 
                    ? 'https://thinkdrive.vercel.app/login?reset=success'
                    : window.location.origin + '/login?reset=success';

                // Configure action code settings
                const actionCodeSettings = {
                    url: continueUrl,
                    handleCodeInApp: false
                };

                await firebase.auth().sendPasswordResetEmail(email, actionCodeSettings);
                
                console.log('[Firebase] Password reset email sent to:', email);
                return {
                    success: true,
                    message: 'Password reset email sent successfully'
                };
            } catch (error) {
                console.error('[Firebase] Password reset error:', error);
                
                let errorMessage = 'Failed to send password reset email.';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address format.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many requests. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = error.message || 'Unknown error occurred.';
                }
                
                throw new Error(errorMessage);
            }
        },

        // ✅ Verify password reset code
        verifyPasswordResetCode: async function(code) {
            try {
                const email = await firebase.auth().verifyPasswordResetCode(code);
                console.log('[Firebase] Password reset code verified for:', email);
                return email;
            } catch (error) {
                console.error('[Firebase] Verify code error:', error);
                throw error;
            }
        },

        // ✅ Confirm password reset
        confirmPasswordReset: async function(code, newPassword) {
            try {
                await firebase.auth().confirmPasswordReset(code, newPassword);
                console.log('[Firebase] Password reset successful');
                return true;
            } catch (error) {
                console.error('[Firebase] Confirm reset error:', error);
                throw error;
            }
        },

        signInWithGoogle: async function() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('profile');
                provider.addScope('email');
                
                const result = await firebase.auth().signInWithPopup(provider);
                const user = result.user;
                
                console.log('[Firebase] Google sign-in successful:', user.uid);
                
                // ✅ Return consistent format
                return {
                    userId: user.uid,
                    email: user.email,
                    token: await user.getIdToken(),
                    displayName: user.displayName || '',
                    photoUrl: user.photoURL || '',
                    emailVerified: user.emailVerified
                };
            } catch (error) {
                console.error('[Firebase] Google sign-in error:', error);
                throw error;
            }
        },

        getCurrentUser: function() {
            const user = firebase.auth().currentUser;
            if (user) {
                return {
                    userId: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified
                };
            }
            return null;
        },

        // ✅ FIRESTORE METHODS
        getCollection: async function(collectionName) {
            try {
                console.log('[FirebaseInterop] Getting collection:', collectionName);
                const snapshot = await db.collection(collectionName).get();
                const documents = [];
                
                snapshot.forEach(doc => {
                    documents.push({
                        Id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`[FirebaseInterop] Retrieved ${documents.length} documents from ${collectionName}`);
                return documents;
            } catch (error) {
                console.error('[FirebaseInterop] getCollection error:', error);
                return [];
            }
        },

        getDocumentById: async function(collectionName, documentId) {
            try {
                console.log('[FirebaseInterop] Getting document:', collectionName, documentId);
                const doc = await db.collection(collectionName).doc(documentId).get();
                
                if (doc.exists) {
                    const data = doc.data();
                    // ✅ Ensure Id field is included (C# expects PascalCase)
                    const result = {
                        Id: doc.id,
                        id: doc.id, // Lowercase for compatibility
                        ...data
                    };
                    console.log('[FirebaseInterop] Document found:', result);
                    return result;
                }
                
                console.log('[FirebaseInterop] Document not found');
                return null;
            } catch (error) {
                console.error('[FirebaseInterop] getDocumentById error:', error);
                return null;
            }
        },

        saveDocument: async function(collectionName, documentId, dataJson) {
            try {
                console.log('[FirebaseInterop] Saving document:', collectionName, documentId);
                const data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
                
                await db.collection(collectionName).doc(documentId).set(data, { merge: true });
                console.log('[FirebaseInterop] Document saved successfully');
                return true;
            } catch (error) {
                console.error('[FirebaseInterop] saveDocument error:', error);
                throw error;
            }
        },

        updateDocument: async function(collectionName, documentId, updates) {
            try {
                console.log('[FirebaseInterop] Updating document:', collectionName, documentId);
                await db.collection(collectionName).doc(documentId).update(updates);
                console.log('[FirebaseInterop] Document updated successfully');
                return true;
            } catch (error) {
                console.error('[FirebaseInterop] updateDocument error:', error);
                throw error;
            }
        },

        deleteDocument: async function(collectionName, documentId) {
            try {
                console.log('[FirebaseInterop] Deleting document:', collectionName, documentId);
                await db.collection(collectionName).doc(documentId).delete();
                console.log('[FirebaseInterop] Document deleted successfully');
                return true;
            } catch (error) {
                console.error('[FirebaseInterop] deleteDocument error:', error);
                throw error;
            }
        },

        // ✅ STORAGE METHODS
        uploadFile: async function (base64Data, path) {
            try {
                console.log('[FirebaseInterop] Uploading file to:', path);
                
                if (!firebase.storage) {
                    throw new Error('Storage not initialized');
                }

                // Remove data URL prefix if present
                let fileData = base64Data;
                let contentType = 'application/octet-stream';
                
                if (base64Data.includes('base64,')) {
                    const parts = base64Data.split('base64,');
                    contentType = parts[0].split(':')[1].split(';')[0];
                    fileData = parts[1];
                }

                // Convert base64 to blob
                const byteCharacters = atob(fileData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: contentType });

                // Upload to Firebase Storage
                const storageRef = firebase.storage().ref();
                const fileRef = storageRef.child(path);
                
                const uploadTask = await fileRef.put(blob, {
                    contentType: contentType
                });

                // Get download URL
                const downloadURL = await uploadTask.ref.getDownloadURL();
                
                console.log('[FirebaseInterop] File uploaded successfully:', downloadURL);
                return downloadURL;
            } catch (error) {
                console.error('[FirebaseInterop] Upload error:', error);
                throw error;
            }
        },

        uploadFileWithProgress: function (base64Data, path, progressCallback) {
            return new Promise((resolve, reject) => {
                try {
                    console.log('[FirebaseInterop] Uploading file with progress:', path);
                    
                    if (!firebase.storage) {
                        reject(new Error('Storage not initialized'));
                        return;
                    }

                    let fileData = base64Data;
                    let contentType = 'application/octet-stream';
                    
                    if (base64Data.includes('base64,')) {
                        const parts = base64Data.split('base64,');
                        contentType = parts[0].split(':')[1].split(';')[0];
                        fileData = parts[1];
                    }

                    const byteCharacters = atob(fileData);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: contentType });
                    
                    const storageRef = firebase.storage().ref();
                    const fileRef = storageRef.child(path);
                    const uploadTask = fileRef.put(blob, { contentType });

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log(`[FirebaseInterop] Upload progress: ${progress}%`);
                            if (progressCallback) {
                                DotNet.invokeMethodAsync('ThinkDrive', progressCallback, Math.round(progress));
                            }
                        },
                        (error) => {
                            console.error('[FirebaseInterop] Upload error:', error);
                            reject(error);
                        },
                        async () => {
                            try {
                                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                console.log('[FirebaseInterop] Upload complete:', downloadURL);
                                resolve(downloadURL);
                            } catch (error) {
                                reject(error);
                            }
                        }
                    );
                } catch (error) {
                    console.error('[FirebaseInterop] Upload setup error:', error);
                    reject(error);
                }
            });
        },

        // ✅ NEW METHODS
        getFilteredCollection: async function(collectionName, filters) {
            try {
                console.log('[FirebaseInterop] Getting filtered collection:', collectionName, filters);
                let query = db.collection(collectionName);
                
                if (filters && typeof filters === 'object') {
                    Object.keys(filters).forEach(key => {
                        const value = filters[key];
                        if (value !== null && value !== undefined) {
                            query = query.where(key, '==', value);
                        }
                    });
                }
                
                const snapshot = await query.get();
                const documents = [];
                
                snapshot.forEach(doc => {
                    documents.push({
                        Id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`[FirebaseInterop] Retrieved ${documents.length} filtered documents from ${collectionName}`);
                return documents;
            } catch (error) {
                console.error('[FirebaseInterop] getFilteredCollection error:', error);
                return [];
            }
        },

        onAuthStateChanged: function(dotNetHelper, methodName) {
            return firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('[FirebaseInterop] User logged in:', user.uid);
                    const userData = {
                        userId: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified
                    };
                    
                    // Store in localStorage for persistence
                    localStorage.setItem('firebase_user', JSON.stringify(userData));
                    
                    // Notify Blazor
                    if (dotNetHelper && methodName) {
                        dotNetHelper.invokeMethodAsync(methodName, userData);
                    }
                } else {
                    console.log('[FirebaseInterop] User logged out');
                    localStorage.removeItem('firebase_user');
                    
                    if (dotNetHelper && methodName) {
                        dotNetHelper.invokeMethodAsync(methodName, null);
                    }
                }
            });
        },

        getCurrentAuthUser: function() {
            try {
                const storedUser = localStorage.getItem('firebase_user');
                if (storedUser) {
                    return storedUser; // Already a JSON string
                }
                
                const currentUser = firebase.auth().currentUser;
                if (currentUser) {
                    const userData = {
                        userId: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        emailVerified: currentUser.emailVerified
                    };
                    return JSON.stringify(userData);
                }
                
                return null;
            } catch (error) {
                console.error('[FirebaseInterop] getCurrentAuthUser error:', error);
                return null;
            }
        }
    };

    console.log('[FirebaseInterop] All methods registered');
})();
