"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "An account with this email already exists" : err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    width: "100%", fontFamily: "var(--serif)", fontSize: "15px",
    padding: "14px 18px", borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
    color: "#fff", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔓</div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Begin Your Transformation</h1>
          <p style={{ fontFamily: "var(--serif)", fontSize: "15px", color: "rgba(255,255,255,0.35)" }}>Create your free account to start</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)", marginBottom: "20px" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "#FF6B6B" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "6px" }}>YOUR NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="What should we call you?" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "6px" }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "1.5px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "6px" }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 6 characters" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", fontFamily: "var(--sans)", fontSize: "15px", fontWeight: 600,
            padding: "16px", borderRadius: "14px", border: "none", cursor: loading ? "default" : "pointer",
            background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", color: "#fff",
            boxShadow: "0 4px 20px rgba(108,99,255,0.3)", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Creating account..." : "Start My Journey →"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        <button onClick={handleGoogle} style={{
          width: "100%", fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500,
          padding: "14px", borderRadius: "14px", cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "16px" }}>G</span> Sign up with Google
        </button>

        <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "rgba(255,255,255,0.25)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#6C63FF", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
