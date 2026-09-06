"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Plus, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { registerUser } from "../../../redux/slices/authSlice";
import { showToast } from "../../../redux/slices/toastSlice";
import { UserRole } from "../../../types";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [interests, setInterests] = useState<string[]>(["MongoDB", "Node.js"]);
  const [interestInput, setInterestInput] = useState("");

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;

    const result = await dispatch(
      registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        interests,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      dispatch(
        showToast({
          message: "Registration successful! Enter the OTP sent to your email.",
          type: "success",
        })
      );
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={24} />
          </div>
          <h1>Create Account</h1>
          <p>Register to start taking secure notes with RBAC</p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
              />
              <User
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-control"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Account Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="USER">USER (Standard RBAC)</option>
              <option value="ADMIN">ADMIN (Full RBAC + All Notes & Aggregations)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interests (Aggregated in Aggregation Scenario 1)</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type interest & press Add"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddInterest}
              >
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {interests.map((item) => (
                <span
                  key={item}
                  className="badge badge-interest"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  {item}
                  <X
                    size={13}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRemoveInterest(item)}
                  />
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
