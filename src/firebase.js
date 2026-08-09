import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAh_fRnIaDo5UGNW5Q8SbNkIAqYY2trpOE",
  authDomain: "truthcheck-ai-8a0c8.firebaseapp.com",
  projectId: "truthcheck-ai-8a0c8",
  storageBucket: "truthcheck-ai-8a0c8.firebasestorage.app",
  messagingSenderId: "551032483066",
  appId: "1:551032483066:web:e8a49d708bedc3a325ed43"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Persist auth session across browser restarts
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

export default app;
