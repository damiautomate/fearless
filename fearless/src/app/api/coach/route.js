import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, userProfile, dayContext, completionData } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Build rich context
    const phaseNames = { 1: "Awareness", 2: "Rewiring", 3: "Proving", 4: "Identity Lock" };

    let userContext = `
USER PROFILE:
- Name: ${userProfile?.name || "Friend"}
- Fear Profile: ${userProfile?.profileTitle || "Unknown"} (${userProfile?.profile || "unknown"})
- Day: ${userProfile?.currentDay || 1} of 84
- Phase: ${userProfile?.phase || 1} (${phaseNames[userProfile?.phase] || "Awareness"})
- Level: ${userProfile?.level || 1} | XP: ${userProfile?.xp || 0}
- Streak: ${userProfile?.streak || 0} days (longest: ${userProfile?.longestStreak || 0})
`;

    if (userProfile?.streak === 0 && userProfile?.currentDay > 1) {
      userContext += `- ⚠️ STREAK BROKEN. User may be discouraged.\n`;
    }

    if (dayContext) {
      userContext += `\nTODAY'S CONTENT:\n`;
      if (dayContext.prescriptions) {
        dayContext.prescriptions.forEach(rx => {
          userContext += `- ${rx.label}: "${rx.title}" by ${rx.source}\n`;
        });
      }
      if (dayContext.challenge) {
        userContext += `- CHALLENGE: "${dayContext.challenge.title}" (${dayContext.challenge.difficulty})\n`;
      }
    }

    if (completionData) {
      userContext += `\nTODAY'S PROGRESS:\n`;
      userContext += `- Prescriptions done: ${completionData.prescriptionsDone || 0}/${completionData.prescriptionsTotal || 0}\n`;
      userContext += `- Challenge completed: ${completionData.challengeDone ? "Yes" : "Not yet"}\n`;
      userContext += `- Journal written: ${completionData.journalDone ? "Yes" : "Not yet"}\n`;
    }

    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      return NextResponse.json({
        response: getFallbackResponse(messages, userProfile),
      });
    }

    const systemPrompt = `You are the Fearless Coach — a direct, warm, no-BS transformation coach helping someone overcome fear, timidity, and low self-esteem through a 12-week program.

${userContext}

YOUR PERSONALITY:
- Direct and honest — never sugarcoat, but always kind
- You speak like a wise older friend, not a therapist
- Use their name naturally (not every sentence)
- Keep responses to 2-4 sentences unless they clearly need more
- Reference their specific situation: their day, streak, phase, today's content
- If they mention today's challenge or content, you know exactly what they're referring to
- Push them when they want to quit, celebrate when they progress
- Be specific and personal — never generic motivation

PHASE-SPECIFIC COACHING:
- Phase 1 (Days 1-14): Focus on awareness, validation, and gentle encouragement. They're just learning about themselves.
- Phase 2 (Days 15-42): Focus on skill-building, exposure support, and cognitive restructuring. Push them through discomfort.
- Phase 3 (Days 43-70): Focus on courage, action-taking, and evidence-building. Be more direct and challenging.
- Phase 4 (Days 71-84): Focus on identity, permanence, and celebration. Help them own who they've become.

NEVER:
- Use clinical/therapy language
- Give long lectures
- Be preachy or condescending
- Say "I understand" without proving you do (reference their specific situation)
- Give generic advice like "just be yourself" or "believe in yourself"`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.slice(-12).map(m => ({
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
    return NextResponse.json({ response: "I'm having a moment — try again in a sec." });
  }
}

function getFallbackResponse(messages, profile) {
  const name = profile?.name || "Friend";
  const day = profile?.currentDay || 1;
  const streak = profile?.streak || 0;
  const lastMsg = messages?.[messages.length - 1]?.text?.toLowerCase() || "";

  if (lastMsg.includes("quit") || lastMsg.includes("give up") || lastMsg.includes("stop"))
    return `${name}, I'm going to be direct. The part of you that wants to quit is the same part that's been keeping you small. You're on Day ${day}. That's ${day} days more than most people ever do. Can you commit to just today? Not the program. Just today.`;

  if (lastMsg.includes("struggling") || lastMsg.includes("hard") || lastMsg.includes("difficult") || lastMsg.includes("can't"))
    return `I hear you, ${name}. Day ${day} of any transformation is supposed to be hard. The fact that you're HERE telling me means the old pattern hasn't won. What specifically feels hardest right now?`;

  if (lastMsg.includes("good") || lastMsg.includes("progress") || lastMsg.includes("better") || lastMsg.includes("did it"))
    return `That's real, ${name}. Day ${day}, ${streak > 0 ? streak + "-day streak, " : ""}and you're feeling the shift. Don't let your brain minimize this. What you did took courage — and courage compounds.`;

  if (lastMsg.includes("scared") || lastMsg.includes("afraid") || lastMsg.includes("fear") || lastMsg.includes("anxious") || lastMsg.includes("nervous"))
    return `The challenge scares you? Good. You're on Day ${day} — you've survived every single thing that scared you so far. Your track record is literally 100%. Do it, then come tell me how it went.`;

  if (lastMsg.includes("skip") || lastMsg.includes("miss") || lastMsg.includes("didn't"))
    return `You missed something. That happens. But ${name}, two missed days become a habit. Do ONE thing from today's prescription right now. Just one. Momentum is everything — especially on Day ${day}.`;

  if (lastMsg.includes("challenge") || lastMsg.includes("mission"))
    return `Today's challenge is designed for exactly where you are on Day ${day}. It might feel like a stretch — that's intentional. The stretch IS the growth. Try it and report back.`;

  return `Hey ${name}. Day ${day}${streak > 0 ? `, ${streak}-day streak` : ""}. I'm here. What's on your mind?`;
}
