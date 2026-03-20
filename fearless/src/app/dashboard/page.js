"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { saveDiagnostic, saveDayProgress, addXp, updateStreak, saveJournalEntry, saveCoachMessage, getCoachMessages, getDayProgress } from "@/lib/firestore";
import { getDayContent, PROFILES, getXpForNextLevel } from "@/lib/content";

// ─── Shared Components ───
function AnimIn({ children, delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)", ...style }}>{children}</div>;
}
function Card({ children, style = {} }) {
  return <div style={{ borderRadius: "18px", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", ...style }}>{children}</div>;
}

// ═══════════════════════════════════
//  DIAGNOSTIC ASSESSMENT
// ═══════════════════════════════════
const QUESTIONS = [
  { id: "trigger", text: "When you walk into a room full of people you don't know, what happens inside you?", type: "choice", options: [
    { text: "My chest tightens and I look for the exit", value: "social_anxiety", emoji: "😰" },
    { text: "I immediately feel like I don't belong", value: "shame", emoji: "🫥" },
    { text: "I stay quiet and wait for someone to approach", value: "timidity", emoji: "🤐" },
    { text: "I scan for someone safe to stand near", value: "people_pleasing", emoji: "🫣" },
  ]},
  { id: "self_talk", text: "Be honest — what does the voice in your head say most often?", type: "choice", options: [
    { text: '"Everyone is watching and judging you"', value: "social_anxiety", emoji: "👁️" },
    { text: '"You\'re not good enough for this"', value: "shame", emoji: "💔" },
    { text: '"Don\'t try, you\'ll probably fail anyway"', value: "fear_failure", emoji: "🪨" },
    { text: '"Just agree, it\'s easier that way"', value: "people_pleasing", emoji: "🎭" },
  ]},
  { id: "avoidance", text: "What do you avoid the most?", type: "choice", options: [
    { text: "Speaking up in groups or being center of attention", value: "social_anxiety", emoji: "🔇" },
    { text: "Situations where I might fail or look incompetent", value: "fear_failure", emoji: "🚫" },
    { text: "Conflict or saying no to people", value: "people_pleasing", emoji: "🏳️" },
    { text: "New experiences — I stick to what's safe", value: "timidity", emoji: "🫧" },
  ]},
  { id: "origin", text: "Think back. Where do you think this started?", type: "choice", options: [
    { text: "I was mocked, bullied, or embarrassed publicly", value: "social_anxiety", emoji: "🩹" },
    { text: "I was told I wasn't enough by people who mattered", value: "shame", emoji: "🪞" },
    { text: "I failed at something and never fully recovered", value: "fear_failure", emoji: "📉" },
    { text: "I learned that love came with conditions", value: "people_pleasing", emoji: "⚖️" },
  ]},
  { id: "severity", text: "How often does fear stop you from doing what you want?", type: "scale", labels: ["Rarely", "Sometimes", "Often", "Almost always", "Every day"] },
  { id: "commitment", text: "How ready are you to do uncomfortable things to change?", type: "scale", labels: ["Not sure", "Willing to try", "Ready", "Very ready", "Whatever it takes"] },
];

function DiagnosticFlow({ user, onComplete }) {
  const [stage, setStage] = useState("welcome");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [scaleVal, setScaleVal] = useState(2);
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  useEffect(() => { setVisible(false); setSelected(null); setScaleVal(2); setTimeout(() => setVisible(true), 80); }, [qi]);

  const handleAnswer = async (value) => {
    const newAnswers = { ...answers, [qi]: value };
    setAnswers(newAnswers);
    if (qi < QUESTIONS.length - 1) {
      setQi(qi + 1);
    } else {
      const counts = {};
      Object.entries(newAnswers).forEach(([idx, val]) => {
        const q = QUESTIONS[Number(idx)];
        if (q.type === "choice") counts[val] = (counts[val] || 0) + 1;
      });
      const profileKeys = Object.keys(PROFILES);
      const profileCounts = {};
      profileKeys.forEach(k => { if (counts[k]) profileCounts[k] = counts[k]; });
      const dominant = Object.entries(profileCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "timidity";
      await saveDiagnostic(user.uid, newAnswers, dominant);
      onComplete(dominant);
    }
  };

  if (stage === "welcome") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "0.8s" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🔓</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px,6vw,44px)", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Fearless</h1>
        <p style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "4px", color: "rgba(255,255,255,0.25)", marginBottom: "40px", textTransform: "uppercase" }}>Your Transformation Starts Here</p>
        <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(16px,2.5vw,19px)", color: "rgba(255,255,255,0.45)", maxWidth: "480px", lineHeight: 1.7, marginBottom: "48px" }}>
          The next few minutes will be the most honest conversation you've had with yourself. There are no wrong answers — only real ones.
        </p>
        <button onClick={() => setStage("questions")} style={{ fontFamily: "var(--sans)", fontSize: "15px", fontWeight: 600, padding: "16px 48px", borderRadius: "60px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", color: "#fff", boxShadow: "0 4px 30px rgba(108,99,255,0.35)" }}>
          I'm Ready to Begin
        </button>
      </div>
    );
  }

  const q = QUESTIONS[qi];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", maxWidth: "560px", margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "0.5s" }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)", marginBottom: "8px" }}>{qi + 1} / {QUESTIONS.length}</p>
      <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(20px,4vw,28px)", fontWeight: 600, color: "#fff", textAlign: "center", lineHeight: 1.4, marginBottom: "36px" }}>{q.text}</h2>

      {q.type === "choice" && <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => { setSelected(i); setTimeout(() => handleAnswer(opt.value), 400); }} style={{
            fontFamily: "var(--serif)", fontSize: "14px", padding: "16px 20px", borderRadius: "14px",
            border: `1px solid ${selected === i ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.06)"}`,
            background: selected === i ? "rgba(108,99,255,0.15)" : "rgba(255,255,255,0.025)",
            color: selected === i ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: "12px", transition: "0.3s",
          }}>
            <span style={{ fontSize: "18px" }}>{opt.emoji}</span><span>{opt.text}</span>
          </button>
        ))}
      </div>}

      {q.type === "scale" && <div style={{ width: "100%", maxWidth: "460px" }}>
        <input type="range" min="0" max="4" value={scaleVal} onChange={e => setScaleVal(Number(e.target.value))} style={{ width: "100%", height: "6px", borderRadius: "3px", appearance: "none", outline: "none", background: `linear-gradient(90deg,#6C63FF ${scaleVal*25}%,rgba(255,255,255,0.08) ${scaleVal*25}%)`, cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
          {q.labels.map((l, i) => <span key={i} style={{ fontFamily: "var(--mono)", fontSize: "9px", color: scaleVal === i ? "#fff" : "rgba(255,255,255,0.2)", fontWeight: scaleVal === i ? 600 : 400, textAlign: "center", maxWidth: "65px" }}>{l}</span>)}
        </div>
        <button onClick={() => handleAnswer(scaleVal)} style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 600, padding: "14px 40px", borderRadius: "60px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", color: "#fff", display: "block", margin: "32px auto 0" }}>Continue</button>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════
//  TAB: TODAY (Dashboard)
// ═══════════════════════════════════
function TodayTab({ profile, refreshProfile }) {
  const { user } = useAuth();
  const day = profile.currentDay || 1;
  const content = getDayContent(profile.profile, day);
  const p = PROFILES[profile.profile] || PROFILES.timidity;
  const [completed, setCompleted] = useState({});
  const [challengeDone, setCd] = useState(false);
  const [journalDone, setJd] = useState(false);
  const [coachOpen, setCo] = useState(false);
  const [showReport, setSr] = useState(false);
  const [showJournal, setSj] = useState(false);
  const [reportText, setRt] = useState("");
  const [journalText, setJtx] = useState("");
  const [xpToast, setXt] = useState(null);
  const pct = (profile.xp || 0) / getXpForNextLevel(profile.level || 1) * 100;

  const earnXp = async (amount) => {
    setXt(amount);
    setTimeout(() => setXt(null), 1800);
    await addXp(user.uid, amount);
    refreshProfile();
  };

  if (!content) return <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px" }}>Loading today's content...</p>;

  return (
    <div>
      {xpToast && <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "10px 24px", borderRadius: "60px", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 700, color: "#fff", boxShadow: "0 4px 20px rgba(108,99,255,0.4)" }}>+{xpToast} XP 🎯</div>}

      <AnimIn delay={80}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)" }}>DAY {day} OF 84</p>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: "#fff" }}>Good morning, {profile.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <span style={{ fontSize: "13px" }}>{p.icon}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: p.color }}>{p.title}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(255,179,71,0.08)", border: "1px solid rgba(255,179,71,0.12)", display: "flex", alignItems: "center", gap: "5px" }}>
              <span>🔥</span><span style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 700, color: "#FFB347" }}>{profile.streak || 0}</span>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.12)" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}><span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "rgba(108,99,255,0.5)" }}>LVL {profile.level || 1}</span><span style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, color: "#6C63FF" }}>{profile.xp || 0} XP</span></div>
              <div style={{ width: "70px", height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.05)", marginTop: "4px" }}><div style={{ width: `${Math.min(pct,100)}%`, height: "100%", borderRadius: "2px", background: "linear-gradient(90deg,#6C63FF,#4ECDC4)" }} /></div>
            </div>
          </div>
        </div>
      </AnimIn>

      {/* Coach Note */}
      {content.coach && <AnimIn delay={120}><div onClick={() => setCo(!coachOpen)} style={{ padding: "14px 16px", borderRadius: "14px", cursor: "pointer", background: "linear-gradient(135deg,rgba(108,99,255,0.06),rgba(78,205,196,0.03))", border: "1px solid rgba(108,99,255,0.08)", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🧠</div>
          <div style={{ flex: 1 }}><p style={{ fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 600, color: "#fff" }}>Coach's Note</p>{!coachOpen && <p style={{ fontFamily: "var(--serif)", fontSize: "11px", color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{content.coach.slice(0, 50)}...</p>}</div>
        </div>
        {coachOpen && <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginTop: "10px", paddingLeft: "40px" }}>{content.coach}</p>}
      </div></AnimIn>}

      {/* Prescriptions */}
      <AnimIn delay={160}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><span>💊</span><h2 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: 600, color: "#fff" }}>Today's Prescriptions</h2></div></AnimIn>

      {content.prescriptions?.map((rx, i) => {
        const done = completed[i];
        const [open, setOpen] = useState(false);
        return <AnimIn key={i} delay={200 + i * 50}>
          <div style={{ borderRadius: "14px", marginBottom: "8px", background: done ? "rgba(78,205,196,0.03)" : "rgba(255,255,255,0.02)", border: `1px solid ${done ? "rgba(78,205,196,0.08)" : "rgba(255,255,255,0.04)"}`, opacity: done ? 0.6 : 1, transition: "0.3s" }}>
            <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0, background: `${rx.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{rx.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: "5px", marginBottom: "2px" }}><span style={{ fontFamily: "var(--mono)", fontSize: "8px", letterSpacing: "1px", color: rx.color, background: `${rx.color}10`, padding: "1px 5px", borderRadius: "3px" }}>{rx.label}</span><span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "rgba(255,255,255,0.12)" }}>{rx.time}</span></div>
                <p style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 600, color: done ? "rgba(255,255,255,0.3)" : "#fff", textDecoration: done ? "line-through" : "none", lineHeight: 1.3 }}>{rx.title}</p>
                <p style={{ fontFamily: "var(--serif)", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "1px" }}>{rx.source} · {rx.duration}</p>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(108,99,255,0.35)", flexShrink: 0 }}>+{rx.xp}</span>
            </div>
            {open && <div style={{ padding: "0 14px 12px 58px" }}>
              <div style={{ padding: "8px 10px", borderRadius: "8px", background: `${rx.color}05`, border: `1px solid ${rx.color}08`, marginBottom: "8px" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: "8px", color: rx.color, letterSpacing: "1px", marginBottom: "2px" }}>PRESCRIPTION</p>
                <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{rx.dosage}</p>
              </div>
              {rx.url && rx.url !== "#" && <a href={rx.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, padding: "7px 16px", borderRadius: "8px", background: `${rx.color}`, color: "#fff", textDecoration: "none", display: "inline-block", marginRight: "8px" }}>Open →</a>}
              {!done && <button onClick={() => { setCompleted(p => ({...p, [i]: true})); earnXp(rx.xp); }} style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(78,205,196,0.15)", color: "#4ECDC4" }}>Done ✓</button>}
            </div>}
          </div>
        </AnimIn>;
      })}

      {/* Challenge */}
      {content.challenge && <AnimIn delay={400}>
        <Card style={{ marginTop: "8px", marginBottom: "14px", background: challengeDone ? "rgba(78,205,196,0.03)" : "linear-gradient(135deg,rgba(255,179,71,0.04),rgba(255,107,107,0.02))", borderColor: challengeDone ? "rgba(78,205,196,0.08)" : "rgba(255,179,71,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><span>⚡</span><p style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "2px", color: "#FFB347" }}>TODAY'S MISSION</p><span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: "9px", color: content.challenge.color, background: `${content.challenge.color}10`, padding: "2px 6px", borderRadius: "4px" }}>{content.challenge.difficulty}</span></div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "16px", fontWeight: 600, color: challengeDone ? "rgba(255,255,255,0.3)" : "#fff", marginBottom: "6px" }}>{challengeDone ? "✓ " : ""}{content.challenge.title}</h3>
          <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: "8px" }}>{content.challenge.desc}</p>
          <div style={{ padding: "6px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.02)", marginBottom: "10px" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "#4ECDC4", letterSpacing: "1px" }}>TIP</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{content.challenge.tip}</p>
          </div>
          {!challengeDone && !showReport && <button onClick={() => setSr(true)} style={{ fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 600, padding: "9px 20px", borderRadius: "10px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#FFB347,#FF6B6B)", color: "#fff" }}>I Did It</button>}
          {showReport && !challengeDone && <div>
            <textarea value={reportText} onChange={e => setRt(e.target.value)} placeholder="How did it feel?" rows={2} style={{ width: "100%", fontFamily: "var(--serif)", fontSize: "13px", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#fff", resize: "none", outline: "none", marginBottom: "6px", boxSizing: "border-box" }} />
            <button onClick={async () => { setCd(true); setSr(false); await earnXp(content.challenge.xp); }} style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", background: reportText.trim() ? "#4ECDC4" : "rgba(255,255,255,0.05)", color: reportText.trim() ? "#fff" : "rgba(255,255,255,0.2)" }}>Submit ✓</button>
          </div>}
          {challengeDone && <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "#4ECDC4", fontStyle: "italic" }}>Mission complete. +{content.challenge.xp} XP</p>}
        </Card>
      </AnimIn>}

      {/* Journal */}
      {content.journal && <AnimIn delay={460}>
        <Card style={{ marginBottom: "14px", background: journalDone ? "rgba(78,205,196,0.03)" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><span>📝</span><p style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "2px", color: "#A78BFA" }}>REFLECTION</p></div>
          <p style={{ fontFamily: "var(--display)", fontSize: "14px", fontStyle: "italic", color: journalDone ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)", lineHeight: 1.45, marginBottom: "10px" }}>"{content.journal.prompt}"</p>
          {!journalDone && !showJournal && <button onClick={() => setSj(true)} style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, padding: "7px 16px", borderRadius: "8px", border: "1px solid rgba(167,139,250,0.2)", background: "transparent", color: "#A78BFA", cursor: "pointer" }}>Write</button>}
          {showJournal && !journalDone && <div>
            <textarea value={journalText} onChange={e => setJtx(e.target.value)} placeholder="Be honest..." rows={3} style={{ width: "100%", fontFamily: "var(--serif)", fontSize: "13px", padding: "10px", borderRadius: "10px", border: "1px solid rgba(167,139,250,0.12)", background: "rgba(167,139,250,0.03)", color: "#fff", resize: "none", outline: "none", marginBottom: "6px", boxSizing: "border-box" }} />
            <button onClick={async () => { if (journalText.trim()) { setJd(true); setSj(false); await saveJournalEntry(user.uid, day, journalText, content.journal.prompt); await earnXp(content.journal.xp); } }} style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", background: journalText.trim() ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "rgba(255,255,255,0.05)", color: journalText.trim() ? "#fff" : "rgba(255,255,255,0.2)" }}>Save</button>
          </div>}
          {journalDone && <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "#A78BFA", fontStyle: "italic" }}>Saved. +{content.journal.xp} XP</p>}
        </Card>
      </AnimIn>}
    </div>
  );
}

// ═══════════════════════════════════
//  TAB: COACH
// ═══════════════════════════════════
function CoachTab({ profile }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([{ role: "coach", text: `Hey ${profile.name}. I'm here. What's on your mind today?` }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, typing]);

  const PROMPTS = [
    { text: "I'm struggling today", emoji: "😔" },
    { text: "I skipped yesterday", emoji: "😕" },
    { text: "I feel progress!", emoji: "💪" },
    { text: "I want to quit", emoji: "🏳️" },
    { text: "Today scares me", emoji: "😰" },
  ];

  const send = async (text) => {
    const newMsgs = [...msgs, { role: "user", text }];
    setMsgs(newMsgs);
    setTyping(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs, userProfile: profile }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: "coach", text: data.response }]);
      await saveCoachMessage(user.uid, "user", text);
      await saveCoachMessage(user.uid, "coach", data.response);
    } catch {
      setMsgs(prev => [...prev, { role: "coach", text: "I'm having a moment — try again." }]);
    }
    setTyping(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: "400px" }}>
      <div style={{ padding: "12px 14px", borderRadius: "14px", marginBottom: "10px", background: "linear-gradient(135deg,rgba(108,99,255,0.06),rgba(78,205,196,0.03))", border: "1px solid rgba(108,99,255,0.08)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🧠</div>
        <div><p style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 700, color: "#fff" }}>Fearless Coach</p><p style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>AI-powered · Knows your journey</p></div>
        <div style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: "#4ECDC4", boxShadow: "0 0 6px rgba(78,205,196,0.5)" }} />
      </div>

      <div ref={ref} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "8px" }}>
        {msgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
          <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: "14px", background: m.role === "user" ? "linear-gradient(135deg,#6C63FF,#5A52E0)" : "rgba(255,255,255,0.03)", border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "13px", lineHeight: 1.55, color: m.role === "user" ? "#fff" : "rgba(255,255,255,0.5)" }}>{m.text}</p>
          </div>
        </div>)}
        {typing && <div style={{ display: "flex" }}><div style={{ padding: "10px 16px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", display: "flex", gap: "4px" }}>{[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", animation: `typingDot 1.2s ${i*0.15}s infinite` }} />)}</div></div>}
      </div>

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", padding: "6px 0" }}>
        {PROMPTS.map((p, i) => <button key={i} onClick={() => send(p.text)} style={{ fontFamily: "var(--serif)", fontSize: "10px", padding: "5px 10px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}><span>{p.emoji}</span> {p.text}</button>)}
      </div>

      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "8px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { send(input.trim()); setInput(""); } }} placeholder="Talk to your coach..." style={{ flex: 1, fontFamily: "var(--serif)", fontSize: "13px", padding: "11px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#fff", outline: "none" }} />
        <button onClick={() => { if (input.trim()) { send(input.trim()); setInput(""); } }} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "none", cursor: "pointer", background: input.trim() ? "linear-gradient(135deg,#6C63FF,#4ECDC4)" : "rgba(255,255,255,0.03)", color: "#fff", fontSize: "15px" }}>↑</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  TAB: PROGRESS
// ═══════════════════════════════════
function ProgressTab({ profile }) {
  const score = Math.min(Math.round((profile.currentDay / 84) * 100), 100);
  const p = PROFILES[profile.profile] || PROFILES.timidity;

  return (
    <div>
      <AnimIn delay={80}>
        <Card style={{ marginBottom: "14px", background: "linear-gradient(135deg,rgba(108,99,255,0.05),rgba(78,205,196,0.03))", borderColor: "rgba(108,99,255,0.08)", textAlign: "center", padding: "28px" }}>
          <div style={{ fontSize: "48px", fontFamily: "var(--display)", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{score}%</div>
          <p style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>Transformation Progress</p>
          <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.04)", marginTop: "16px" }}>
            <div style={{ width: `${score}%`, height: "100%", borderRadius: "3px", background: "linear-gradient(90deg,#6C63FF,#4ECDC4)", transition: "1s" }} />
          </div>
        </Card>
      </AnimIn>

      <AnimIn delay={160}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "14px" }}>
          {[
            { l: "Current Day", v: `${profile.currentDay || 0}/84`, c: "#6C63FF", i: "📅" },
            { l: "Streak", v: `${profile.streak || 0} days`, c: "#FFB347", i: "🔥" },
            { l: "Level", v: profile.level || 1, c: "#4ECDC4", i: "⭐" },
            { l: "Total XP", v: (profile.xp || 0).toLocaleString(), c: "#A78BFA", i: "✨" },
          ].map((s, i) => (
            <Card key={i} style={{ textAlign: "center", padding: "16px" }}>
              <span style={{ fontSize: "20px" }}>{s.i}</span>
              <p style={{ fontFamily: "var(--sans)", fontSize: "20px", fontWeight: 700, color: s.c, marginTop: "6px" }}>{s.v}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px", marginTop: "2px" }}>{s.l}</p>
            </Card>
          ))}
        </div>
      </AnimIn>

      <AnimIn delay={240}>
        <Card style={{ marginBottom: "14px" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "2px", color: "#A78BFA", marginBottom: "10px" }}>YOUR PROFILE</p>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: `${p.color}15`, border: `2px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>{p.icon}</div>
            <div>
              <h3 style={{ fontFamily: "var(--sans)", fontSize: "16px", fontWeight: 700, color: "#fff" }}>{p.title}</h3>
              <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{p.root}</p>
            </div>
          </div>
          <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginTop: "12px" }}>{p.description}</p>
        </Card>
      </AnimIn>

      <AnimIn delay={320}>
        <Card>
          <p style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "2px", color: "#4ECDC4", marginBottom: "10px" }}>PHASE PROGRESS</p>
          {[
            { n: "Awareness", w: "Wk 1–2", c: "#6C63FF", days: 14 },
            { n: "Rewiring", w: "Wk 3–6", c: "#4ECDC4", days: 28 },
            { n: "Proving", w: "Wk 7–10", c: "#FFB347", days: 28 },
            { n: "Identity Lock", w: "Wk 11–12", c: "#FF6B6B", days: 14 },
          ].map((ph, i) => {
            const startDay = [0, 14, 42, 70][i];
            const pct = Math.min(Math.max(((profile.currentDay - startDay) / ph.days) * 100, 0), 100);
            return <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--sans)", fontSize: "12px", color: pct > 0 ? "#fff" : "rgba(255,255,255,0.2)" }}>{ph.n}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: pct >= 100 ? "#4ECDC4" : pct > 0 ? ph.c : "rgba(255,255,255,0.12)" }}>{pct >= 100 ? "✓" : `${Math.round(pct)}%`}</span>
              </div>
              <div style={{ width: "100%", height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: "3px", background: ph.c, transition: "1s" }} />
              </div>
            </div>;
          })}
        </Card>
      </AnimIn>
    </div>
  );
}

// ═══════════════════════════════════
//  TAB: SETTINGS
// ═══════════════════════════════════
function SettingsTab({ profile, refreshProfile }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const p = PROFILES[profile.profile] || PROFILES.timidity;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div>
      <AnimIn delay={80}>
        <Card style={{ marginBottom: "14px", background: "linear-gradient(135deg,rgba(108,99,255,0.05),rgba(78,205,196,0.03))", borderColor: "rgba(108,99,255,0.08)" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `${p.color}20`, border: `2px solid ${p.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>{p.icon}</div>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 700, color: "#fff" }}>{profile.name}</h2>
              <p style={{ fontFamily: "var(--mono)", fontSize: "10px", color: p.color }}>{p.title}</p>
              <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "2px" }}>{profile.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            {[{ l: "Level", v: profile.level || 1, c: "#6C63FF" }, { l: "Day", v: `${profile.currentDay || 0}/84`, c: "#4ECDC4" }, { l: "Streak", v: `${profile.streak || 0}🔥`, c: "#FFB347" }, { l: "XP", v: (profile.xp || 0).toLocaleString(), c: "#A78BFA" }].map((s, i) => <div key={i}><p style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "rgba(255,255,255,0.12)", letterSpacing: "1px" }}>{s.l}</p><p style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 700, color: s.c }}>{s.v}</p></div>)}
          </div>
        </Card>
      </AnimIn>

      <AnimIn delay={160}>
        <Card style={{ marginBottom: "14px" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "2px", color: "#6C63FF", marginBottom: "12px" }}>ACCOUNT</p>
          {[
            { icon: "🧬", label: "Fear Profile", value: p.title },
            { icon: "📅", label: "Current Phase", value: `Phase ${profile.phase || 1} · Day ${profile.currentDay || 0}` },
            { icon: "📧", label: "Email", value: profile.email },
            { icon: "🗓️", label: "Member Since", value: profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : "—" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <span style={{ fontSize: "14px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}><p style={{ fontFamily: "var(--sans)", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{item.label}</p></div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>{item.value}</p>
            </div>
          ))}
        </Card>
      </AnimIn>

      <AnimIn delay={240}>
        <button onClick={handleLogout} style={{ width: "100%", fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 600, padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,107,107,0.12)", background: "rgba(255,107,107,0.04)", color: "rgba(255,107,107,0.5)", cursor: "pointer" }}>
          Sign Out
        </button>
      </AnimIn>

      <AnimIn delay={280}>
        <p style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(255,255,255,0.06)", marginTop: "20px", letterSpacing: "2px" }}>FEARLESS v1.0</p>
      </AnimIn>
    </div>
  );
}

// ═══════════════════════════════════
//  MAIN DASHBOARD SHELL
// ═══════════════════════════════════
const TABS = [
  { key: "today", label: "Today", icon: "💊" },
  { key: "coach", label: "Coach", icon: "🧠" },
  { key: "progress", label: "Progress", icon: "📊" },
  { key: "settings", label: "Profile", icon: "⚙️" },
];

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("today");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "40px" }}>🔓</div><p style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "12px" }}>Loading...</p></div></div>;

  if (!user || !profile) return null;

  // Show diagnostic if not completed
  if (!profile.diagnosticComplete) {
    return <DiagnosticFlow user={user} onComplete={() => refreshProfile()} />;
  }

  return (
    <div style={{ minHeight: "100vh", maxHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", paddingBottom: "80px" }}>
          {tab === "today" && <TodayTab profile={profile} refreshProfile={refreshProfile} />}
          {tab === "coach" && <CoachTab profile={profile} />}
          {tab === "progress" && <ProgressTab profile={profile} />}
          {tab === "settings" && <SettingsTab profile={profile} refreshProfile={refreshProfile} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 12px", flexShrink: 0, background: "rgba(8,7,16,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", padding: "4px 16px" }}>
            <span style={{ fontSize: "19px", filter: active ? "none" : "grayscale(0.6) opacity(0.4)", transform: active ? "scale(1.1)" : "scale(1)", transition: "0.25s" }}>{t.icon}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: active ? "#fff" : "rgba(255,255,255,0.18)", fontWeight: active ? 600 : 400 }}>{t.label}</span>
            {active && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#4ECDC4)", boxShadow: "0 0 6px rgba(108,99,255,0.4)" }} />}
          </button>;
        })}
      </div>
    </div>
  );
}
