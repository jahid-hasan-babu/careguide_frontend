"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ShieldAlert, KeyRound } from "lucide-react";
import { authApi } from "../../../api/auth.api";
import { useAppDispatch } from "../../../redux/hooks";
import { showToast } from "../../../redux/slices/toastSlice";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [email] = useState(searchParams?.get("email") || "");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.verifyResetOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setResetToken(res.data.resetToken);
      dispatch(showToast({ message: "Reset code verified! Enter your new password.", type: "success" }));
    } catch (err: any) {
      setError(err.message || "Invalid or expired reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.resetPassword({
        resetToken,
        newPassword,
      });
      dispatch(showToast({ message: "Password updated successfully! Please sign in.", type: "success" }));
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldAlert size={24} />
          </div>
          <h1>Set New Password</h1>
          <p>{!resetToken ? "Step 1: Enter your reset code" : "Step 2: Choose a secure password"}</p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        {!resetToken ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Reset Code (OTP)</label>
              <input
                type="text"
                className="form-control"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                required
                style={{
                  fontSize: "1.3rem",
                  letterSpacing: "0.3em",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={loading || otp.length < 4}
            >
              {loading ? <span className="spinner" /> : "Verify Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
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
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <KeyRound
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
                  <span>Save New Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Back to <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
