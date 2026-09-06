"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ShieldCheck, ChevronLeft, ChevronRight, FileText } from "lucide-react";
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

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = meta?.total ?? notes.length;
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
          <h1>{isAdmin ? "System Note Repository (Admin Mode)" : "My Private Notes"}</h1>
          <p>
            {isAdmin
              ? "Full access view: Managing notes across all user accounts in the platform."
              : `Secure end-to-end notes for ${user?.fullName || "your account"}.`}
          </p>
        </div>

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

      {/* Search Bar */}
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

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing <strong>{filteredNotes.length}</strong> of <strong>{meta.total}</strong> notes
        </div>
      </div>

      {/* Notes Grid */}
      {loading && notes.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filteredNotes.length === 0 ? (
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
          <h3>No notes found</h3>
          <p style={{ maxWidth: 360, marginTop: "0.5rem" }}>
            {searchQuery
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
          {filteredNotes.map((note) => (
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
