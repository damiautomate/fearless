import { NextResponse } from "next/server";

// ─── Twilio WhatsApp Webhook ───
// Receives incoming WhatsApp messages from Twilio
// Loads user context from Firestore
// Sends to Claude API with full context
// Replies back through Twilio → WhatsApp

export async function POST(request) {
  try {
    // Parse Twilio's form data
    const formData = await request.formData();
    const from = formData.get("From"); // "whatsapp:+234XXXXXXXXXX"
    const body = formData.get("Body"); // message text
    const profileName = formData.get("ProfileName"); // WhatsApp display name

    if (!from || !body) {
      return twimlResponse("Something went wrong. Try again.");
    }

    // Extract phone number (remove "whatsapp:" prefix)
    const phone = from.replace("whatsapp:", "").trim();

    // Load user from Firestore by phone number
    const { collection, query, where, getDocs, doc, getDoc, orderBy, limit } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");

    let userProfile = null;
    let userId = null;

    // Find user by phone number
    const usersQ = query(collection(db, "users"), where("phone", "==", phone));
    const usersSnap = await getDocs(usersQ);

    if (usersSnap.empty) {
      // User not found — send registration prompt
      return twimlResponse(
        `Hey${profileName ? " " + profileName : ""}! 👋\n\nI'm the Fearless Coach, but I don't have your number linked yet.\n\nTo connect:\n1. Open the Fearless app\n2. Go to Settings\n3. Add your phone number\n\nThen text me again and I'll know exactly who you are — your day, your streak, everything. 💪`
      );
    }

    // User found
    const userDoc = usersSnap.docs[0];
    userId = userDoc.id;
    userProfile = userDoc.data();

    // Calculate current day
    let currentDay = userProfile.currentDay || 1;
    if (userProfile.startDate) {
      let start;
      if (userProfile.startDate.toDate) start = userProfile.startDate.toDate();
      else if (userProfile.startDate.seconds) start = new Date(userProfile.startDate.seconds * 1000);
      else start = new Date(userProfile.startDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const diffDays = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
      currentDay = Math.max(1, Math.min(diffDays + 1, 84));
    }

    const phaseNames = { 1: "Awareness", 2: "Rewiring", 3: "Proving", 4: "Identity Lock" };
    const phase = currentDay <= 14 ? 1 : currentDay <= 42 ? 2 : currentDay <= 70 ? 3 : 4;

    // Load recent notes (last 5)
    let recentNotes = [];
    try {
      const notesQ = query(collection(db, "users", userId, "journal"), orderBy("createdAt", "desc"), limit(5));
      const notesSnap = await getDocs(notesQ);
      recentNotes = notesSnap.docs.map(d => d.data());
    } catch (e) { /* no notes yet */ }

    // Load today's content
    let dayContent = null;
    try {
      const contentSnap = await getDoc(doc(db, "content", `day_${currentDay}`));
      if (contentSnap.exists()) dayContent = contentSnap.data();
    } catch (e) { /* fallback: no content */ }

    // Load today's progress
    let todayProgress = null;
    try {
      const progSnap = await getDoc(doc(db, "users", userId, "progress", `day_${currentDay}`));
      if (progSnap.exists()) todayProgress = progSnap.data();
    } catch (e) { /* no progress yet */ }

    // Build context
    const name = userProfile.name || profileName || "Friend";
    let context = `
═══ USER PROFILE ═══
Name: ${name}
Fear Profile: ${userProfile.profileTitle || "Unknown"} (${userProfile.profile || "unknown"})
Day: ${currentDay} of 84
Phase: ${phase} — ${phaseNames[phase]}
Level: ${userProfile.level || 1} | XP: ${userProfile.xp || 0}
Streak: ${userProfile.streak || 0} days (longest: ${userProfile.longestStreak || 0})
Platform: WhatsApp (keep responses concise — 1-3 sentences max)
`;

    if (userProfile.streak === 0 && currentDay > 1) context += `\n⚠️ STREAK IS BROKEN.\n`;

    if (dayContent) {
      context += `\nTODAY'S PRESCRIPTIONS:\n`;
      dayContent.prescriptions?.forEach((rx, i) => {
        context += `${i + 1}. [${rx.label}] "${rx.title}" by ${rx.source}\n`;
      });
      if (dayContent.challenge) context += `CHALLENGE: "${dayContent.challenge.title}"\n`;
    }

    if (todayProgress) {
      context += `\nTODAY'S PROGRESS: ${todayProgress.completedItems?.length || 0} prescriptions done, Challenge: ${todayProgress.challengeDone ? "✓" : "✗"}, Journal: ${todayProgress.journalDone ? "✓" : "✗"}\n`;
    }

    if (recentNotes.length > 0) {
      context += `\nRECENT NOTES:\n`;
      recentNotes.slice(0, 3).forEach(n => {
        context += `[Day ${n.day}] "${n.text?.slice(0, 150)}"\n`;
      });
    }

    // Handle special commands
    const lowerBody = body.toLowerCase().trim();

    if (lowerBody === "status" || lowerBody === "progress" || lowerBody === "stats") {
      const statusMsg = `📊 *${name}'s Progress*\n\n` +
        `📅 Day: ${currentDay}/84\n` +
        `🔥 Streak: ${userProfile.streak || 0} days\n` +
        `⭐ Level: ${userProfile.level || 1}\n` +
        `💎 XP: ${userProfile.xp || 0}\n` +
        `🎯 Phase: ${phaseNames[phase]}\n\n` +
        (todayProgress
          ? `Today: ${todayProgress.completedItems?.length || 0} prescriptions done${todayProgress.challengeDone ? ", challenge ✅" : ""}${todayProgress.journalDone ? ", journal ✅" : ""}`
          : `Today: Nothing completed yet — open the app!`);
      return twimlResponse(statusMsg);
    }

    if (lowerBody === "today" || lowerBody === "prescription" || lowerBody === "prescriptions") {
      if (!dayContent || !dayContent.prescriptions) {
        return twimlResponse(`Day ${currentDay} content isn't loaded yet. Open the app to see your prescriptions.`);
      }
      let todayMsg = `📋 *Day ${currentDay} Prescriptions*\n\n`;
      dayContent.prescriptions.forEach((rx, i) => {
        const done = todayProgress?.completedItems?.includes(i) ? "✅" : "⬜";
        todayMsg += `${done} ${rx.title}\n   _${rx.source} · ${rx.duration}_\n\n`;
      });
      if (dayContent.challenge) {
        const cdone = todayProgress?.challengeDone ? "✅" : "⬜";
        todayMsg += `${cdone} *Challenge:* ${dayContent.challenge.title}\n`;
      }
      return twimlResponse(todayMsg);
    }

    if (lowerBody === "help" || lowerBody === "menu") {
      return twimlResponse(
        `🔥 *Fearless Coach — WhatsApp*\n\n` +
        `You can text me anything and I'll coach you through it. I know your full journey.\n\n` +
        `Quick commands:\n` +
        `• *status* — see your progress\n` +
        `• *today* — see today's prescriptions\n` +
        `• *help* — this menu\n\n` +
        `Or just talk to me like a friend. I'm here.`
      );
    }

    // ─── Send to Claude API for conversational response ───
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      // Fallback without API key
      return twimlResponse(getFallback(lowerBody, name, currentDay, userProfile.streak));
    }

    const systemPrompt = `You are the Fearless Coach on WhatsApp. You're helping ${name} overcome fear and build confidence through a 12-week program.

${context}

WHATSAPP-SPECIFIC RULES:
- Keep responses SHORT. 1-3 sentences. This is WhatsApp, not an essay.
- Be direct and punchy. No fluff.
- Use their name once max.
- You can use emoji sparingly — one or two max per message.
- Reference their SPECIFIC data: their day, streak, what they've done today, their notes.
- Push when they're struggling, celebrate when they show up.
- If they haven't done anything today, nudge them to open the app.
- Never use clinical language. Talk like a friend.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        system: systemPrompt,
        messages: [{ role: "user", content: body }],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return twimlResponse(getFallback(lowerBody, name, currentDay, userProfile.streak));
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm here. Tell me more.";

    return twimlResponse(reply);

  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return twimlResponse("Something went wrong on my end. Try again in a minute.");
  }
}

// Verify webhook (Twilio sends GET for verification)
export async function GET(request) {
  return NextResponse.json({ status: "Fearless WhatsApp webhook active" });
}

// ─── Helper: Format TwiML response ───
function twimlResponse(message) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Fallback responses when API key is missing ───
function getFallback(msg, name, day, streak) {
  if (msg.includes("struggling") || msg.includes("hard") || msg.includes("can't"))
    return `Day ${day} is supposed to be hard, ${name}. You're still here — that's what matters. Open the app and do one prescription. Just one. 💪`;

  if (msg.includes("quit") || msg.includes("give up"))
    return `${name}, the part of you that wants to quit is the same part keeping you small. Day ${day}. Just do today. Not the whole program. Just today.`;

  if (msg.includes("good") || msg.includes("progress") || msg.includes("did it"))
    return `That's real, ${name}. Day ${day}${streak > 0 ? `, ${streak}-day streak` : ""}. Don't let your brain minimize this. 🔥`;

  return `Hey ${name}. Day ${day}${streak > 0 ? `, ${streak}-day streak` : ""}. Open the app and crush today's prescription. I'm watching. 👀`;
}
