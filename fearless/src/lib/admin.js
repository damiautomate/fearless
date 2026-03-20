import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, orderBy, getDocs, where,
  serverTimestamp, writeBatch
} from "firebase/firestore";

// ─── ADMIN AUTH CHECK ───
// CHANGE THIS to your email address
export const ADMIN_EMAIL = "darejames.biz@gmail.com";

export function isAdmin(email) {
  return email === ADMIN_EMAIL;
}

// ─── CONTENT MANAGEMENT ───

export async function getContentDay(dayNumber) {
  const snap = await getDoc(doc(db, "content", `day_${dayNumber}`));
  return snap.exists() ? snap.data() : null;
}

export async function getAllContent() {
  const q = query(collection(db, "content"), orderBy("day", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveContentDay(dayNumber, data) {
  await setDoc(doc(db, "content", `day_${dayNumber}`), {
    ...data,
    day: dayNumber,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContentDay(dayNumber) {
  await deleteDoc(doc(db, "content", `day_${dayNumber}`));
}

// ─── SEED CONTENT FROM CODE TO FIRESTORE ───

export async function seedContentToFirestore(getDayContentFn) {
  const batch = writeBatch(db);
  let count = 0;

  for (let day = 1; day <= 84; day++) {
    const content = getDayContentFn("social_anxiety", day);
    if (content) {
      const ref = doc(db, "content", `day_${day}`);
      batch.set(ref, {
        day,
        prescriptions: content.prescriptions || [],
        challenge: content.challenge || null,
        journal: content.journal || null,
        coach: content.coach || "",
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    // Firestore batch limit is 500, commit in chunks
    if (count >= 400) {
      await batch.commit();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  return true;
}

// ─── USER MANAGEMENT ───

export async function getAllUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function resetUserProgress(uid) {
  await updateDoc(doc(db, "users", uid), {
    currentDay: 1,
    phase: 1,
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    diagnosticComplete: false,
    diagnosticAnswers: null,
    profile: null,
    profileTitle: null,
    startDate: null,
  });
}

export async function updateUserField(uid, field, value) {
  await updateDoc(doc(db, "users", uid), { [field]: value });
}

export async function getUserProgress(uid) {
  const q = query(collection(db, "users", uid, "progress"), orderBy("day", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getUserJournal(uid) {
  const q = query(collection(db, "users", uid, "journal"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── DASHBOARD STATS ───

export async function getAdminStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  const users = usersSnap.docs.map(d => d.data());

  const total = users.length;
  const withDiagnostic = users.filter(u => u.diagnosticComplete).length;
  const activeThisWeek = users.filter(u => {
    if (!u.createdAt) return false;
    const lastActive = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastActive > weekAgo;
  }).length;

  const avgXp = total > 0 ? Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / total) : 0;
  const avgDay = total > 0 ? Math.round(users.reduce((s, u) => s + (u.currentDay || 0), 0) / total) : 0;

  const phases = { 1: 0, 2: 0, 3: 0, 4: 0 };
  users.forEach(u => { if (u.phase) phases[u.phase]++; });

  const profiles = {};
  users.forEach(u => { if (u.profile) profiles[u.profile] = (profiles[u.profile] || 0) + 1; });

  return { total, withDiagnostic, activeThisWeek, avgXp, avgDay, phases, profiles };
}
