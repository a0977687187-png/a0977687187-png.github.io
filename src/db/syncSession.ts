import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./firebaseConfig";

const HOUSEHOLD_CODE_KEY = "yuzu-household-code";

// 排除容易看錯的字元（0/O、1/I），家庭代碼給人手動輸入用。
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateHouseholdCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function getStoredHouseholdCode(): string | null {
  return localStorage.getItem(HOUSEHOLD_CODE_KEY);
}

export function setStoredHouseholdCode(code: string): void {
  localStorage.setItem(HOUSEHOLD_CODE_KEY, code.trim().toUpperCase());
}

export function clearStoredHouseholdCode(): void {
  localStorage.removeItem(HOUSEHOLD_CODE_KEY);
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let authInstance: Auth | null = null;
let authReadyPromise: Promise<void> | null = null;

function ensureFirebaseApp(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (!FIREBASE_CONFIG) {
    throw new Error("Firebase 未設定，無法使用同步功能");
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    firestoreDb = getFirestore(firebaseApp);
    authInstance = getAuth(firebaseApp);
  }
  return { app: firebaseApp, db: firestoreDb!, auth: authInstance! };
}

// 確保已經用匿名帳號登入 Firebase（不需要孩子/家長輸入任何帳密），
// 這是 Firestore 安全規則要求 request.auth != null 的前提。
export function ensureFirebaseAuthReady(): Promise<void> {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve, reject) => {
      const { auth } = ensureFirebaseApp();
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        },
        (err) => {
          unsubscribe();
          reject(err);
        }
      );
      signInAnonymously(auth).catch((err) => {
        unsubscribe();
        reject(err);
      });
    });
  }
  return authReadyPromise;
}

export function getFirestoreDb(): Firestore {
  return ensureFirebaseApp().db;
}
