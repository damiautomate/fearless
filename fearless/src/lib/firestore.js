import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, orderBy, getDocs, addDoc, serverTimestamp, increment
} from "firebase/firestore";

// ─── USER PROFILE ───

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    name: data.name,
    email: data.email,
    profile: null,         // set after diagnostic
    profileTitle: null,
    phase: 1,
    currentDay: 0,         // 0 = hasn't started, 1 = day 1
    streak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    startDate: null,       // set when they start program
    diagnosticComplete: false,
    diagnosticAnswers: null,
    notifDaily: true,
    notifCoach: true,
    notifWeekly: false,
    sounds: true,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

// ─── DIAGNOSTIC RESULTS ───

export async function saveDiagnostic(uid, answers, profile) {
  await updateDoc(doc(db, "users", uid), {
    diagnosticComplete: true,
    diagnosticAnswers: answers,
    profile: profile,
    profileTitle: {
      social_anxiety: "The Silent Observer",
      shame: "The Hidden One",
      fear_failure: "The Frozen Perfectionist",
      people_pleasing: "The Shape-Shifter",
      timidity: "The Waiting One",
    }[profile] || "The Silent Observer",
    currentDay: 1,
    startDate: serverTimestamp(),
  });
}

// ─── DAILY PROGRESS ───

export async function saveDayProgress(uid, dayNumber, data) {
  await setDoc(doc(db, "users", uid, "progress", `day_${dayNumber}`), {
    day: dayNumber,
    completedItems: data.completedItems || [],
    challengeDone: data.challengeDone || false,
    challengeReport: data.challengeReport || "",
    journalDone: data.journalDone || false,
    journalText: data.journalText || "",
    xpEarned: data.xpEarned || 0,
    completedAt: serverTimestamp(),
  });
}

export async function getDayProgress(uid, dayNumber) {
  const snap = await getDoc(doc(db, "users", uid, "progress", `day_${dayNumber}`));
  return snap.exists() ? snap.data() : null;
}

export async function getAllProgress(uid) {
  const q = query(
    collection(db, "users", uid, "progress"),
    orderBy("day", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── XP & STREAK ───

export async function addXp(uid, amount) {
  const user = await getUserProfile(uid);
  if (!user) return;
  
  const newXp = (user.xp || 0) + amount;
  const xpThresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 7000, 8500, 10000];
  let newLevel = 1;
  for (let i = xpThresholds.length - 1; i >= 0; i--) {
    if (newXp >= xpThresholds[i]) { newLevel = i + 1; break; }
  }

  await updateDoc(doc(db, "users", uid), {
    xp: newXp,
    level: newLevel,
  });

  return { xp: newXp, level: newLevel };
}

export async function updateStreak(uid, completed) {
  const user = await getUserProfile(uid);
  if (!user) return;

  let newStreak = completed ? (user.streak || 0) + 1 : 0;
  let longest = Math.max(user.longestStreak || 0, newStreak);

  await updateDoc(doc(db, "users", uid), {
    streak: newStreak,
    longestStreak: longest,
  });

  return { streak: newStreak, longestStreak: longest };
}

export async function advanceDay(uid) {
  const user = await getUserProfile(uid);
  if (!user) return;
  
  const newDay = (user.currentDay || 0) + 1;
  let newPhase = user.phase || 1;
  if (newDay > 14 && newDay <= 42) newPhase = 2;
  else if (newDay > 42 && newDay <= 70) newPhase = 3;
  else if (newDay > 70) newPhase = 4;

  await updateDoc(doc(db, "users", uid), {
    currentDay: newDay,
    phase: newPhase,
  });

  return { currentDay: newDay, phase: newPhase };
}

// ─── JOURNAL ENTRIES ───

export async function saveJournalEntry(uid, dayNumber, text, prompt) {
  await addDoc(collection(db, "users", uid, "journal"), {
    day: dayNumber,
    text,
    prompt,
    createdAt: serverTimestamp(),
  });
}

export async function getJournalEntries(uid) {
  const q = query(
    collection(db, "users", uid, "journal"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── COACH MESSAGES ───

export async function saveCoachMessage(uid, role, text) {
  await addDoc(collection(db, "users", uid, "coachMessages"), {
    role,
    text,
    createdAt: serverTimestamp(),
  });
}

export async function getCoachMessages(uid, limitCount = 50) {
  const q = query(
    collection(db, "users", uid, "coachMessages"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
