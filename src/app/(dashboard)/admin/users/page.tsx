"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../../redux/slices/usersSlice";
import { showToast } from "../../../../redux/slices/toastSlice";
import { ICreateUserPayload, IUpdateUserPayload, IUser } from "../../../../types";
import { UserModal } from "../../../../components/users/UserModal";
import { DeleteConfirmModal } from "../../../../components/common/DeleteConfirmModal";

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { users, meta, loading } = useAppSelector((state) => state.users);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";

  const loadUsers = useCallback(
    (page: number = 1, pageLimit: number = limit) => {
      setCurrentPage(page);
      dispatch(
        fetchUsers({
          page,
          limit: pageLimit,
          search: search.trim() || undefined,
          role: roleFilter || undefined,
        })
      );
    },
    [dispatch, search, roleFilter, limit]
  );

  useEffect(() => {
    if (isAdmin) {
      loadUsers(1, limit);
    }
  }, [isAdmin, loadUsers, limit]);

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
        <ShieldAlert size={48} color="var(--accent-rose)" style={{ marginBottom: "1rem" }} />
        <h2>Access Restricted</h2>
        <p>You must have ADMIN privileges to manage users.</p>
      </div>
    );
  }

  const handleCreateOrUpdate = async (data: ICreateUserPayload | IUpdateUserPayload) => {
    if (editingUser) {
      const result = await dispatch(
        updateUser({ id: editingUser._id, payload: data as IUpdateUserPayload })
      );
      if (updateUser.fulfilled.match(result)) {
        dispatch(showToast({ message: "User account updated successfully", type: "success" }));
      }
    } else {
      const result = await dispatch(createUser(data as ICreateUserPayload));
      if (createUser.fulfilled.match(result)) {
        dispatch(showToast({ message: "New user account created successfully", type: "success" }));
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    const result = await dispatch(deleteUser(deletingUser._id));
    if (deleteUser.fulfilled.match(result)) {
      dispatch(showToast({ message: "User account soft-deleted", type: "success" }));
    }
  };

  const totalCount = meta?.total ?? users.length;
  const currentLimit = meta?.limit || limit;
  const totalPages = Math.max(1, meta?.totalPages || Math.ceil(totalCount / currentLimit));
  const activePage = meta?.page || currentPage;
  const startIndex = totalCount === 0 ? 0 : (activePage - 1) * currentLimit + 1;
  const endIndex = Math.min(activePage * currentLimit, totalCount);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (activePage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (activePage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px - 4rem)" }}>
      <div style={{ flex: 1 }}>
        <div className="page-header">
        <div className="page-title-group">
          <h1>User Account Management</h1>
          <p>Admin Control Panel: Create, monitor, and configure role authorizations.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Query Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, maxWidth: 500 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadUsers(1);
              }}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
            />
          </div>

          <select
            className="form-control"
            style={{ width: "150px" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Total registered users: <strong>{meta.total}</strong>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Interests</th>
              <th>Joined Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner" style={{ width: 28, height: 28 }} />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No users found matching query criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div className="user-avatar-circle">
                        {u.fullName ? u.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.fullName}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span>
                  </td>
                  <td>
                    {u.isVerified ? (
                      <span className="badge badge-verified" style={{ gap: "0.2rem" }}>
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", maxWidth: 220 }}>
                      {u.interests && u.interests.length > 0 ? (
                        u.interests.slice(0, 3).map((item) => (
                          <span key={item} className="badge badge-interest">
                            {item}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>None</span>
                      )}
                      {u.interests && u.interests.length > 3 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          +{u.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.3rem" }}>
                      <Link
                        href={`/posts?userId=${u._id}`}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Inspect User Posts via $lookup Aggregation"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => {
                          setEditingUser(u);
                          setIsModalOpen(true);
                        }}
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeletingUser(u)}
                        title="Delete User"
                        style={{ color: "var(--accent-rose)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="pagination pagination-fixed">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div className="pagination-info">
              Showing <strong>{startIndex} - {endIndex}</strong> of <strong>{totalCount}</strong> users
              <span style={{ marginLeft: "0.5rem", color: "var(--text-secondary)" }}>
                (Page {activePage} of {totalPages})
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <span>Per page:</span>
              <select
                className="form-control"
                style={{ width: "68px", padding: "0.2rem 0.4rem", fontSize: "0.82rem" }}
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  loadUsers(1, newLimit);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="pagination-controls" style={{ alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={activePage <= 1 || loading}
              onClick={() => loadUsers(activePage - 1, limit)}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} style={{ padding: "0 0.3rem", color: "var(--text-muted)" }}>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  className={`btn btn-sm ${p === activePage ? "btn-primary" : "btn-secondary"}`}
                  style={{ minWidth: 32, padding: "0.35rem 0.65rem", fontWeight: p === activePage ? 700 : 500 }}
                  disabled={loading}
                  onClick={() => loadUsers(Number(p), limit)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-secondary btn-sm"
              disabled={activePage >= totalPages || loading}
              onClick={() => loadUsers(activePage + 1, limit)}
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingUser}
      />

      {/* User Delete Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Soft Delete User Account"
        description={`Are you sure you want to deactivate and soft-delete user account "${deletingUser?.fullName}" (${deletingUser?.email})?`}
      />
    </div>
  );
}
