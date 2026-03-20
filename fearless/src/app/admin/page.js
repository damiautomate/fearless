"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { isAdmin, ADMIN_EMAIL, getAdminStats, getAllUsers, getAllContent, saveContentDay, deleteContentDay, resetUserProgress, updateUserField, getUserJournal, seedContentToFirestore } from "@/lib/admin";
import { getDayContent } from "@/lib/content";

// ─── Styles ───
const S = {
  page: { minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "24px 20px" },
  h1: { fontSize: "24px", fontWeight: 800, marginBottom: "4px" },
  sub: { fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "1px" },
  card: { borderRadius: "12px", padding: "18px", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "12px" },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" },
  input: { width: "100%", fontSize: "14px", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  textarea: { width: "100%", fontSize: "13px", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "'Newsreader', serif", lineHeight: 1.6, minHeight: "60px" },
  btn: { fontSize: "13px", fontWeight: 600, padding: "9px 18px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "0.2s" },
  btnPrimary: { background: "var(--accent)", color: "#fff" },
  btnDanger: { background: "var(--red)", color: "#fff" },
  btnSecondary: { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
  btnSmall: { fontSize: "11px", padding: "6px 12px", borderRadius: "6px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" },
  td: { padding: "10px 12px", borderBottom: "1px solid var(--border)", verticalAlign: "top" },
  badge: (color) => ({ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: `color-mix(in srgb, ${color} 12%, transparent)`, color }),
};

// ─── Tab Navigation ───
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "24px", padding: "4px", borderRadius: "12px", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          ...S.btn, flex: 1, background: active === t.key ? "var(--accent)" : "transparent",
          color: active === t.key ? "#fff" : "var(--text-tertiary)",
          fontWeight: active === t.key ? 700 : 500,
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, color = "var(--accent-text)" }) {
  return (
    <div style={S.card}>
      <p style={{ ...S.label, color: "var(--text-muted)" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

// ═══════════════════════════════════
//  DASHBOARD TAB
// ═══════════════════════════════════
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading stats...</p>;
  if (!stats) return <p style={{ color: "var(--red)" }}>Failed to load stats</p>;

  const phaseNames = { 1: "Awareness", 2: "Rewiring", 3: "Proving", 4: "Identity Lock" };
  const phaseColors = { 1: "var(--accent)", 2: "var(--teal)", 3: "var(--orange)", 4: "var(--red)" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <StatCard label="Total Users" value={stats.total} color="var(--accent-text)" />
        <StatCard label="Completed Diagnostic" value={stats.withDiagnostic} color="var(--teal)" />
        <StatCard label="Active This Week" value={stats.activeThisWeek} color="var(--green)" />
        <StatCard label="Avg XP" value={stats.avgXp} color="var(--purple)" />
        <StatCard label="Avg Day" value={stats.avgDay} color="var(--orange)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={S.card}>
          <p style={{ ...S.label, color: "var(--accent-text)" }}>Users by Phase</p>
          {Object.entries(stats.phases).map(([phase, count]) => (
            <div key={phase} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{phaseNames[phase]}</span>
              <span style={S.badge(phaseColors[phase])}>{count}</span>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <p style={{ ...S.label, color: "var(--teal)" }}>Users by Profile</p>
          {Object.entries(stats.profiles).map(([profile, count]) => (
            <div key={profile} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{profile.replace(/_/g, " ")}</span>
              <span style={S.badge("var(--purple)")}>{count}</span>
            </div>
          ))}
          {Object.keys(stats.profiles).length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>No profiles yet</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  CONTENT MANAGEMENT TAB
// ═══════════════════════════════════
function ContentTab() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState(null);

  const loadContent = async () => {
    setLoading(true);
    const data = await getAllContent();
    setDays(data);
    setLoading(false);
  };

  useEffect(() => { loadContent(); }, []);

  const handleSeed = async () => {
    if (!confirm("This will copy all 84 days of hardcoded content into Firestore. Existing Firestore content for those days will be overwritten. Continue?")) return;
    setSeeding(true);
    try {
      await seedContentToFirestore(getDayContent);
      setMessage({ type: "success", text: "All 84 days seeded to Firestore successfully!" });
      await loadContent();
    } catch (e) {
      setMessage({ type: "error", text: "Failed to seed: " + e.message });
    }
    setSeeding(false);
  };

  const handleEdit = (day) => {
    setEditingDay(day.day);
    setEditData(JSON.parse(JSON.stringify(day)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentDay(editingDay, editData);
      setMessage({ type: "success", text: `Day ${editingDay} saved successfully!` });
      setEditingDay(null);
      setEditData(null);
      await loadContent();
    } catch (e) {
      setMessage({ type: "error", text: "Failed to save: " + e.message });
    }
    setSaving(false);
  };

  const updatePrescription = (index, field, value) => {
    const updated = { ...editData };
    updated.prescriptions[index] = { ...updated.prescriptions[index], [field]: value };
    setEditData(updated);
  };

  const addPrescription = () => {
    const updated = { ...editData };
    updated.prescriptions = [...(updated.prescriptions || []), {
      type: "video", icon: "▶", label: "WATCH", title: "", source: "", platform: "YouTube",
      duration: "", dosage: "", time: "Morning", url: "", xp: 25, color: "#FF6B6B",
    }];
    setEditData(updated);
  };

  const removePrescription = (index) => {
    const updated = { ...editData };
    updated.prescriptions = updated.prescriptions.filter((_, i) => i !== index);
    setEditData(updated);
  };

  // Clear message after 4 seconds
  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); } }, [message]);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading content...</p>;

  // ─── Editing Mode ───
  if (editingDay && editData) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Editing Day {editingDay}</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { setEditingDay(null); setEditData(null); }} style={{ ...S.btn, ...S.btnSecondary }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...S.btn, ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>

        {/* Coach Note */}
        <div style={S.card}>
          <p style={{ ...S.label, color: "var(--accent-text)" }}>Coach Note</p>
          <textarea value={editData.coach || ""} onChange={e => setEditData({ ...editData, coach: e.target.value })} style={S.textarea} rows={3} />
        </div>

        {/* Prescriptions */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p style={{ ...S.label, color: "var(--teal)" }}>Prescriptions ({editData.prescriptions?.length || 0})</p>
            <button onClick={addPrescription} style={{ ...S.btn, ...S.btnSmall, ...S.btnPrimary }}>+ Add</button>
          </div>

          {editData.prescriptions?.map((rx, i) => (
            <div key={i} style={{ padding: "14px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "10px", background: "var(--bg-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-muted)" }}>Prescription {i + 1}</span>
                <button onClick={() => removePrescription(i)} style={{ ...S.btn, ...S.btnSmall, ...S.btnDanger }}>Remove</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Type</label>
                  <select value={rx.type || "video"} onChange={e => updatePrescription(i, "type", e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
                    <option value="video">Video</option>
                    <option value="book">Book</option>
                    <option value="audio">Podcast</option>
                    <option value="rest">Rest Day</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Label</label>
                  <input value={rx.label || ""} onChange={e => updatePrescription(i, "label", e.target.value)} style={S.input} placeholder="WATCH / READ / LISTEN" />
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Title</label>
                <input value={rx.title || ""} onChange={e => updatePrescription(i, "title", e.target.value)} style={S.input} placeholder="Video/book title" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Source</label>
                  <input value={rx.source || ""} onChange={e => updatePrescription(i, "source", e.target.value)} style={S.input} placeholder="Channel/Author name" />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Duration</label>
                  <input value={rx.duration || ""} onChange={e => updatePrescription(i, "duration", e.target.value)} style={S.input} placeholder="14 min / pp. 1-30" />
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>URL</label>
                <input value={rx.url || ""} onChange={e => updatePrescription(i, "url", e.target.value)} style={S.input} placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Dosage / Prescription Instructions</label>
                <textarea value={rx.dosage || ""} onChange={e => updatePrescription(i, "dosage", e.target.value)} style={S.textarea} rows={2} placeholder="How the user should consume this content..." />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Time of Day</label>
                  <select value={rx.time || "Morning"} onChange={e => updatePrescription(i, "time", e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>XP Reward</label>
                  <input type="number" value={rx.xp || 25} onChange={e => updatePrescription(i, "xp", Number(e.target.value))} style={S.input} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Platform</label>
                  <input value={rx.platform || ""} onChange={e => updatePrescription(i, "platform", e.target.value)} style={S.input} placeholder="YouTube / Book / Podcast" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Challenge */}
        <div style={S.card}>
          <p style={{ ...S.label, color: "var(--orange)" }}>Challenge / Mission</p>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Title</label>
            <input value={editData.challenge?.title || ""} onChange={e => setEditData({ ...editData, challenge: { ...editData.challenge, title: e.target.value } })} style={S.input} />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Description</label>
            <textarea value={editData.challenge?.desc || ""} onChange={e => setEditData({ ...editData, challenge: { ...editData.challenge, desc: e.target.value } })} style={S.textarea} rows={3} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Difficulty</label>
              <select value={editData.challenge?.difficulty || "Medium"} onChange={e => setEditData({ ...editData, challenge: { ...editData.challenge, difficulty: e.target.value } })} style={{ ...S.input, cursor: "pointer" }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>XP Reward</label>
              <input type="number" value={editData.challenge?.xp || 50} onChange={e => setEditData({ ...editData, challenge: { ...editData.challenge, xp: Number(e.target.value) } })} style={S.input} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Tip</label>
            <textarea value={editData.challenge?.tip || ""} onChange={e => setEditData({ ...editData, challenge: { ...editData.challenge, tip: e.target.value } })} style={S.textarea} rows={2} />
          </div>
        </div>

        {/* Journal */}
        <div style={S.card}>
          <p style={{ ...S.label, color: "var(--purple)" }}>Journal Prompt</p>
          <textarea value={editData.journal?.prompt || ""} onChange={e => setEditData({ ...editData, journal: { ...editData.journal, prompt: e.target.value } })} style={S.textarea} rows={2} />
          <div style={{ marginTop: "8px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>XP Reward</label>
            <input type="number" value={editData.journal?.xp || 20} onChange={e => setEditData({ ...editData, journal: { ...editData.journal, xp: Number(e.target.value) } })} style={{ ...S.input, width: "100px" }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── List Mode ───
  return (
    <div>
      {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: message.type === "success" ? "var(--green-soft)" : "var(--red-soft)", border: `1px solid ${message.type === "success" ? "var(--green)" : "var(--red)"}`, color: message.type === "success" ? "var(--green)" : "var(--red)", fontSize: "13px", fontWeight: 500 }}>{message.text}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          {days.length > 0 ? `${days.length} days in Firestore` : "No content in Firestore yet"}
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleSeed} disabled={seeding} style={{ ...S.btn, ...S.btnSecondary, opacity: seeding ? 0.6 : 1 }}>
            {seeding ? "Seeding..." : days.length > 0 ? "Re-seed from Code" : "Seed All 84 Days to Firestore"}
          </button>
        </div>
      </div>

      {days.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>No content in Firestore yet</p>
          <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginBottom: "16px" }}>Click "Seed All 84 Days" to copy your hardcoded content into Firestore. After that, you can edit everything here.</p>
        </div>
      )}

      {days.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Day</th>
                <th style={S.th}>Phase</th>
                <th style={S.th}>Prescriptions</th>
                <th style={S.th}>Challenge</th>
                <th style={S.th}>Journal</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const phase = day.day <= 14 ? "Awareness" : day.day <= 42 ? "Rewiring" : day.day <= 70 ? "Proving" : "Identity";
                const phaseColor = day.day <= 14 ? "var(--accent)" : day.day <= 42 ? "var(--teal)" : day.day <= 70 ? "var(--orange)" : "var(--red)";
                return (
                  <tr key={day.day} style={{ cursor: "pointer" }} onClick={() => handleEdit(day)}>
                    <td style={S.td}><span style={{ fontWeight: 700 }}>Day {day.day}</span></td>
                    <td style={S.td}><span style={S.badge(phaseColor)}>{phase}</span></td>
                    <td style={S.td}>{day.prescriptions?.length || 0} items</td>
                    <td style={S.td}>{day.challenge?.title ? <span style={{ fontSize: "12px" }}>{day.challenge.title.slice(0, 30)}...</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                    <td style={S.td}>{day.journal?.prompt ? "✓" : "—"}</td>
                    <td style={S.td}><button onClick={(e) => { e.stopPropagation(); handleEdit(day); }} style={{ ...S.btn, ...S.btnSmall, ...S.btnPrimary }}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
//  USER MANAGEMENT TAB
// ═══════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [journal, setJournal] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); } }, [message]);

  const handleReset = async (uid, name) => {
    if (!confirm(`Reset ALL progress for ${name}? This will set their XP to 0, level to 1, and restart the program. This cannot be undone.`)) return;
    await resetUserProgress(uid);
    setMessage({ type: "success", text: `${name}'s progress has been reset.` });
    const updated = await getAllUsers();
    setUsers(updated);
  };

  const viewJournal = async (user) => {
    setSelectedUser(user);
    const entries = await getUserJournal(user.id);
    setJournal(entries);
  };

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading users...</p>;

  // ─── User Detail View ───
  if (selectedUser) {
    return (
      <div>
        <button onClick={() => { setSelectedUser(null); setJournal([]); }} style={{ ...S.btn, ...S.btnSecondary, marginBottom: "16px" }}>← Back to Users</button>

        <div style={S.card}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>{selectedUser.name}</h2>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "12px" }}>{selectedUser.email}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            {[
              { l: "Profile", v: selectedUser.profileTitle || "Not set", c: "var(--accent-text)" },
              { l: "Day", v: `${selectedUser.currentDay || 0}/84`, c: "var(--teal)" },
              { l: "Phase", v: selectedUser.phase || 0, c: "var(--orange)" },
              { l: "XP", v: selectedUser.xp || 0, c: "var(--purple)" },
              { l: "Level", v: selectedUser.level || 1, c: "var(--accent-text)" },
              { l: "Streak", v: selectedUser.streak || 0, c: "var(--orange)" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "var(--bg-secondary)" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1px" }}>{s.l}</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Journal Entries */}
        <div style={{ ...S.card, marginTop: "12px" }}>
          <p style={{ ...S.label, color: "var(--purple)" }}>Journal Entries ({journal.length})</p>
          {journal.length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No journal entries yet</p>}
          {journal.map((entry, i) => (
            <div key={i} style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-secondary)", marginBottom: "8px" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Day {entry.day} · {entry.prompt?.slice(0, 50)}...
              </p>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Users List ───
  return (
    <div>
      {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: "var(--green-soft)", border: "1px solid var(--green)", color: "var(--green)", fontSize: "13px" }}>{message.text}</div>}

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>{users.length} total users</p>

      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Profile</th>
              <th style={S.th}>Day</th>
              <th style={S.th}>XP</th>
              <th style={S.th}>Level</th>
              <th style={S.th}>Streak</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={S.td}><span style={{ fontWeight: 600 }}>{u.name || "—"}</span></td>
                <td style={S.td}><span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{u.email}</span></td>
                <td style={S.td}>{u.profileTitle ? <span style={S.badge("var(--accent)")}>{u.profileTitle}</span> : "—"}</td>
                <td style={S.td}>{u.currentDay || 0}/84</td>
                <td style={S.td}>{u.xp || 0}</td>
                <td style={S.td}>{u.level || 1}</td>
                <td style={S.td}>{u.streak || 0}</td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => viewJournal(u)} style={{ ...S.btn, ...S.btnSmall, ...S.btnSecondary }}>View</button>
                    <button onClick={() => handleReset(u.id, u.name)} style={{ ...S.btn, ...S.btnSmall, ...S.btnDanger }}>Reset</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  MAIN ADMIN PAGE
// ═══════════════════════════════════
export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (!isAdmin(user.email)) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) return <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><p style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>Loading admin...</p></div>;

  if (!user || !isAdmin(user.email)) return null;

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "content", label: "Content" },
    { key: "users", label: "Users" },
  ];

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={S.h1}>Fearless Admin</h1>
            <p style={S.sub}>MANAGE CONTENT · USERS · ANALYTICS</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push("/dashboard")} style={{ ...S.btn, ...S.btnSecondary }}>← Back to App</button>
          </div>
        </div>

        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === "dashboard" && <DashboardTab />}
        {tab === "content" && <ContentTab />}
        {tab === "users" && <UsersTab />}
      </div>
    </div>
  );
}
