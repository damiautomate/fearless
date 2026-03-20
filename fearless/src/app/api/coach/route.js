import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, userProfile } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      // Fallback responses when no API key is set
      return NextResponse.json({
        response: getFallbackResponse(messages, userProfile),
      });
    }

    const systemPrompt = `You are the Fearless Coach — a direct, warm, no-BS transformation coach for a person named ${userProfile?.name || "Friend"} who is going through a 12-week program to overcome fear, timidity, and low self-esteem.

Their profile: ${userProfile?.profileTitle || "Unknown"} (${userProfile?.profile || "unknown"})
Current day: ${userProfile?.currentDay || 1} of 84
Current phase: Phase ${userProfile?.phase || 1}
Streak: ${userProfile?.streak || 0} days
Level: ${userProfile?.level || 1}

YOUR PERSONALITY:
- Direct and honest — never sugarcoat, but always kind
- You speak like a wise older friend, not a therapist
- Use their name occasionally
- Keep responses to 2-4 sentences unless they need more
- Reference their specific profile and phase when relevant
- Push them when they want to quit, celebrate when they make progress
- Never use generic motivational fluff — be specific and personal
- If they're struggling, acknowledge it first, then redirect to action
- If they want to quit, be firm but compassionate — remind them why they started

NEVER:
- Use clinical/therapy language
- Give long lectures
- Be preachy or condescending
- Use emojis excessively
- Recommend professional therapy (you're a coaching system, not a replacement for therapy — but you can mention it if someone seems in genuine crisis)`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.slice(-10).map((m) => ({
          role: m.role === "coach" ? "assistant" : "user",
          content: m.text,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({
        response: getFallbackResponse(messages, userProfile),
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "I'm here. Tell me more.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({
      response: "I'm having a moment — try again in a sec.",
    });
  }
}

function getFallbackResponse(messages, profile) {
  const name = profile?.name || "Friend";
  const lastMsg = messages?.[messages.length - 1]?.text?.toLowerCase() || "";

  if (lastMsg.includes("quit") || lastMsg.includes("give up") || lastMsg.includes("stop"))
    return `${name}, I'm going to be direct. The part of you that wants to quit is the same part that's been keeping you small. It's not protecting you — it's imprisoning you. Can you commit to just today? Not the whole program. Just today.`;

  if (lastMsg.includes("struggling") || lastMsg.includes("hard") || lastMsg.includes("difficult") || lastMsg.includes("can't"))
    return `I hear you, ${name}. The fact that you're HERE telling me means you haven't quit. Most people never make it this far. What specifically feels hardest right now?`;

  if (lastMsg.includes("good") || lastMsg.includes("progress") || lastMsg.includes("better") || lastMsg.includes("did it"))
    return `That's real progress, ${name}. Don't dismiss it. Your brain will try to minimize this. Reject that voice. You did something that scared you, and you survived. That's evidence. Bank it.`;

  if (lastMsg.includes("scared") || lastMsg.includes("afraid") || lastMsg.includes("fear") || lastMsg.includes("anxious"))
    return `The challenge scares you? Good. Fear is your compass — it points directly at growth. You've survived 100% of the things that scared you before. Your track record is perfect. Do it, then come tell me how it went.`;

  if (lastMsg.includes("skip") || lastMsg.includes("miss") || lastMsg.includes("didn't"))
    return `You missed a day. That's okay — this isn't about perfection. But two missed days become a habit. Do ONE thing from today's prescription. Just one. Momentum is everything.`;

  return `Hey ${name}. I'm here. What's on your mind today?`;
}
