// ═══════════════════════════════════════════════
//  FEARLESS — Content Prescription Database
//  Edit this file to add/change recommended content
// ═══════════════════════════════════════════════

export const PROFILES = {
  social_anxiety: {
    title: "The Silent Observer",
    icon: "👁️‍🗨️",
    color: "#6C63FF",
    description: "You experience the world through a lens of being watched and judged. Social situations trigger your fight-or-flight response.",
    root: "Fear of judgment and rejection",
    strength: "You're deeply observant and empathetic — you notice things others miss. That sensitivity is a superpower once the fear is removed.",
    path: "Your transformation focuses on gradually desensitizing social triggers and rebuilding your relationship with being seen.",
  },
  shame: {
    title: "The Hidden One",
    icon: "🪞",
    color: "#FF6B6B",
    description: "Somewhere along the way, you internalized a belief that you are fundamentally not enough. This is a deep identity wound.",
    root: "Internalized unworthiness",
    strength: "Your depth of feeling means you're capable of profound connection. People like you become powerful healers once healed.",
    path: "Your transformation starts with separating what happened TO you from who you ARE.",
  },
  fear_failure: {
    title: "The Frozen Perfectionist",
    icon: "🧊",
    color: "#4ECDC4",
    description: "You'd rather not try than try and fail. Perfectionism masks itself as high standards, but underneath it's pure fear.",
    root: "Equating failure with personal worth",
    strength: "Your high standards mean you're capable of exceptional work. Once you detach identity from outcomes, you become unstoppable.",
    path: "Your transformation involves redefining failure as data and building a practice of imperfect action.",
  },
  people_pleasing: {
    title: "The Shape-Shifter",
    icon: "🎭",
    color: "#FFB347",
    description: "You've become so good at reading what others want that you've lost track of what YOU want.",
    root: "Learned that love requires self-erasure",
    strength: "Your ability to read people is extraordinary. Once redirected from survival to connection, your relationships transform.",
    path: "Your transformation focuses on rebuilding your relationship with yourself — your needs, your voice, your boundaries.",
  },
  timidity: {
    title: "The Waiting One",
    icon: "🫧",
    color: "#A78BFA",
    description: "Life feels like it's happening to everyone else while you watch from the sidelines.",
    root: "Learned passivity and comfort zone dependency",
    strength: "You have untapped potential that's been conserved, not wasted. When you start moving, you'll surprise everyone.",
    path: "Your transformation is about building momentum through action and proving your comfort zone has been lying to you.",
  },
};

// ─── PRESCRIPTION DATABASE ───
// Each day has: prescriptions (content to consume) + challenge + journal prompt
// Edit the URLs, titles, and dosages here to curate the experience

export function getDayContent(profile, dayNumber) {
  // Master content mapped by day
  // This is where you add all your curated content
  // For now, here's the full Week 1-2 for all profiles

  const universalContent = {
    // ─── PHASE 1: AWARENESS (Days 1-14) ───
    1: {
      prescriptions: [
        { type: "video", icon: "▶", label: "WATCH", title: "Why You're Afraid of People (And How to Stop)", source: "Therapy in a Nutshell", platform: "YouTube", duration: "14 min", dosage: "Watch once in the morning. Write down 3 points that felt most personal.", time: "Morning", url: "https://www.youtube.com/watch?v=example1", xp: 30, color: "#FF6B6B" },
        { type: "video", icon: "▶", label: "WATCH", title: "You Are Not Your Thoughts — A Stoic Lesson", source: "Einzelgänger", platform: "YouTube", duration: "11 min", dosage: "Watch in the evening. Sit in silence for 2 minutes after.", time: "Evening", url: "https://www.youtube.com/watch?v=example2", xp: 25, color: "#A78BFA" },
      ],
      challenge: { title: "The Mirror Exercise", desc: "Stand in front of a mirror for 60 seconds. Look yourself in the eyes without breaking contact. Observe what feelings come up.", difficulty: "Easy", color: "#4ECDC4", xp: 40, tip: "Do this in private. Set a timer. Don't look away." },
      journal: { prompt: "What's one thing you avoid because of fear? Be specific — where, when, and what exactly scares you about it?", xp: 20 },
      coach: "Welcome to Day 1. Today is about awareness — not fixing, just noticing. The mirror exercise might feel strange. That discomfort? That's the starting point. Trust the process.",
    },
    2: {
      prescriptions: [
        { type: "book", icon: "📖", label: "READ", title: "The Six Pillars of Self-Esteem", source: "Nathaniel Branden", platform: "Book", duration: "Intro + Ch.1 (pp. 1–30)", dosage: "Read slowly. Underline every sentence that makes you stop.", time: "Morning", url: "#", xp: 40, color: "#4ECDC4" },
        { type: "video", icon: "▶", label: "WATCH", title: "How to Stop Caring What Others Think", source: "The School of Life", platform: "YouTube", duration: "8 min", dosage: "Watch twice — once passively, once taking notes.", time: "Afternoon", url: "https://www.youtube.com/watch?v=example3", xp: 30, color: "#FF6B6B", repeat: true },
      ],
      challenge: { title: "Social Awareness Log", desc: "Every time today you notice yourself holding back, write what happened and what you were afraid of. No fixing — just logging.", difficulty: "Easy", color: "#4ECDC4", xp: 35, tip: "Use your phone notes. Just 1-2 sentences each time." },
      journal: { prompt: "Looking at your awareness log — is there a pattern? What situation triggers you most?", xp: 20 },
      coach: "Day 2. The reading today might feel heavy — that's because Branden writes with surgical precision. Let the words land. The social awareness log is your most important tool this week.",
    },
    3: {
      prescriptions: [
        { type: "audio", icon: "🎧", label: "LISTEN", title: "The Neuroscience of Fear", source: "Huberman Lab", platform: "Podcast", duration: "25 min clip", dosage: "Listen during a walk. Movement + learning compounds the effect.", time: "Morning", url: "https://hubermanlab.com", xp: 30, color: "#FFB347" },
        { type: "video", icon: "▶", label: "WATCH", title: "Social Anxiety Is Not Shyness", source: "Dr. Tracey Marks", platform: "YouTube", duration: "10 min", dosage: "Watch fully. Write: 'The difference I never understood is...'", time: "Evening", url: "https://www.youtube.com/watch?v=example4", xp: 25, color: "#FF6B6B" },
      ],
      challenge: { title: "The Cashier Experiment", desc: "When buying something today, make eye contact with the cashier, smile, and say 'How's your day going?' Observe your heartbeat before, during, and after.", difficulty: "Easy", color: "#4ECDC4", xp: 50, tip: "Start with a cashier or someone in a service role." },
      journal: { prompt: "How did the cashier experiment feel? What did your body do before you spoke? What happened after?", xp: 20 },
      coach: "Day 3. The Huberman episode will change how you see fear — it's not a character flaw, it's a brain circuit. And the cashier experiment? Most people are shocked at how normal it feels AFTER. The fear is always worse than the thing.",
    },
    4: {
      prescriptions: [
        { type: "video", icon: "▶", label: "REWATCH", title: "Why You're Afraid of People", source: "Therapy in a Nutshell", platform: "YouTube", duration: "14 min", dosage: "Second viewing. Notice what hits differently now.", time: "Morning", url: "https://www.youtube.com/watch?v=example1", xp: 20, color: "#A78BFA", repeat: true },
        { type: "book", icon: "📖", label: "READ", title: "The Six Pillars of Self-Esteem", source: "Nathaniel Branden", platform: "Book", duration: "Chapter 2 (pp. 31–58)", dosage: "Focus on 'living consciously.' How does it apply to YOUR life?", time: "Afternoon", url: "#", xp: 40, color: "#4ECDC4" },
      ],
      challenge: { title: "The Compliment Mission", desc: "Give a genuine, specific compliment to someone today. Not 'nice shirt' — something real you noticed.", difficulty: "Medium", color: "#FFB347", xp: 60, tip: "Specificity is key. 'The way you explained that was really clear' beats 'good job.'" },
      journal: { prompt: "Write about the earliest memory you have of feeling 'not enough' or afraid of being judged. Where were you? Who was there? How old were you?", xp: 25 },
      coach: "Day 4. The journal prompt today is the deepest one yet. Take your time with it. Understanding your origin story is how you stop being controlled by it.",
    },
    5: {
      prescriptions: [
        { type: "video", icon: "▶", label: "WATCH", title: "The Spotlight Effect — Nobody's Watching You", source: "Better Ideas", platform: "YouTube", duration: "9 min", dosage: "After watching, sit in a public place for 10 minutes and notice how few people look at you.", time: "Morning", url: "https://www.youtube.com/watch?v=example5", xp: 25, color: "#FF6B6B" },
        { type: "audio", icon: "🎧", label: "LISTEN", title: "How to Build Unshakeable Self-Worth", source: "Jay Shetty Podcast", platform: "Podcast", duration: "18 min clip", dosage: "Listen actively. Pause after each key point and repeat it in your own words.", time: "Afternoon", url: "https://jayshetty.me", xp: 25, color: "#FFB347" },
      ],
      challenge: { title: "Initiate a Conversation", desc: "Start a conversation with someone you wouldn't normally talk to. A colleague, a neighbor, someone at a cafe. You go first.", difficulty: "Medium", color: "#FFB347", xp: 65, tip: "Ask a question. People love talking about themselves." },
      journal: { prompt: "You're 5 days in. What's one belief about yourself that you now see more clearly? Has anything surprised you?", xp: 20 },
      coach: "Day 5. Five days in and you're still here. That alone puts you ahead of 80% of people who start something like this. The spotlight effect video will liberate you. Watch it, then go test it.",
    },
    6: {
      prescriptions: [
        { type: "video", icon: "▶", label: "WATCH", title: "What Childhood Trauma Does to Your Confidence", source: "Patrick Teahan", platform: "YouTube", duration: "16 min", dosage: "Watch in a private space. This may bring up emotions — that's the point.", time: "Morning", url: "https://www.youtube.com/watch?v=example6", xp: 30, color: "#FF6B6B" },
        { type: "book", icon: "📖", label: "READ", title: "The Six Pillars of Self-Esteem", source: "Nathaniel Branden", platform: "Book", duration: "Chapter 3 (pp. 59–82)", dosage: "Self-acceptance chapter. Read twice if needed. This one creates breakthroughs.", time: "Evening", url: "#", xp: 40, color: "#4ECDC4" },
      ],
      challenge: { title: "Record Yourself Speaking", desc: "Record a 60-second video of yourself talking about anything — your day, an opinion, a story. Watch it back. The point is getting comfortable seeing yourself.", difficulty: "Medium", color: "#FFB347", xp: 70, tip: "Don't delete it. Keep it. You'll watch it at the end of the program and see how far you've come." },
      journal: { prompt: "Week 1 review: What pattern have you noticed in yourself this week? What's the story you tell yourself most often?", xp: 25 },
      coach: "Day 6. The Patrick Teahan video might be the most important thing you watch this week. And the recording challenge — I know it feels cringe. That's exactly why you need to do it. Discomfort is data.",
    },
    7: {
      prescriptions: [
        { type: "rest", icon: "🌿", label: "REST", title: "Integration Day", source: "Fearless System", platform: "", duration: "Full day", dosage: "No new content today. Revisit anything from this week that stuck with you. Take a long walk. Let things settle.", time: "Anytime", url: "#", xp: 20, color: "#4ECDC4" },
      ],
      challenge: { title: "Gratitude + Intention", desc: "Write 3 things you're grateful for this week and 1 intention for next week. Rest is part of transformation.", difficulty: "Easy", color: "#4ECDC4", xp: 30, tip: "Be specific with gratitude. Not 'my family' but 'the moment when...'" },
      journal: { prompt: "It's rest day. No prompt — write whatever comes to mind. Or don't write at all. Your call.", xp: 15 },
      coach: "Day 7. Rest day. This isn't laziness — it's integration. Your brain literally needs downtime to consolidate what you've learned. Go easy today. You've earned it.",
    },
  };

  // Profile-specific overrides for certain days
  const profileOverrides = {
    social_anxiety: {},
    shame: {
      1: {
        prescriptions: [
          { type: "video", icon: "▶", label: "WATCH", title: "The Power of Vulnerability", source: "Brené Brown (TED)", platform: "YouTube", duration: "20 min", dosage: "Watch fully. Write the one line that hits you hardest.", time: "Morning", url: "https://www.youtube.com/watch?v=iCvmsMzlF7o", xp: 35, color: "#FF6B6B" },
          { type: "video", icon: "▶", label: "WATCH", title: "Healing Toxic Shame", source: "Patrick Teahan", platform: "YouTube", duration: "18 min", dosage: "Watch in a private space. Let emotions flow.", time: "Evening", url: "https://www.youtube.com/watch?v=example7", xp: 30, color: "#A78BFA" },
        ],
        challenge: { title: "The Mirror Affirmation", desc: "Look yourself in the eyes and say: 'I am enough, exactly as I am.' Say it 5 times. Notice the resistance.", difficulty: "Easy", color: "#4ECDC4", xp: 45, tip: "The resistance IS the work. Do it anyway." },
      },
    },
    fear_failure: {
      1: {
        prescriptions: [
          { type: "video", icon: "▶", label: "WATCH", title: "Why Perfectionists Get Nothing Done", source: "Struthless", platform: "YouTube", duration: "12 min", dosage: "Watch, then immediately do one thing badly on purpose.", time: "Morning", url: "https://www.youtube.com/watch?v=example8", xp: 30, color: "#FF6B6B" },
          { type: "video", icon: "▶", label: "WATCH", title: "How to Stop Being Afraid of Failure", source: "The Futur", platform: "YouTube", duration: "15 min", dosage: "Pin the best reframe where you'll see it daily.", time: "Evening", url: "https://www.youtube.com/watch?v=example9", xp: 25, color: "#A78BFA" },
        ],
        challenge: { title: "The Imperfect Post", desc: "Post something publicly that isn't perfect. Don't edit more than once. Hit send and walk away.", difficulty: "Medium", color: "#FFB347", xp: 55, tip: "A thought, a photo, a comment. Imperfection is the point." },
      },
    },
    people_pleasing: {
      1: {
        prescriptions: [
          { type: "video", icon: "▶", label: "WATCH", title: "Why You Lose Yourself in Relationships", source: "Therapy in a Nutshell", platform: "YouTube", duration: "13 min", dosage: "Ask: 'Where in my life am I currently doing this?' Write 3 examples.", time: "Morning", url: "https://www.youtube.com/watch?v=example10", xp: 30, color: "#FF6B6B" },
          { type: "book", icon: "📖", label: "READ", title: "Not Nice", source: "Dr. Aziz Gazipura", platform: "Book", duration: "Chapter 1 (pp. 1–25)", dosage: "This book was written for you. Notice where you feel called out.", time: "Evening", url: "#", xp: 40, color: "#4ECDC4" },
        ],
        challenge: { title: "The Honest No", desc: "Say 'no' to one thing you'd normally say yes to. Notice the guilt. Do it anyway.", difficulty: "Medium", color: "#FFB347", xp: 60, tip: "It can be small — a different restaurant, skipping a plan." },
      },
    },
    timidity: {
      1: {
        prescriptions: [
          { type: "video", icon: "▶", label: "WATCH", title: "The 5 Second Rule — How to Stop Hesitating", source: "Mel Robbins", platform: "YouTube", duration: "22 min", dosage: "Use the 5-second rule 3 times today. Count 5-4-3-2-1 and move.", time: "Morning", url: "https://www.youtube.com/watch?v=example11", xp: 30, color: "#FF6B6B" },
          { type: "video", icon: "▶", label: "WATCH", title: "You're Not Lazy, You're Scared", source: "Struthless", platform: "YouTube", duration: "11 min", dosage: "Write: 'The thing I call laziness is actually fear of...'", time: "Evening", url: "https://www.youtube.com/watch?v=example12", xp: 25, color: "#A78BFA" },
        ],
        challenge: { title: "The First Move", desc: "Initiate one interaction you'd normally wait for — a text, a conversation, a plan. You go first.", difficulty: "Easy", color: "#4ECDC4", xp: 45, tip: "The smaller the better. Just break the pattern of waiting." },
      },
    },
  };

  // Get content: check profile-specific first, then universal
  const overrides = profileOverrides[profile] || {};
  const dayContent = overrides[dayNumber] || universalContent[dayNumber];

  if (!dayContent) {
    // For days without specific content yet, generate a template
    return {
      prescriptions: [
        { type: "video", icon: "▶", label: "WATCH", title: "Content coming soon for Day " + dayNumber, source: "Fearless", platform: "", duration: "—", dosage: "Check back soon — new prescriptions are being curated.", time: "Morning", url: "#", xp: 20, color: "#6C63FF" },
      ],
      challenge: { title: "Free Practice", desc: "Repeat any previous challenge that felt meaningful, or practice a skill from this week's content.", difficulty: "Easy", color: "#4ECDC4", xp: 30, tip: "Repetition is how change sticks." },
      journal: { prompt: "What's something you noticed about yourself today that you wouldn't have noticed a week ago?", xp: 15 },
      coach: `Day ${dayNumber}. Keep going. Every day you show up, the old version of you gets a little quieter.`,
    };
  }

  return dayContent;
}

// ─── XP THRESHOLDS ───
export const XP_LEVELS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 7000, 8500, 10000];

export function getXpForNextLevel(level) {
  return XP_LEVELS[level] || 10000;
}
