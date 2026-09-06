import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { ICreateUserPayload, IUpdateUserPayload, IUser, UserRole, UserStatus } from "../../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateUserPayload | IUpdateUserPayload) => Promise<void>;
  initialData?: IUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setEmail(initialData.email);
      setRole(initialData.role);
      setStatus(initialData.status);
      setInterests(initialData.interests || []);
      setPassword("");
    } else {
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setStatus("ACTIVE");
      setInterests([]);
    }
    setInterestInput("");
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
    try {
      setSubmitting(true);
      setError(null);

      if (initialData) {
        await onSubmit({
          fullName: fullName.trim(),
          interests,
          status,
        });
      } else {
        await onSubmit({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          interests,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "Edit User Account" : "Create New User"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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

          {!initialData && (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </>
          )}

          {initialData && (
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Interests & Specializations</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Algorithms, Security, Node.js"
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

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="spinner" />
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
