"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ShieldCheck, ChevronLeft, ChevronRight, FileText, User, Layers } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../../../redux/slices/notesSlice";
import { showToast } from "../../../redux/slices/toastSlice";
import { INote } from "../../../types";
import { NoteCard } from "../../../components/notes/NoteCard";
import { NoteModal } from "../../../components/notes/NoteModal";
import { DeleteConfirmModal } from "../../../components/common/DeleteConfirmModal";

export default function NotesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notes, meta, loading } = useAppSelector((state) => state.notes);

  const isAdmin = user?.role === "ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [onlyMyNotes, setOnlyMyNotes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [deletingNote, setDeletingNote] = useState<INote | null>(null);

  const loadNotes = useCallback(
    (page: number = 1, pageLimit: number = limit) => {
      setCurrentPage(page);
      dispatch(fetchNotes({ page, limit: pageLimit }));
    },
    [dispatch, limit]
  );

  useEffect(() => {
    loadNotes(1, limit);
  }, [loadNotes, limit]);

  const handleCreateOrUpdate = async (payload: { title: string; content: string }) => {
    if (editingNote) {
      const result = await dispatch(
        updateNote({ id: editingNote._id, payload })
      );
      if (updateNote.fulfilled.match(result)) {
        dispatch(showToast({ message: "Note updated successfully", type: "success" }));
      }
    } else {
      const result = await dispatch(createNote(payload));
      if (createNote.fulfilled.match(result)) {
        dispatch(showToast({ message: "Note created successfully", type: "success" }));
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingNote) return;
    const result = await dispatch(deleteNote(deletingNote._id));
    if (deleteNote.fulfilled.match(result)) {
      dispatch(showToast({ message: "Note deleted successfully", type: "success" }));
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (isAdmin && onlyMyNotes && user) {
      const noteAuthorId =
        typeof n.userId === "object" && n.userId !== null
          ? n.userId._id
          : n.userId;
      const noteAuthorEmail =
        typeof n.userId === "object" && n.userId !== null
          ? n.userId.email
          : null;
      const isMine = Boolean(
        (user._id && noteAuthorId === user._id) ||
        (user.email && noteAuthorEmail === user.email)
      );
      if (!isMine) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const totalCount = onlyMyNotes ? filteredNotes.length : (meta?.total ?? notes.length);
  const currentLimit = meta?.limit || limit;
  const totalPages = Math.max(1, Math.ceil(totalCount / currentLimit));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = totalCount === 0 ? 0 : (activePage - 1) * currentLimit + 1;
  const endIndex = Math.min(activePage * currentLimit, totalCount);

  const displayedNotes = onlyMyNotes
    ? filteredNotes.slice((activePage - 1) * currentLimit, activePage * currentLimit)
    : filteredNotes;

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
            <h1>
              {isAdmin
                ? onlyMyNotes
                  ? "My Personal Notes (Admin Filter)"
                  : "System Note Repository (Admin Mode)"
                : "My Private Notes"}
            </h1>
            <p>
              {isAdmin
                ? onlyMyNotes
                  ? `Filtered view: Showing only notes authored by your admin account (${user?.fullName || "Admin"}).`
                  : "Full access view: Managing notes across all user accounts in the platform."
                : `Secure end-to-end notes for ${user?.fullName || "your account"}.`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {isAdmin && (
              <button
                className={`btn ${onlyMyNotes ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setOnlyMyNotes(!onlyMyNotes);
                  setCurrentPage(1);
                }}
                title={onlyMyNotes ? "Switch to viewing all system notes" : "Click to view only your own notes"}
              >
                <User size={16} />
                <span>{onlyMyNotes ? "Showing: Only My Notes" : "Only My Notes"}</span>
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingNote(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Index & Optimization Technical Notice */}
        <div className="aggregation-banner">
          <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: "0.85rem" }}>
            <strong>Query & Indexing Strategy: </strong>
            {isAdmin ? (
              <span>
                Admin list queries utilize the compound index <code>{`{ isDeleted: 1, createdAt: -1 }`}</code> with Mongoose author population.
              </span>
            ) : (
              <span>
                User queries are backed by compound indexes <code>{`{ userId: 1, createdAt: -1 }`}</code> and <code>{`{ _id: 1, userId: 1 }`}</code> for optimal tenant isolation.
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & Filter Toggle */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", flex: 1, maxWidth: 650 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>

            {isAdmin && (
              <div
                style={{
                  display: "inline-flex",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "0.2rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  type="button"
                  className={`btn btn-sm ${!onlyMyNotes ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => {
                    setOnlyMyNotes(false);
                    setCurrentPage(1);
                  }}
                  style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                >
                  <Layers size={13} />
                  <span>All Notes</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${onlyMyNotes ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => {
                    setOnlyMyNotes(true);
                    setCurrentPage(1);
                  }}
                  style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                >
                  <User size={13} />
                  <span>Only My Notes</span>
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Showing <strong>{displayedNotes.length}</strong> of <strong>{totalCount}</strong> notes
          </div>
        </div>

        {/* Notes Grid */}
        {loading && notes.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : displayedNotes.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-full)",
                background: "rgba(99, 102, 241, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                marginBottom: "1rem",
              }}
            >
              <FileText size={28} />
            </div>
            <h3>{onlyMyNotes ? "No personal notes found" : "No notes found"}</h3>
            <p style={{ maxWidth: 360, marginTop: "0.5rem" }}>
              {onlyMyNotes
                ? "You have not authored any personal notes yet with your admin account. Click below to create your first note."
                : searchQuery
                ? "No notes matched your search query."
                : "You have not created any notes yet. Click below to add your first note."}
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "1.25rem" }}
              onClick={() => {
                setEditingNote(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Create First Note</span>
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {displayedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isAdmin={isAdmin}
                onEdit={(n) => {
                  setEditingNote(n);
                  setIsModalOpen(true);
                }}
                onDelete={(n) => setDeletingNote(n)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="pagination pagination-fixed">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div className="pagination-info">
              Showing <strong>{startIndex} - {endIndex}</strong> of <strong>{totalCount}</strong> notes
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
                  loadNotes(1, newLimit);
                }}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          <div className="pagination-controls" style={{ alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={activePage <= 1 || loading}
              onClick={() => loadNotes(activePage - 1, limit)}
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
                  onClick={() => loadNotes(Number(p), limit)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-secondary btn-sm"
              disabled={activePage >= totalPages || loading}
              onClick={() => loadNotes(activePage + 1, limit)}
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingNote}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        description={`Are you sure you want to delete "${deletingNote?.title}"? This will be soft-deleted in the database.`}
      />
    </div>
  );
}
