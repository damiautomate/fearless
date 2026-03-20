"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  // Loading state
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔓</div>
        <p style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: 700, color: "#fff" }}>Fearless</p>
        <p style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "8px", letterSpacing: "2px" }}>LOADING...</p>
      </div>
    </div>
  );
}
