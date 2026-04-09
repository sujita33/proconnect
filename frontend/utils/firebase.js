import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCgD0dg-lJV5V_R5gSS5jGL_bAnEHvSccY",
    authDomain: "proconnect-a913a.firebaseapp.com",
    projectId: "proconnect-a913a",
    storageBucket: "proconnect-a913a.firebasestorage.app",
    messagingSenderId: "52371750750",
    appId: "1:52371750750:web:b87da37fda884bd93219cf",
    measurementId: "G-JJBKMXNTWQ"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, googleProvider, analytics };
