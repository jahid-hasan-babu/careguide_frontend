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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [deletingNote, setDeletingNote] = useState<INote | null>(null);

  const loadNotes = useCallback(
    (page: number = 1) => {
      dispatch(fetchNotes({ page, limit: 12 }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadNotes(1);
  }, [loadNotes]);

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

  return (
    <div>
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

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="pagination" style={{ marginTop: "2rem" }}>
          <div className="pagination-info">
            Page {meta.page} of {meta.totalPages} (Total {meta.total} records)
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-sm"
              disabled={meta.page <= 1 || loading}
              onClick={() => loadNotes(meta.page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={meta.page >= meta.totalPages || loading}
              onClick={() => loadNotes(meta.page + 1)}
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
