/* Oritic panel: database setting
 *
 * ORITIC_MODE = 'local'    → data is saved only in THIS browser (IndexedDB). Safe for testing.
 *                            Nothing goes to the live database. Use Settings → Data → Backup often.
 * ORITIC_MODE = 'firebase' → data goes to the Firebase project below (shared by all phones).
 *
 * Rule: never test on the live project. Make a free test project ("oritic-test"),
 * paste its config below, set mode to 'firebase', and test there first.
 */
window.ORITIC_MODE = 'local';

window.FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE.appspot.com",
  messagingSenderId: "PASTE",
  appId: "PASTE"
};
