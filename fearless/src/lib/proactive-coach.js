// ═══════════════════════════════════════════════════════════════
//  FEARLESS — Proactive Coach System (Trigger-Based)
//  
//  HOW TO USE:
//  Add this file as: src/lib/proactive-coach.js
//  
//  Then in your dashboard page.js, import and use:
//    import { getProactiveMessage } from "@/lib/proactive-coach";
//  
//  Call it when the app loads:
//    const proactive = getProactiveMessage(profile);
//  
//  Display it as a banner or coach nudge
// ═══════════════════════════════════════════════════════════════

export function getProactiveMessage(profile) {
  if (!profile) return null;

  const {
    name = "Friend",
    currentDay = 0,
    streak = 0,
    longestStreak = 0,
    xp = 0,
    level = 1,
    phase = 1,
    profileTitle = "",
    profile: profileType = "",
  } = profile;

  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0 = Sunday

  // Priority system: check conditions in order, return first match
  // Higher priority messages come first

  // ─── MILESTONE DAYS ───
  if (currentDay === 1) {
    return {
      type: "milestone",
      emoji: "🌱",
      color: "var(--green)",
      title: "Day 1 — Your journey begins",
      text: `${name}, today is the first step. Most people think about changing but never start. You just started. That already puts you ahead of millions. Take your time with today's content — there's no rush. Just be honest with yourself.`,
      action: null,
    };
  }

  if (currentDay === 7) {
    return {
      type: "milestone",
      emoji: "🔥",
      color: "var(--orange)",
      title: "One week complete",
      text: `${name}, 7 days. The average person quits a new habit on day 3. You doubled that and then some. This week wasn't about fixing everything — it was about seeing clearly. And now you do. Phase 1 continues.`,
      action: null,
    };
  }

  if (currentDay === 14) {
    return {
      type: "milestone",
      emoji: "⚡",
      color: "var(--accent-text)",
      title: "Phase 1 Complete — Entering Rewiring",
      text: `You've completed the Awareness phase, ${name}. You now understand your fear better than most people ever will. Phase 2 starts today — this is where we dismantle old patterns and build new ones. The real transformation begins now.`,
      action: "Start Phase 2",
    };
  }

  if (currentDay === 30) {
    return {
      type: "milestone",
      emoji: "🏆",
      color: "var(--purple)",
      title: "One month mark",
      text: `30 days, ${name}. One full month of showing up for yourself. Your brain has literally formed new neural pathways in this time. The person who started on Day 1 would not believe where you are now. Keep going — the best is ahead.`,
      action: null,
    };
  }

  if (currentDay === 42) {
    return {
      type: "milestone",
      emoji: "🔧",
      color: "var(--teal)",
      title: "Phase 2 Complete — Entering Proving",
      text: `${name}, you've spent 4 weeks dismantling old patterns. Phase 3 is where you prove to yourself that the change is real — through action, not theory. The challenges get bigger. So do you.`,
      action: "Start Phase 3",
    };
  }

  if (currentDay === 70) {
    return {
      type: "milestone",
      emoji: "🔒",
      color: "var(--red)",
      title: "Phase 3 Complete — Identity Lock",
      text: `The final phase, ${name}. You've proven it. Now we make it permanent. These last 14 days are about locking in the new you so you never go back. You're not just confident — you're becoming someone who can't be shaken.`,
      action: "Start Phase 4",
    };
  }

  if (currentDay === 84) {
    return {
      type: "milestone",
      emoji: "✨",
      color: "var(--accent-text)",
      title: "Day 84 — You did it",
      text: `${name}. 84 days. 12 weeks. You showed up when most people quit. You faced things that terrified you. You rewired your brain. You built undeniable evidence that the old story was wrong. This isn't the end — it's the beginning of living as the person you've become.`,
      action: null,
    };
  }

  // ─── STREAK ALERTS ───
  if (streak === 0 && currentDay > 1) {
    return {
      type: "nudge",
      emoji: "💪",
      color: "var(--orange)",
      title: "Your streak broke — but you didn't",
      text: `${name}, you missed a day. That's okay — this isn't about perfection. But don't let one missed day become two. The difference between a setback and a spiral is what you do RIGHT NOW. Open today's prescription and do just one thing.`,
      action: "Start today's prescription",
    };
  }

  if (streak === 3) {
    return {
      type: "encouragement",
      emoji: "🔥",
      color: "var(--orange)",
      title: "3-day streak",
      text: `Three days in a row, ${name}. You're building momentum. Most people don't even make it this far. Keep stacking days — each one makes the next easier.`,
      action: null,
    };
  }

  if (streak === 7) {
    return {
      type: "encouragement",
      emoji: "🔥",
      color: "var(--orange)",
      title: "7-day streak — one full week",
      text: `A full week without missing a day, ${name}. That's not luck — that's discipline becoming habit. Your brain is noticing the pattern. Keep going.`,
      action: null,
    };
  }

  if (streak === 14) {
    return {
      type: "encouragement",
      emoji: "🔥",
      color: "var(--orange)",
      title: "14-day streak — two full weeks",
      text: `Two weeks straight, ${name}. At this point, showing up isn't just something you do — it's becoming who you are. That identity shift? That's the whole game.`,
      action: null,
    };
  }

  if (streak === longestStreak && streak > 5 && streak !== 7 && streak !== 14) {
    return {
      type: "encouragement",
      emoji: "⭐",
      color: "var(--purple)",
      title: "New personal record",
      text: `${name}, ${streak} days — that's your longest streak ever. You're in uncharted territory. The old you never made it this far. Remember this feeling.`,
      action: null,
    };
  }

  // ─── LEVEL UP ───
  if (level >= 5 && level < 10 && xp > 0) {
    const levelMessages = {
      5: `Level 5, ${name}. You're not a beginner anymore. The skills you've built are real — and they're compounding.`,
      7: `Level 7. You've earned over ${xp} XP through actual effort — challenges faced, content absorbed, reflections written. This isn't a game. This is your life changing.`,
      9: `Level 9, ${name}. Single digits left before double digits. Every point of XP represents a moment where you chose growth over comfort.`,
    };
    if (levelMessages[level]) {
      return {
        type: "encouragement",
        emoji: "⭐",
        color: "var(--accent-text)",
        title: `Level ${level} reached`,
        text: levelMessages[level],
        action: null,
      };
    }
  }

  if (level >= 10) {
    return {
      type: "encouragement",
      emoji: "🏆",
      color: "var(--purple)",
      title: `Level ${level} — double digits`,
      text: `${name}, Level ${level}. Most users never reach this. You have ${xp.toLocaleString()} XP — each point earned through real action. You're in the top tier.`,
      action: null,
    };
  }

  // ─── PHASE-SPECIFIC NUDGES ───
  if (phase === 2 && currentDay >= 20 && currentDay <= 25) {
    return {
      type: "nudge",
      emoji: "🧠",
      color: "var(--teal)",
      title: "The messy middle",
      text: `${name}, you're in the hardest part of the program — the middle of Phase 2. This is where most people plateau or quit. The excitement of starting has faded, but the results haven't fully landed yet. Trust the process. Keep doing the reps.`,
      action: null,
    };
  }

  if (phase === 3 && currentDay >= 43 && currentDay <= 45) {
    return {
      type: "nudge",
      emoji: "⚡",
      color: "var(--orange)",
      title: "Phase 3 is different",
      text: `${name}, Phase 3 challenges are bigger than anything you've done so far. That's by design. You spent 6 weeks building skills — now you USE them. If the challenge feels scary, that's the signal you're in the right place.`,
      action: null,
    };
  }

  // ─── TIME-BASED GREETINGS ───
  if (hour >= 22 || hour < 5) {
    return {
      type: "gentle",
      emoji: "🌙",
      color: "var(--purple)",
      title: "Late night check-in",
      text: `It's late, ${name}. If you're here because you can't sleep, try the physiological sigh — two sharp inhales through the nose, one long exhale. If you're here to catch up on today's content, respect. But don't sacrifice sleep — your brain consolidates learning while you rest.`,
      action: null,
    };
  }

  if (dayOfWeek === 0) { // Sunday
    return {
      type: "gentle",
      emoji: "☀️",
      color: "var(--teal)",
      title: "Sunday reflection",
      text: `Sunday, ${name}. A good day to look back at your week. What challenged you? What surprised you? What's one thing you did that the old you wouldn't have? Write it down — your evidence file is your armor against doubt.`,
      action: null,
    };
  }

  // ─── DEFAULT: Rotating motivational context ───
  const defaults = [
    {
      emoji: "🎯",
      color: "var(--accent-text)",
      title: "Today matters",
      text: `${name}, every day you show up is another data point your brain can't ignore. The old story gets quieter. The new evidence gets louder. Do today's prescription — even if it's just one item.`,
    },
    {
      emoji: "💎",
      color: "var(--teal)",
      title: "Small steps compound",
      text: `You're on Day ${currentDay}, ${name}. That means you've already done ${currentDay - 1} days of work that most people will never do. Don't compare yourself to where you want to be — compare yourself to where you started.`,
    },
    {
      emoji: "🔑",
      color: "var(--purple)",
      title: "Consistency over intensity",
      text: `${name}, the secret isn't doing something huge today. It's doing something small, every day, without stopping. A 10-minute prescription done consistently beats a 2-hour binge done once. Show up. That's enough.`,
    },
    {
      emoji: "🌊",
      color: "var(--teal)",
      title: "Trust the process",
      text: `Some days you'll feel like nothing is changing, ${name}. That's normal. Growth isn't linear — it's more like a staircase. You climb, then you plateau, then you climb again. The plateau isn't failure. It's consolidation.`,
    },
    {
      emoji: "⚡",
      color: "var(--orange)",
      title: "Fear is your compass",
      text: `If today's challenge makes you uncomfortable, ${name}, that's not a bug — it's a feature. Discomfort is the tax you pay for growth. And you've been paying it consistently. The returns are coming.`,
    },
  ];

  const idx = currentDay % defaults.length;
  return { type: "default", action: null, ...defaults[idx] };
}

// ─── COACH CONTEXT BUILDER ───
// Builds rich context string for the AI coach API call
// so the coach knows everything about the user

export function buildCoachContext(profile, dayContent, completionData) {
  const {
    name = "Friend",
    currentDay = 0,
    streak = 0,
    longestStreak = 0,
    xp = 0,
    level = 1,
    phase = 1,
    profileTitle = "",
    profile: profileType = "",
  } = profile;

  const phaseNames = { 1: "Awareness", 2: "Rewiring", 3: "Proving", 4: "Identity Lock" };

  let context = `
USER CONTEXT:
- Name: ${name}
- Fear Profile: ${profileTitle} (${profileType})
- Current Day: ${currentDay} of 84
- Current Phase: Phase ${phase} (${phaseNames[phase] || "Unknown"})
- Level: ${level} | XP: ${xp}
- Current Streak: ${streak} days
- Longest Streak: ${longestStreak} days
`;

  if (streak === 0 && currentDay > 1) {
    context += `- STATUS: Streak is broken. User may be discouraged. Be encouraging but direct.\n`;
  }
  if (streak >= 7) {
    context += `- STATUS: On a ${streak}-day streak. Acknowledge the consistency.\n`;
  }
  if (currentDay >= 15 && currentDay <= 25) {
    context += `- STATUS: In the "messy middle" of Phase 2. This is where most people quit. Extra encouragement needed.\n`;
  }
  if (currentDay >= 43 && currentDay <= 49) {
    context += `- STATUS: Just entered Phase 3 (Proving). Challenges are harder now. User may feel intimidated.\n`;
  }

  if (dayContent) {
    context += `\nTODAY'S PRESCRIPTIONS:\n`;
    dayContent.prescriptions?.forEach((rx, i) => {
      context += `- ${rx.label}: "${rx.title}" by ${rx.source} (${rx.duration})\n`;
    });
    if (dayContent.challenge) {
      context += `- TODAY'S CHALLENGE: "${dayContent.challenge.title}" (${dayContent.challenge.difficulty}) — ${dayContent.challenge.desc.slice(0, 100)}...\n`;
    }
    if (dayContent.journal) {
      context += `- JOURNAL PROMPT: "${dayContent.journal.prompt.slice(0, 80)}..."\n`;
    }
  }

  if (completionData) {
    context += `\nTODAY'S COMPLETION:\n`;
    context += `- Prescriptions completed: ${completionData.prescriptionsCompleted || 0} of ${completionData.prescriptionsTotal || 0}\n`;
    context += `- Challenge done: ${completionData.challengeDone ? "Yes" : "No"}\n`;
    context += `- Journal done: ${completionData.journalDone ? "Yes" : "No"}\n`;
  }

  return context;
}
