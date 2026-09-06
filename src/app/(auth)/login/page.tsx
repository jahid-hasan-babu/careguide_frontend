"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { loginUser, fetchMyProfile } from "../../../redux/slices/authSlice";
import { showToast } from "../../../redux/slices/toastSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      loginUser({ email: email.trim().toLowerCase(), password })
    );

    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchMyProfile());
      dispatch(showToast({ message: "Signed in successfully", type: "success" }));
      router.push("/notes");
    } else {
      const err = result.payload as string;
      if (err && err.includes("not verified")) {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
      }
    }
  };

  const handleQuickLogin = (role: "admin" | "user") => {
    if (role === "admin") {
      setEmail("admin@gmail.com");
      setPassword("123456");
    } else {
      setEmail("jahid@mailto.plus");
      setPassword("123456");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your secure workspace</p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem" }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper for Recruiter / Reviewer */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.85rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.78rem",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
            Reviewer Demo Access:
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => handleQuickLogin("admin")}
            >
              Fill Super Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => handleQuickLogin("user")}
            >
              Fill Test User
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
