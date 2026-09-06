"use client";

import { useEffect, useState } from "react";
import { PieChart, Search, ShieldAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { fetchInterestsGroups } from "../../../../redux/slices/usersSlice";

export default function AdminInterestsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { interestsGroups, aggregationLoading } = useAppSelector((state) => state.users);

  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchInterestsGroups());
    }
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
        <ShieldAlert size={48} color="var(--accent-rose)" style={{ marginBottom: "1rem" }} />
        <h2>Access Restricted</h2>
        <p>You must have ADMIN privileges to view aggregation reports.</p>
      </div>
    );
  }

  const filteredGroups = interestsGroups.filter((g) =>
    g.interest.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Users Grouped by Interests</h1>
          <p>Technical Interview Showcase: MongoDB Aggregation Pipeline (Scenario 1)</p>
        </div>
      </div>

      {/* Technical Pipeline Blueprint */}
      <div className="aggregation-banner" style={{ flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="aggregation-badge">MongoDB Aggregation Pipeline</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Endpoint: <code>GET /api/v1/users/interests</code>
          </span>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
          <strong>Constraint Fulfilled:</strong> Executed using strictly one single <code>User.aggregate()</code> call:
        </p>

        <div className="code-preview" style={{ width: "100%" }}>
          {`User.aggregate([
  { $match: { isDeleted: false } },
  { $unwind: "$interests" },
  { $group: {
      _id: "$interests",
      users: { $push: { _id: "$_id", fullName: "$fullName", email: "$email" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $project: { interest: "$_id", users: 1, count: 1, _id: 0 } }
])`}
        </div>
      </div>

      {/* Filter and stats */}
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
        <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Filter by interest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem" }}>
          <div>
            Clusters Found: <strong>{interestsGroups.length}</strong>
          </div>
        </div>
      </div>

      {/* Aggregation Clusters Grid */}
      {aggregationLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <PieChart size={36} color="var(--text-muted)" style={{ marginBottom: "0.75rem" }} />
          <h3>No Interest Clusters Formed</h3>
          <p style={{ marginTop: "0.25rem" }}>
            Assign interests (e.g. &quot;Coding&quot;, &quot;Reading&quot;, &quot;Chess&quot;) to users to generate groupings.
          </p>
        </div>
      ) : (
        <div className="interest-clusters">
          {filteredGroups.map((cluster) => (
            <div key={cluster.interest} className="interest-card animate-fade">
              <div className="interest-card-header">
                <div>
                  <h3 style={{ fontSize: "1.1rem", textTransform: "capitalize" }}>
                    {cluster.interest}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Aggregated Interest Category
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {cluster.count} {cluster.count === 1 ? "User" : "Users"}
                </div>
              </div>

              <div className="interest-users-list">
                {cluster.users.map((member) => (
                  <div key={member._id} className="user-chip">
                    <div className="user-avatar-circle" style={{ width: 26, height: 26 }}>
                      {member.fullName ? member.fullName[0].toUpperCase() : "U"}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {member.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {member.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
