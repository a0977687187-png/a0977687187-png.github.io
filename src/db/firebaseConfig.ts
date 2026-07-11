// 是否啟用跨裝置同步，完全由建置時有沒有帶 Firebase 環境變數決定：
// 有帶 → 同步版；沒帶（例如給朋友的版本）→ 自動變成純本機版，這個檔案裡的東西都不會被用到。
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): FirebaseWebConfig | null {
  const env = import.meta.env;
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = env.VITE_FIREBASE_APP_ID as string | undefined;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

export const FIREBASE_CONFIG = readConfig();
export const SYNC_BUILD_ENABLED = FIREBASE_CONFIG !== null;
