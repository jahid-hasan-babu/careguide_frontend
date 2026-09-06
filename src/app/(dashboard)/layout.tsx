"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Users,
  PieChart,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logoutUser } from "../../redux/slices/authSlice";
import { showToast } from "../../redux/slices/toastSlice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, initialized, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && !token) {
      router.replace("/login");
    }
  }, [initialized, token, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(showToast({ message: "Signed out successfully", type: "info" }));
    router.replace("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  if (!initialized || (loading && !user)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
        }}
      >
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="auth-logo" style={{ width: 36, height: 36, margin: 0 }}>
            <FileText size={20} />
          </div>
          <div>
            <span>SecureNotes</span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Enterprise RBAC Platform
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Workspace</div>
          <Link
            href="/notes"
            className={`nav-link ${pathname === "/notes" ? "active" : ""}`}
          >
            <FileText size={18} />
            <span>{isAdmin ? "All Notes" : "My Notes"}</span>
          </Link>

          <Link
            href="/posts"
            className={`nav-link ${pathname === "/posts" ? "active" : ""}`}
          >
            <MessageSquare size={18} />
            <span>Community Posts</span>
          </Link>

          <Link
            href="/profile"
            className={`nav-link ${pathname === "/profile" ? "active" : ""}`}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>

          {isAdmin && (
            <>
              <div className="nav-section-title" style={{ marginTop: "1rem" }}>
                Admin Operations
              </div>
              <Link
                href="/admin/users"
                className={`nav-link ${pathname === "/admin/users" ? "active" : ""}`}
              >
                <Users size={18} />
                <span>User Management</span>
              </Link>

              <Link
                href="/admin/interests"
                className={`nav-link ${pathname === "/admin/interests" ? "active" : ""}`}
              >
                <PieChart size={18} />
                <span>Interest Clusters</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Card at bottom */}
        <div className="sidebar-user">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
            <div className="user-avatar-circle">
              {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.fullName || "User"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span className={`badge badge-${user?.role?.toLowerCase() || "user"}`}>
                  {user?.role}
                </span>
                {user?.isVerified && (
                  <span title="Email Verified" style={{ display: "flex", alignItems: "center" }}>
                    <ShieldCheck size={14} color="#10b981" />
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            title="Sign Out"
            style={{ padding: "0.4rem" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Next.js & Redux Toolkit State Architecture Active
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Session: <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
