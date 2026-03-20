"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "next/navigation";
import { saveDiagnostic, saveDayProgress, addXp, updateStreak, saveJournalEntry, saveCoachMessage, getCoachMessages, getDayProgress } from "@/lib/firestore";
import { getDayContent, PROFILES, getXpForNextLevel } from "@/lib/content";
import { IconFlame, IconZap, IconCheck, IconSend, IconChevron, IconSun, IconMoon, IconLogout, IconTarget, IconShield, typeIconMap, typeColorMap } from "@/components/icons";

// ─── Shared UI ───
function AnimIn({ children, delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(12px)", transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)", ...style }}>{children}</div>;
}

function Card({ children, style = {}, hover = false }) {
  return (
    <div style={{
      borderRadius: "14px", padding: "18px",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      boxShadow: "var(--shadow)", transition: "all 0.2s ease",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ color, text, style = {} }) {
  return <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color, marginBottom: "8px", fontWeight: 500, ...style }}>{text}</p>;
}

function Badge({ text, color, style = {} }) {
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.5px", padding: "3px 8px", borderRadius: "6px", background: `color-mix(in srgb, ${color} 12%, transparent)`, color, fontWeight: 500, ...style }}>{text}</span>;
}

// ═══════════════════════════════════
//  DIAGNOSTIC
// ═══════════════════════════════════
const QUESTIONS = [
  { id: "trigger", text: "When you walk into a room full of people you don't know, what happens inside you?", type: "choice", options: [
    { text: "My chest tightens and I look for the exit", value: "social_anxiety" },
    { text: "I immediately feel like I don't belong", value: "shame" },
    { text: "I stay quiet and wait for someone to approach", value: "timidity" },
    { text: "I scan for someone safe to stand near", value: "people_pleasing" },
  ]},
  { id: "self_talk", text: "What does the voice in your head say most often?", type: "choice", options: [
    { text: "\"Everyone is watching and judging you\"", value: "social_anxiety" },
    { text: "\"You're not good enough for this\"", value: "shame" },
    { text: "\"Don't try, you'll probably fail anyway\"", value: "fear_failure" },
    { text: "\"Just agree, it's easier that way\"", value: "people_pleasing" },
  ]},
  { id: "avoidance", text: "What do you avoid the most?", type: "choice", options: [
    { text: "Speaking up in groups", value: "social_anxiety" },
    { text: "Situations where I might fail", value: "fear_failure" },
    { text: "Conflict or saying no", value: "people_pleasing" },
    { text: "New experiences — I stick to what's safe", value: "timidity" },
  ]},
  { id: "origin", text: "Where do you think this started?", type: "choice", options: [
    { text: "I was mocked or embarrassed publicly", value: "social_anxiety" },
    { text: "I was told I wasn't enough", value: "shame" },
    { text: "I failed and never fully recovered", value: "fear_failure" },
    { text: "I learned love came with conditions", value: "people_pleasing" },
  ]},
  { id: "severity", text: "How often does fear stop you from doing what you want?", type: "scale", labels: ["Rarely", "Sometimes", "Often", "Almost always", "Every day"] },
  { id: "commitment", text: "How ready are you to do uncomfortable things to change?", type: "scale", labels: ["Not sure", "Willing", "Ready", "Very ready", "Whatever it takes"] },
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
    if (qi < QUESTIONS.length - 1) { setQi(qi + 1); return; }
    const counts = {};
    Object.entries(newAnswers).forEach(([idx, val]) => {
      if (QUESTIONS[Number(idx)].type === "choice") counts[val] = (counts[val] || 0) + 1;
    });
    const profileKeys = Object.keys(PROFILES);
    const profileCounts = {};
    profileKeys.forEach(k => { if (counts[k]) profileCounts[k] = counts[k]; });
    const dominant = Object.entries(profileCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "timidity";
    await saveDiagnostic(user.uid, newAnswers, dominant);
    onComplete(dominant);
  };

  if (stage === "welcome") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "0.8s" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <IconShield size={32} color="var(--accent)" />
        </div>
        <h1 style={{ fontSize: "clamp(28px,6vw,40px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Fearless</h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "var(--text-tertiary)", marginBottom: "36px", textTransform: "uppercase" }}>Your Transformation Starts Here</p>
        <p style={{ fontFamily: "'Newsreader', serif", fontSize: "clamp(16px,2.5vw,19px)", color: "var(--text-secondary)", maxWidth: "460px", lineHeight: 1.7, marginBottom: "40px" }}>
          The next few minutes will be the most honest conversation you've had with yourself in a long time. There are no wrong answers — only real ones.
        </p>
        <button onClick={() => setStage("questions")} style={{ fontSize: "15px", fontWeight: 600, padding: "14px 40px", borderRadius: "12px", border: "none", cursor: "pointer", background: "var(--accent)", color: "#fff", boxShadow: "0 2px 12px rgba(99,102,241,0.3)", transition: "0.2s" }}>
          I'm Ready to Begin
        </button>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)", marginTop: "20px" }}>6 questions · ~3 minutes</p>
      </div>
    );
  }

  const q = QUESTIONS[qi];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", maxWidth: "520px", margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "0.45s" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>{qi + 1} / {QUESTIONS.length}</p>
      <h2 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", lineHeight: 1.4, marginBottom: "32px" }}>{q.text}</h2>

      {q.type === "choice" && <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => { setSelected(i); setTimeout(() => handleAnswer(opt.value), 350); }} style={{
            fontFamily: "'Newsreader', serif", fontSize: "15px", padding: "16px 18px", borderRadius: "12px",
            border: `1.5px solid ${selected === i ? "var(--accent)" : "var(--border)"}`,
            background: selected === i ? "var(--accent-soft)" : "var(--bg-card)",
            color: selected === i ? "var(--accent-text)" : "var(--text-secondary)",
            cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", fontWeight: selected === i ? 600 : 400,
          }}>
            {opt.text}
          </button>
        ))}
      </div>}

      {q.type === "scale" && <div style={{ width: "100%", maxWidth: "440px" }}>
        <input type="range" min="0" max="4" value={scaleVal} onChange={e => setScaleVal(Number(e.target.value))} style={{ width: "100%", height: "6px", borderRadius: "3px", background: `linear-gradient(90deg, var(--accent) ${scaleVal*25}%, var(--border) ${scaleVal*25}%)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
          {q.labels.map((l, i) => <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: scaleVal === i ? "var(--text-primary)" : "var(--text-muted)", fontWeight: scaleVal === i ? 600 : 400, textAlign: "center", maxWidth: "60px", transition: "0.2s" }}>{l}</span>)}
        </div>
        <button onClick={() => handleAnswer(scaleVal)} style={{ fontSize: "14px", fontWeight: 600, padding: "12px 36px", borderRadius: "12px", border: "none", cursor: "pointer", background: "var(--accent)", color: "#fff", display: "block", margin: "28px auto 0" }}>Continue</button>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════
//  TODAY TAB
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
  const pct = Math.min(((profile.xp || 0) / getXpForNextLevel(profile.level || 1)) * 100, 100);

  const earnXp = async (amount) => {
    setXt(amount);
    setTimeout(() => setXt(null), 1800);
    await addXp(user.uid, amount);
    refreshProfile();
  };

  const inputStyle = {
    width: "100%", fontFamily: "'Newsreader', serif", fontSize: "14px",
    padding: "12px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
    background: "var(--bg-secondary)", color: "var(--text-primary)", resize: "none", outline: "none",
    boxSizing: "border-box", lineHeight: 1.6, transition: "border 0.2s",
  };

  if (!content) return <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "40px" }}>Loading...</p>;

  return (
    <div>
      {/* XP Toast */}
      {xpToast && <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "10px 24px", borderRadius: "10px", background: "var(--accent)", fontSize: "13px", fontWeight: 700, color: "#fff", boxShadow: "var(--shadow-lg)", animation: "fadeSlideIn 0.3s ease" }}>+{xpToast} XP earned</div>}

      {/* Header */}
      <AnimIn delay={60}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "4px" }}>DAY {day} OF 84</p>
            <h1 style={{ fontSize: "clamp(20px,5vw,26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Welcome back, {profile.name}</h1>
            <Badge text={p.title} color={p.color} style={{ marginTop: "6px", display: "inline-block" }} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Card style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <IconFlame size={16} color="var(--orange)" />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--orange)" }}>{profile.streak || 0}</span>
            </Card>
            <Card style={{ padding: "10px 14px", minWidth: "80px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-muted)" }}>LVL {profile.level || 1}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-text)" }}>{profile.xp || 0}</span>
              </div>
              <div style={{ width: "100%", height: "3px", borderRadius: "2px", background: "var(--border)" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: "2px", background: "var(--accent)", transition: "width 0.5s" }} />
              </div>
            </Card>
          </div>
        </div>
      </AnimIn>

      {/* Phase tracker */}
      <AnimIn delay={100}>
        <Card style={{ marginBottom: "14px", padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {[{ n: "Awareness", c: "var(--accent)" }, { n: "Rewiring", c: "var(--teal)" }, { n: "Proving", c: "var(--orange)" }, { n: "Identity", c: "var(--red)" }].map((ph, i) => {
              const active = i === (profile.phase || 1) - 1, past = i < (profile.phase || 1) - 1;
              return <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: "100%", height: "3px", borderRadius: "2px", marginBottom: "6px", background: past ? ph.c : active ? `linear-gradient(90deg, ${ph.c} 60%, var(--border) 60%)` : "var(--border)", transition: "0.3s" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: active ? ph.c : past ? "var(--text-secondary)" : "var(--text-muted)", fontWeight: active ? 600 : 400 }}>{ph.n}</span>
              </div>;
            })}
          </div>
        </Card>
      </AnimIn>

      {/* Coach Note */}
      {content.coach && <AnimIn delay={140}>
        <Card onClick={() => setCo(!coachOpen)} style={{ marginBottom: "14px", cursor: "pointer", borderColor: coachOpen ? "var(--accent)" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconTarget size={16} color="var(--accent)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Coach's Note</p>
              {!coachOpen && <p style={{ fontFamily: "'Newsreader', serif", fontSize: "13px", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{content.coach.slice(0, 60)}...</p>}
            </div>
            <IconChevron size={16} color="var(--text-muted)" direction={coachOpen ? "up" : "down"} />
          </div>
          {coachOpen && <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginTop: "12px", paddingLeft: "42px" }}>{content.coach}</p>}
        </Card>
      </AnimIn>}

      {/* Prescriptions */}
      <AnimIn delay={180}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Today's Prescriptions</h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>{content.prescriptions?.length || 0} items</p>
        </div>
      </AnimIn>

      {content.prescriptions?.map((rx, i) => {
        const done = completed[i];
        const [open, setOpen] = useState(false);
        const TypeIcon = typeIconMap[rx.type] || IconZap;
        return (
          <AnimIn key={i} delay={220 + i * 40}>
            <Card style={{ marginBottom: "8px", opacity: done ? 0.55 : 1, borderColor: done ? "var(--green)" : undefined, padding: "0", overflow: "hidden" }}>
              <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: `color-mix(in srgb, ${typeColorMap[rx.type] || "var(--accent)"} 10%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TypeIcon size={16} color={typeColorMap[rx.type] || "var(--accent)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "3px", flexWrap: "wrap", alignItems: "center" }}>
                    <Badge text={rx.label} color={typeColorMap[rx.type] || "var(--accent)"} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>{rx.time}</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: done ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none", lineHeight: 1.35 }}>{rx.title}</p>
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{rx.source} · {rx.duration}</p>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--accent-text)", opacity: 0.6, flexShrink: 0 }}>+{rx.xp}</span>
              </div>
              {open && <div style={{ padding: "0 16px 14px", marginLeft: "48px" }}>
                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", marginBottom: "10px" }}>
                  <Label text="Prescription" color={typeColorMap[rx.type] || "var(--accent)"} style={{ marginBottom: "4px" }} />
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{rx.dosage}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {rx.url && rx.url !== "#" && <a href={rx.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", background: "var(--accent)", color: "#fff", textDecoration: "none" }}>Open</a>}
                  {!done && <button onClick={(e) => { e.stopPropagation(); setCompleted(p => ({...p, [i]: true})); earnXp(rx.xp); }} style={{ fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", border: "1.5px solid var(--green)", background: "var(--green-soft)", color: "var(--green)", cursor: "pointer" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconCheck size={14} /> Done</span>
                  </button>}
                </div>
              </div>}
            </Card>
          </AnimIn>
        );
      })}

      {/* Challenge */}
      {content.challenge && <AnimIn delay={380}>
        <Card style={{ marginTop: "8px", marginBottom: "14px", borderColor: challengeDone ? "var(--green)" : "var(--orange)", borderWidth: challengeDone ? "1px" : "1.5px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconZap size={16} color="var(--orange)" />
              <Label text="Today's Mission" color="var(--orange)" style={{ marginBottom: 0 }} />
            </div>
            <Badge text={content.challenge.difficulty} color={content.challenge.difficulty === "Easy" ? "var(--green)" : content.challenge.difficulty === "Medium" ? "var(--orange)" : "var(--red)"} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: challengeDone ? "var(--text-tertiary)" : "var(--text-primary)", marginBottom: "8px" }}>{challengeDone ? "✓ " : ""}{content.challenge.title}</h3>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>{content.challenge.desc}</p>
          <div style={{ padding: "8px 10px", borderRadius: "8px", background: "var(--bg-secondary)", marginBottom: "12px" }}>
            <Label text="Tip" color="var(--teal)" style={{ marginBottom: "2px" }} />
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>{content.challenge.tip}</p>
          </div>
          {!challengeDone && !showReport && <button onClick={() => setSr(true)} style={{ fontSize: "13px", fontWeight: 600, padding: "10px 22px", borderRadius: "10px", border: "none", cursor: "pointer", background: "var(--orange)", color: "#fff" }}>I Did It — Report</button>}
          {showReport && !challengeDone && <div>
            <textarea value={reportText} onChange={e => setRt(e.target.value)} placeholder="How did it feel?" rows={2} style={inputStyle} />
            <button onClick={async () => { setCd(true); setSr(false); await earnXp(content.challenge.xp); }} disabled={!reportText.trim()} style={{ fontSize: "12px", fontWeight: 600, padding: "10px 22px", borderRadius: "10px", border: "none", cursor: "pointer", marginTop: "8px", background: reportText.trim() ? "var(--green)" : "var(--border)", color: reportText.trim() ? "#fff" : "var(--text-muted)" }}>Submit</button>
          </div>}
          {challengeDone && <p style={{ fontFamily: "'Newsreader', serif", fontSize: "13px", color: "var(--green)", fontStyle: "italic" }}>Mission complete. +{content.challenge.xp} XP</p>}
        </Card>
      </AnimIn>}

      {/* Journal */}
      {content.journal && <AnimIn delay={440}>
        <Card style={{ marginBottom: "14px", borderColor: journalDone ? "var(--green)" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <IconTarget size={16} color="var(--purple)" />
            <Label text="Reflection" color="var(--purple)" style={{ marginBottom: 0 }} />
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "15px", fontStyle: "italic", color: journalDone ? "var(--text-muted)" : "var(--text-secondary)", lineHeight: 1.55, marginBottom: "12px" }}>"{content.journal.prompt}"</p>
          {!journalDone && !showJournal && <button onClick={() => setSj(true)} style={{ fontSize: "12px", fontWeight: 600, padding: "8px 18px", borderRadius: "8px", border: "1.5px solid var(--purple)", background: "var(--purple-soft)", color: "var(--purple)", cursor: "pointer" }}>Write</button>}
          {showJournal && !journalDone && <div>
            <textarea value={journalText} onChange={e => setJtx(e.target.value)} placeholder="Be honest with yourself..." rows={3} style={{ ...inputStyle, borderColor: "var(--purple)" }} />
            <button onClick={async () => { if (journalText.trim()) { setJd(true); setSj(false); await saveJournalEntry(user.uid, day, journalText, content.journal.prompt); await earnXp(content.journal.xp); } }} disabled={!journalText.trim()} style={{ fontSize: "12px", fontWeight: 600, padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "8px", background: journalText.trim() ? "var(--purple)" : "var(--border)", color: journalText.trim() ? "#fff" : "var(--text-muted)" }}>Save</button>
          </div>}
          {journalDone && <p style={{ fontFamily: "'Newsreader', serif", fontSize: "13px", color: "var(--purple)", fontStyle: "italic" }}>Saved. +{content.journal.xp} XP</p>}
        </Card>
      </AnimIn>}
    </div>
  );
}

// ═══════════════════════════════════
//  COACH TAB (with persistence)
// ═══════════════════════════════════
function CoachTab({ profile }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Load saved messages on mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const saved = await getCoachMessages(user.uid);
        if (saved && saved.length > 0) {
          setMsgs(saved.map(m => ({ role: m.role, text: m.text })));
        } else {
          setMsgs([{ role: "coach", text: `Hey ${profile.name}. I'm here. What's on your mind today?` }]);
        }
      } catch (e) {
        setMsgs([{ role: "coach", text: `Hey ${profile.name}. I'm here. What's on your mind today?` }]);
      }
      setLoading(false);
    }
    if (user) loadMessages();
  }, [user]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs, typing]);

  const PROMPTS = [
    { text: "I'm struggling today", e: "😔" },
    { text: "I skipped yesterday", e: "😕" },
    { text: "I feel progress!", e: "💪" },
    { text: "I want to quit", e: "🏳️" },
    { text: "Today scares me", e: "😰" },
  ];

  const send = async (text) => {
    const userMsg = { role: "user", text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setTyping(true);

    // Save user message to Firestore
    await saveCoachMessage(user.uid, "user", text);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs, userProfile: profile }),
      });
      const data = await res.json();
      const coachMsg = { role: "coach", text: data.response };
      setMsgs(prev => [...prev, coachMsg]);

      // Save coach response to Firestore
      await saveCoachMessage(user.uid, "coach", data.response);
    } catch {
      const errMsg = { role: "coach", text: "I'm having a moment — try again." };
      setMsgs(prev => [...prev, errMsg]);
    }
    setTyping(false);
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}><p style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>Loading conversation...</p></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: "400px" }}>
      {/* Coach header */}
      <Card style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconTarget size={18} color="var(--accent)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Fearless Coach</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>AI-powered · Knows your journey</p>
        </div>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", boxShadow: `0 0 6px var(--green)` }} />
      </Card>

      {/* Messages */}
      <div ref={ref} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "8px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeSlideIn 0.3s ease" }}>
            <div style={{
              maxWidth: "82%", padding: "12px 16px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "var(--coach-user)" : "var(--coach-bot)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", lineHeight: 1.6, color: m.role === "user" ? "#fff" : "var(--text-secondary)" }}>{m.text}</p>
            </div>
          </div>
        ))}
        {typing && <div style={{ display: "flex" }}><div style={{ padding: "12px 18px", borderRadius: "14px 14px 14px 4px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", gap: "5px" }}>{[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: `typingDot 1.2s ${i*0.15}s infinite` }} />)}</div></div>}
      </div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", padding: "6px 0" }}>
        {PROMPTS.map((p, i) => <button key={i} onClick={() => send(p.text)} style={{ fontSize: "11px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, transition: "0.15s" }}>{p.e} {p.text}</button>)}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { send(input.trim()); setInput(""); }}} placeholder="Talk to your coach..." style={{ flex: 1, fontSize: "14px", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
        <button onClick={() => { if (input.trim()) { send(input.trim()); setInput(""); }}} style={{ width: "44px", height: "44px", borderRadius: "10px", border: "none", cursor: "pointer", background: input.trim() ? "var(--accent)" : "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}>
          <IconSend size={16} color={input.trim() ? "#fff" : "var(--text-muted)"} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  PROGRESS TAB
// ═══════════════════════════════════
function ProgressTab({ profile }) {
  const score = Math.min(Math.round((profile.currentDay / 84) * 100), 100);
  const p = PROFILES[profile.profile] || PROFILES.timidity;

  return (
    <div>
      <AnimIn delay={60}>
        <Card style={{ marginBottom: "14px", textAlign: "center", padding: "28px 20px", background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <div style={{ fontSize: "44px", fontWeight: 800, color: "var(--accent-text)", marginBottom: "4px" }}>{score}%</div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "15px", color: "var(--text-secondary)" }}>Transformation Progress</p>
          <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--border)", marginTop: "16px" }}>
            <div style={{ width: `${score}%`, height: "100%", borderRadius: "3px", background: "var(--accent)", transition: "1s" }} />
          </div>
        </Card>
      </AnimIn>

      <AnimIn delay={140}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "14px" }}>
          {[
            { l: "Current Day", v: `${profile.currentDay || 0}/84`, c: "var(--accent-text)", icon: <IconTarget size={18} color="var(--accent)" /> },
            { l: "Streak", v: `${profile.streak || 0} days`, c: "var(--orange)", icon: <IconFlame size={18} color="var(--orange)" /> },
            { l: "Level", v: profile.level || 1, c: "var(--teal)", icon: <IconShield size={18} color="var(--teal)" /> },
            { l: "Total XP", v: (profile.xp || 0).toLocaleString(), c: "var(--purple)", icon: <IconZap size={18} color="var(--purple)" /> },
          ].map((s, i) => (
            <Card key={i} style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ marginBottom: "6px" }}>{s.icon}</div>
              <p style={{ fontSize: "20px", fontWeight: 800, color: s.c }}>{s.v}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{s.l}</p>
            </Card>
          ))}
        </div>
      </AnimIn>

      <AnimIn delay={220}>
        <Card style={{ marginBottom: "14px" }}>
          <Label text="Your Profile" color="var(--accent-text)" />
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `color-mix(in srgb, ${p.color} 12%, transparent)`, border: `1.5px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconShield size={22} color={p.color} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</h3>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: "13px", color: "var(--text-tertiary)", marginTop: "2px" }}>{p.root}</p>
            </div>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.65, marginTop: "12px" }}>{p.description}</p>
        </Card>
      </AnimIn>

      <AnimIn delay={300}>
        <Card>
          <Label text="Phase Progress" color="var(--teal)" />
          {[
            { n: "Awareness", c: "var(--accent)", days: 14, start: 0 },
            { n: "Rewiring", c: "var(--teal)", days: 28, start: 14 },
            { n: "Proving", c: "var(--orange)", days: 28, start: 42 },
            { n: "Identity Lock", c: "var(--red)", days: 14, start: 70 },
          ].map((ph, i) => {
            const pct = Math.min(Math.max(((profile.currentDay - ph.start) / ph.days) * 100, 0), 100);
            return <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: pct > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{ph.n}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: pct >= 100 ? "var(--green)" : pct > 0 ? ph.c : "var(--text-muted)", fontWeight: 600 }}>{pct >= 100 ? "✓" : `${Math.round(pct)}%`}</span>
              </div>
              <div style={{ width: "100%", height: "5px", borderRadius: "3px", background: "var(--border)" }}>
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
//  SETTINGS TAB
// ═══════════════════════════════════
function SettingsTab({ profile }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const p = PROFILES[profile.profile] || PROFILES.timidity;

  const handleLogout = async () => { await logout(); router.push("/auth/login"); };

  function Toggle({ on, onToggle }) {
    return (
      <div onClick={onToggle} style={{ width: "44px", height: "26px", borderRadius: "13px", background: on ? "var(--accent)" : "var(--border)", cursor: "pointer", position: "relative", transition: "0.3s", flexShrink: 0 }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: on ? "21px" : "3px", transition: "0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
    );
  }

  function Row({ label, desc, children }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{label}</p>
          {desc && <p style={{ fontFamily: "'Newsreader', serif", fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{desc}</p>}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div>
      {/* Profile card */}
      <AnimIn delay={60}>
        <Card style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `color-mix(in srgb, ${p.color} 12%, transparent)`, border: `1.5px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconShield size={26} color={p.color} />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{profile.name}</h2>
              <Badge text={p.title} color={p.color} />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{profile.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            {[{ l: "Level", v: profile.level || 1, c: "var(--accent-text)" }, { l: "Day", v: `${profile.currentDay || 0}/84`, c: "var(--teal)" }, { l: "Streak", v: profile.streak || 0, c: "var(--orange)" }, { l: "XP", v: (profile.xp || 0).toLocaleString(), c: "var(--purple)" }].map((s, i) => <div key={i}><p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1px" }}>{s.l}</p><p style={{ fontSize: "14px", fontWeight: 700, color: s.c }}>{s.v}</p></div>)}
          </div>
        </Card>
      </AnimIn>

      {/* Appearance */}
      <AnimIn delay={120}>
        <Card style={{ marginBottom: "14px" }}>
          <Label text="Appearance" color="var(--accent-text)" />
          <Row label="Theme" desc={theme === "dark" ? "Dark mode is active" : "Light mode is active"}>
            <div onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px 14px", borderRadius: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              {theme === "dark" ? <IconMoon size={16} color="var(--text-secondary)" /> : <IconSun size={16} color="var(--orange)" />}
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>{theme === "dark" ? "Dark" : "Light"}</span>
            </div>
          </Row>
        </Card>
      </AnimIn>

      {/* Account */}
      <AnimIn delay={180}>
        <Card style={{ marginBottom: "14px" }}>
          <Label text="Account" color="var(--teal)" />
          <Row label="Fear Profile" desc={p.title}>
            <Badge text={`Phase ${profile.phase || 1}`} color="var(--accent-text)" />
          </Row>
          <Row label="Email" desc={profile.email} />
          <Row label="Current Day" desc={`Day ${profile.currentDay || 0} of 84`} />
          <Row label="Member Since" desc={profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : "—"} />
        </Card>
      </AnimIn>

      {/* Sign out */}
      <AnimIn delay={240}>
        <button onClick={handleLogout} style={{ width: "100%", fontSize: "14px", fontWeight: 600, padding: "14px", borderRadius: "12px", border: "1.5px solid var(--red)", background: "var(--red-soft)", color: "var(--red)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <IconLogout size={16} /> Sign Out
        </button>
      </AnimIn>

      <AnimIn delay={280}>
        <p style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "24px" }}>Fearless v1.0</p>
      </AnimIn>
    </div>
  );
}

// ═══════════════════════════════════
//  MAIN SHELL
// ═══════════════════════════════════
const TABS = [
  { key: "today", label: "Today" },
  { key: "coach", label: "Coach" },
  { key: "progress", label: "Progress" },
  { key: "settings", label: "Profile" },
];

const TAB_ICONS = {
  today: IconTarget,
  coach: IconTarget,
  progress: IconChart,
  settings: IconUser,
};

// Using imported icons for nav
import { IconChart as NavChart, IconUser as NavUser } from "@/components/icons";

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

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div style={{ textAlign: "center" }}>
        <IconShield size={36} color="var(--accent)" />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>Loading...</p>
      </div>
    </div>
  );

  if (!user || !profile) return null;
  if (!profile.diagnosticComplete) return <DiagnosticFlow user={user} onComplete={() => refreshProfile()} />;

  const navIcons = {
    today: <IconTarget size={20} />,
    coach: <IconTarget size={20} />,
    progress: <NavChart size={20} />,
    settings: <NavUser size={20} />,
  };

  return (
    <div style={{ minHeight: "100vh", maxHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "80px" }}>
          {tab === "today" && <TodayTab profile={profile} refreshProfile={refreshProfile} />}
          {tab === "coach" && <CoachTab profile={profile} />}
          {tab === "progress" && <ProgressTab profile={profile} />}
          {tab === "settings" && <SettingsTab profile={profile} refreshProfile={refreshProfile} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "6px 0 10px", flexShrink: 0,
        background: "var(--nav-bg)", backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              background: "none", border: "none", cursor: "pointer", padding: "6px 18px",
              borderRadius: "10px", transition: "0.2s",
            }}>
              <div style={{ color: active ? "var(--accent)" : "var(--text-muted)", transition: "0.2s" }}>
                {navIcons[t.key]}
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.3px",
                color: active ? "var(--accent-text)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400, transition: "0.2s",
              }}>
                {t.label}
              </span>
              {active && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent)", marginTop: "1px" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
