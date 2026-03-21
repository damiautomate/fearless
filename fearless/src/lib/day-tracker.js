// ═══════════════════════════════════════════
//  FEARLESS — Day Tracker
//  Calculates current day from startDate
//  Uses user's local timezone automatically
//  Day advances at midnight local time
// ═══════════════════════════════════════════

export function calculateCurrentDay(startDate) {
  if (!startDate) return 0;

  // Convert Firestore timestamp to JS Date
  let start;
  if (startDate.toDate) {
    start = startDate.toDate(); // Firestore Timestamp
  } else if (startDate.seconds) {
    start = new Date(startDate.seconds * 1000); // Firestore Timestamp as object
  } else {
    start = new Date(startDate); // Regular date string
  }

  // Get today's date at midnight in user's local timezone
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  // Calculate difference in days
  const diffMs = today.getTime() - startDay.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Day 1 is the start date, cap at 84
  const currentDay = Math.max(1, Math.min(diffDays + 1, 84));

  return currentDay;
}

export function getPhaseFromDay(day) {
  if (day <= 14) return 1;
  if (day <= 42) return 2;
  if (day <= 70) return 3;
  return 4;
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function isNewDay(lastActiveTimestamp) {
  if (!lastActiveTimestamp) return true;

  let lastActive;
  if (lastActiveTimestamp.toDate) {
    lastActive = lastActiveTimestamp.toDate();
  } else if (lastActiveTimestamp.seconds) {
    lastActive = new Date(lastActiveTimestamp.seconds * 1000);
  } else {
    lastActive = new Date(lastActiveTimestamp);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

  return today.getTime() > lastDay.getTime();
}
```

---

**Now update the dashboard** to use it. Go to `fearless/src/app/dashboard/page.js` → pencil icon.

**Edit 1:** Add the import at the top, near other imports:
```
import { calculateCurrentDay, getPhaseFromDay } from "@/lib/day-tracker";
```

**Edit 2:** Find the TodayTab function. Look for this line:
```
const day = profile.currentDay || 1;
```

Replace with:
```
const day = profile.startDate ? calculateCurrentDay(profile.startDate) : (profile.currentDay || 1);
const phase = getPhaseFromDay(day);
```

**Edit 3:** Do the same in ProgressTab. Find:
```
const score = Math.min(Math.round((profile.currentDay / 84) * 100), 100);
```

Replace with:
```
const day = profile.startDate ? calculateCurrentDay(profile.startDate) : (profile.currentDay || 1);
const score = Math.min(Math.round((day / 84) * 100), 100);
