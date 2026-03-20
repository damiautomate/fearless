"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError("Could not send reset email. Check the address and try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔑</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Reset Password</h1>
        
        {!sent ? (
          <>
            <p style={{ fontFamily: "var(--serif)", fontSize: "15px", color: "rgba(255,255,255,0.35)", marginBottom: "32px" }}>Enter your email and we'll send you a reset link</p>
            {error && <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)", marginBottom: "20px", textAlign: "left" }}><p style={{ fontFamily: "var(--serif)", fontSize: "13px", color: "#FF6B6B" }}>{error}</p></div>}
            <form onSubmit={handleSubmit}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" style={{ width: "100%", fontFamily: "var(--serif)", fontSize: "15px", padding: "14px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: "16px" }} />
              <button type="submit" style={{ width: "100%", fontFamily: "var(--sans)", fontSize: "15px", fontWeight: 600, padding: "16px", borderRadius: "14px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", color: "#fff" }}>Send Reset Link</button>
            </form>
          </>
        ) : (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
            <p style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>Check your inbox</p>
            <p style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "rgba(255,255,255,0.25)" }}>We sent a password reset link to <strong style={{ color: "#fff" }}>{email}</strong></p>
          </>
        )}
        
        <div style={{ marginTop: "32px" }}>
          <Link href="/auth/login" style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "#6C63FF", textDecoration: "none" }}>← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
