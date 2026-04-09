const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    // Use the service account key from environment variable
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Parse the JSON service account string from the environment variable
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      raw = raw.replace(/\\n/g, "\n"); // Ensure newlines are correctly represented in the string
      serviceAccount = JSON.parse(raw);

      // Initialize Firebase Admin with the service account credentials
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("✅ Firebase Admin Initialized");
    } else {
      // Local development fallback
      try {
        serviceAccount = require("../serviceAccountKey.json"); // Only for local dev
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin Initialized (Local Development)");
      } catch (e) {
        console.warn(
          "⚠️ Firebase service account not set. Firebase Admin SDK may not work."
        );
      }
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Error:", error);
  }
}

module.exports = admin;
