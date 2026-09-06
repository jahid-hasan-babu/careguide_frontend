"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Key, Plus, X, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { updateProfileLocally } from "../../../redux/slices/authSlice";
import { showToast } from "../../../redux/slices/toastSlice";
import { usersApi } from "../../../api/users.api";
import { authApi } from "../../../api/auth.api";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [interestInput, setInterestInput] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setInterests(user.interests || []);
    }
  }, [user]);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await usersApi.updateMyProfile({
        fullName: fullName.trim(),
        interests,
      });
      dispatch(updateProfileLocally(res.data));
      dispatch(showToast({ message: "Profile updated successfully!", type: "success" }));
    } catch (err: any) {
      dispatch(showToast({ message: err.message || "Failed to update profile", type: "error" }));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError(null);
      await authApi.changePassword({ oldPassword, newPassword });
      dispatch(showToast({ message: "Password changed successfully!", type: "success" }));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Account Profile & Security</h1>
          <p>Manage your identity and authentication credentials</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div className="user-avatar-circle" style={{ width: 60, height: 60, fontSize: "1.5rem" }}>
            {user.fullName ? user.fullName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>{user.fullName}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.email}</span>
              <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
              {user.isVerified && (
                <span className="badge badge-verified" style={{ gap: "0.25rem" }}>
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-Only)</label>
            <input type="email" className="form-control" value={user.email} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Interests & Specializations</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Distributed Systems, Rust, Graph Databases"
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
            style={{ marginTop: "0.5rem" }}
            disabled={updatingProfile}
          >
            {updatingProfile ? (
              <span className="spinner" />
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <Key size={20} color="var(--primary)" />
          <h3>Security: Change Password</h3>
        </div>

        {passwordError && (
          <div className="form-error" style={{ marginBottom: "1rem" }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            style={{ marginTop: "0.5rem" }}
            disabled={changingPassword}
          >
            {changingPassword ? <span className="spinner" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
