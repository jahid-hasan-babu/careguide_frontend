import React from "react";
import { Calendar, User, Edit2, Trash2 } from "lucide-react";
import { INote } from "../../types";

interface NoteCardProps {
  note: INote;
  isAdmin: boolean;
  onEdit: (note: INote) => void;
  onDelete: (note: INote) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const authorName =
    typeof note.userId === "object" && note.userId !== null
      ? note.userId.fullName
      : null;

  const authorEmail =
    typeof note.userId === "object" && note.userId !== null
      ? note.userId.email
      : null;

  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="note-card animate-fade">
      <div className="note-card-header">
        <h4 className="note-card-title">{note.title}</h4>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onEdit(note)}
            title="Edit Note"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onDelete(note)}
            title="Delete Note"
            style={{ color: "var(--accent-rose)" }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="note-card-body">{note.content}</div>

      <div className="note-card-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Calendar size={13} />
          <span>{formattedDate}</span>
        </div>

        {isAdmin && authorName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "rgba(255,255,255,0.05)",
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-sm)",
            }}
            title={authorEmail || ""}
          >
            <User size={12} color="var(--primary)" />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {authorName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
