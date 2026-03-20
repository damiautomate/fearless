// ─── FIRESTORE-FIRST CONTENT READER ───
// Add this to the TOP of your existing content.js file, BEFORE the getDayContent function
// Then REPLACE the getDayContent function with this version

import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Cache to avoid repeated Firestore reads
const contentCache = {};

export async function getDayContentFromDB(profile, dayNumber) {
  // Check cache first
  const cacheKey = `day_${dayNumber}`;
  if (contentCache[cacheKey]) {
    return applyProfileOverrides(contentCache[cacheKey], profile, dayNumber);
  }

  // Try Firestore
  try {
    const snap = await getDoc(doc(db, "content", `day_${dayNumber}`));
    if (snap.exists()) {
      const data = snap.data();
      contentCache[cacheKey] = data;
      return applyProfileOverrides(data, profile, dayNumber);
    }
  } catch (e) {
    console.log("Firestore content not available, using hardcoded fallback");
  }

  // Fallback to hardcoded content
  return getDayContent(profile, dayNumber);
}

function applyProfileOverrides(content, profile, dayNumber) {
  // Profile overrides still come from code for now
  // You can move these to Firestore later
  const overrides = PROFILE_OVERRIDES[profile] || {};
  if (overrides[dayNumber]) {
    return { ...content, ...overrides[dayNumber] };
  }
  return content;
}
