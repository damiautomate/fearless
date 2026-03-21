export function calculateCurrentDay(startDate) {
  if (!startDate) return 0;

  let start;
  if (startDate.toDate) {
    start = startDate.toDate();
  } else if (startDate.seconds) {
    start = new Date(startDate.seconds * 1000);
  } else {
    start = new Date(startDate);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  const diffMs = today.getTime() - startDay.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
