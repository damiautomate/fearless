import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, userProfile, dayContext, completionData, recentNotes, recentProgress } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const phaseNames = { 1: "Awareness", 2: "Rewiring", 3: "Proving", 4: "Identity Lock" };
    const name = userProfile?.name || "Friend";
    const day = userProfile?.currentDay || 1;
    const phase = userProfile?.phase || 1;

    // ─── Build comprehensive context ───
    let context = `
═══ USER PROFILE ═══
Name: ${name}
Fear Profile: ${userProfile?.profileTitle || "Unknown"} (${userProfile?.profile || "unknown"})
Day: ${day} of 84
Phase: ${phase} — ${phaseNames[phase] || "Awareness"}
Level: ${userProfile?.level || 1}
XP: ${userProfile?.xp || 0}
Current Streak: ${userProfile?.streak || 0} days
Longest Streak: ${userProfile?.longestStreak || 0} days
`;

    // Streak status
    if (userProfile?.streak === 0 && day > 1) context += `\n⚠️ STREAK IS BROKEN. User may feel discouraged or guilty.\n`;
    if (userProfile?.streak >= 7) context += `\n🔥 User is on a strong ${userProfile.streak}-day streak. Acknowledge this.\n`;
    if (userProfile?.streak === userProfile?.longestStreak && userProfile?.streak > 3) context += `\n⭐ This is their LONGEST STREAK EVER. This matters.\n`;

    // Today's content
    if (dayContext) {
      context += `\n═══ TODAY'S PRESCRIPTIONS (Day ${day}) ═══\n`;
      if (dayContext.prescriptions) {
        dayContext.prescriptions.forEach((rx, i) => {
          context += `${i + 1}. [${rx.label}] "${rx.title}" by ${rx.source} (${rx.duration})${rx.dosage ? ` — Instructions: ${rx.dosage.slice(0, 120)}` : ""}\n`;
        });
      }
      if (dayContext.challenge) {
        context += `\nTODAY'S CHALLENGE: "${dayContext.challenge.title}" (${dayContext.challenge.difficulty})\n`;
        context += `Description: ${dayContext.challenge.desc.slice(0, 200)}\n`;
        context += `Tip: ${dayContext.challenge.tip || "None"}\n`;
      }
      if (dayContext.journal) {
        context += `\nTODAY'S JOURNAL PROMPT: "${dayContext.journal.prompt}"\n`;
      }
      if (dayContext.coach) {
        context += `\nTODAY'S COACH NOTE: "${dayContext.coach.slice(0, 200)}"\n`;
      }
    }

    // Today's completion
    if (completionData) {
      context += `\n═══ TODAY'S PROGRESS ═══\n`;
      context += `Prescriptions completed: ${completionData.prescriptionsDone || 0} of ${completionData.prescriptionsTotal || 0}\n`;
      context += `Challenge completed: ${completionData.challengeDone ? "Yes" : "Not yet"}\n`;
      context += `Journal written: ${completionData.journalDone ? "Yes" : "Not yet"}\n`;
      context += `Notes written: ${completionData.notesSaved ? "Yes" : "Not yet"}\n`;
    }

    // Recent notes and reflections
    if (recentNotes && recentNotes.length > 0) {
      context += `\n═══ USER'S RECENT NOTES & REFLECTIONS ═══\n`;
      context += `(These are the user's own words from their journal. Use these to understand their inner world.)\n\n`;
      recentNotes.forEach(note => {
        const type = note.prompt?.startsWith("What I Learned") ? "LEARNING" : "REFLECTION";
        context += `[${type} — Day ${note.day}] Prompt: "${note.prompt?.slice(0, 60) || "Free write"}"\n`;
        context += `"${note.text.slice(0, 300)}"\n\n`;
      });
    }

    // Recent daily progress
    if (recentProgress && recentProgress.length > 0) {
      context += `\n═══ RECENT ACTIVITY HISTORY ═══\n`;
      recentProgress.forEach(p => {
        const items = p.completedItems?.length || 0;
        context += `Day ${p.day}: ${items} prescriptions done, Challenge: ${p.challengeDone ? "✓" : "✗"}, Journal: ${p.journalDone ? "✓" : "✗"}\n`;
      });
    }

    // Phase context
    context += `\n═══ PHASE CONTEXT ═══\n`;
    if (phase === 1) context += `User is in Phase 1 (Awareness, Days 1-14). They're learning WHY they are the way they are. Be gentle, validating, curious. Help them see patterns without overwhelming them.\n`;
    if (phase === 2) context += `User is in Phase 2 (Rewiring, Days 15-42). They're actively dismantling old patterns with CBT, exposure, self-compassion. Push them through discomfort. Celebrate small wins. They may hit a wall around Day 20-25.\n`;
    if (phase === 3) context += `User is in Phase 3 (Proving, Days 43-70). They're doing real-world missions — public speaking, rejection practice, confrontation. Be more direct and challenging. They need a coach, not a therapist.\n`;
    if (phase === 4) context += `User is in Phase 4 (Identity Lock, Days 71-84). They're locking in the new identity. Help them own who they've become. Focus on permanence, legacy, and what's next after the program.\n`;

    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      return NextResponse.json({ response: getFallbackResponse(messages, userProfile) });
    }

    const systemPrompt = `You are the Fearless Coach — a direct, warm, no-BS transformation coach. You are helping ${name} overcome fear and build unshakable confidence through a 12-week program.

You have FULL access to their data below. Use it. Reference their specific notes, their streak, their progress, their exact words from their reflections. This is what makes you different from a generic chatbot — you KNOW this person.

${context}

YOUR PERSONALITY:
- Direct and honest. Never sugarcoat. But always kind.
- You talk like a wise older friend who's been through it, not a therapist reading from a script.
- Keep responses 2-5 sentences unless they clearly need more depth.
- Use their name sparingly — once per message max.
- Reference SPECIFIC things: their actual notes, their streak number, today's specific challenge, what they wrote in their journal.
- Push when they want to quit. Celebrate when they show up. Call out patterns you see in their data.
- If they mention today's content, you know EXACTLY what it is — reference it by name.
- If they've been skipping challenges, you can see that in their activity history. Address it.
- If they wrote something powerful in a reflection, quote it back to them.

NEVER:
- Use clinical or therapy language like "I hear you" or "that's valid"
- Give long lectures or motivational speeches
- Be preachy, condescending, or performatively empathetic
- Say generic things like "believe in yourself" or "just be confident"
- Ignore the data you have — ALWAYS be specific to this person
- Ask more than one question at a time`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.slice(-16).map(m => ({
          role: m.role === "coach" ? "assistant" : "user",
          content: m.text,
        })),
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return NextResponse.json({ response: getFallbackResponse(messages, userProfile) });
    }

    const data = await response.json();
    return NextResponse.json({ response: data.content?.[0]?.text || "I'm here. Tell me more." });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ response: "Something went wrong on my end. Try again in a sec." });
  }
}

function getFallbackResponse(messages, profile) {
  const name = profile?.name || "Friend";
  const day = profile?.currentDay || 1;
  const streak = profile?.streak || 0;
  const lastMsg = messages?.[messages.length - 1]?.text?.toLowerCase() || "";

  if (lastMsg.includes("quit") || lastMsg.includes("give up") || lastMsg.includes("stop"))
    return `${name}, the part of you that wants to quit is the same part that's been keeping you small. You're on Day ${day} — that's ${day} days more than most people ever do. Can you commit to just today?`;

  if (lastMsg.includes("struggling") || lastMsg.includes("hard") || lastMsg.includes("difficult") || lastMsg.includes("can't"))
    return `Day ${day} of any transformation is supposed to be hard, ${name}. The fact that you're HERE telling me means the old pattern hasn't won. What specifically feels hardest right now?`;

  if (lastMsg.includes("good") || lastMsg.includes("progress") || lastMsg.includes("better") || lastMsg.includes("did it"))
    return `That's real, ${name}. Day ${day}${streak > 0 ? `, ${streak}-day streak` : ""} — don't let your brain minimize this. What you did took courage, and courage compounds.`;

  if (lastMsg.includes("scared") || lastMsg.includes("afraid") || lastMsg.includes("fear") || lastMsg.includes("anxious"))
    return `The challenge scares you? Good. You're on Day ${day} — you've survived every single thing that scared you so far. Your track record is 100%. Do it, then come tell me how it went.`;

  return `Hey ${name}. Day ${day}${streak > 0 ? `, ${streak}-day streak` : ""}. I'm here — what's on your mind?`;
}
