import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUBSTITUI_AQUI",
  authDomain: "SUBSTITUI_AQUI",
  projectId: "SUBSTITUI_AQUI",
  storageBucket: "SUBSTITUI_AQUI",
  messagingSenderId: "SUBSTITUI_AQUI",
  appId: "SUBSTITUI_AQUI"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function cloudSave(key, data) {
  try {
    const safeKey = key.replace(/:/g, "_");
    await setDoc(doc(db, "livros", safeKey), { ...data, updatedAt: Date.now() });
    return true;
  } catch (e) { console.error(e); return false; }
}

export async function cloudLoad(key) {
  try {
    const safeKey = key.replace(/:/g, "_");
    const snap = await getDoc(doc(db, "livros", safeKey));
    return snap.exists() ? snap.data() : null;
  } catch (e) { return null; }
}

export async function cloudList(prefix) {
  try {
    const safePrefix = prefix.replace(/:/g, "_");
    const snap = await getDocs(collection(db, "livros"));
    return snap.docs.map(d => d.id).filter(id => id.startsWith(safePrefix)).map(id => id.replace(/_/g, ":"));
  } catch (e) { return []; }
}
