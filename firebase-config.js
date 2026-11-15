/* Oritic panel: database setting
 *
 * ORITIC_MODE = 'local'    → data is saved only in THIS browser (IndexedDB). Safe for testing.
 * ORITIC_MODE = 'firebase' → data goes to the Firebase project below (shared by all phones).
 *
 * Abhi: TEST project "oritic-test" (live database nahi). Live pe jaane se pehle naya config yahan aayega.
 * Kisi bhi link ke peeche ?local lagao to us browser me purana local mode chalega (jaise ?local&demo).
 * Firebase web config password nahi hai; suraksha Firestore rules se hoti hai (abhi: sirf signed-in app users).
 */
window.ORITIC_MODE = /[?&]local\b/.test(location.search) ? 'local' : 'firebase';

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBBwEhjl074P4LLB_og9dexDkGeEX27v-Y",
  authDomain: "oritic-test.firebaseapp.com",
  projectId: "oritic-test",
  storageBucket: "oritic-test.firebasestorage.app",
  messagingSenderId: "922814363352",
  appId: "1:922814363352:web:97d1a18c988a74fc2489ad"
};
