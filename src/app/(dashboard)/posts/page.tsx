"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchPosts, createPost } from "../../../redux/slices/postsSlice";
import { fetchUsers, fetchUserWithPosts } from "../../../redux/slices/usersSlice";
import { showToast } from "../../../redux/slices/toastSlice";
import { ICreatePostPayload } from "../../../types";
import { CreatePostModal } from "../../../components/posts/CreatePostModal";

function PostsPageContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams?.get("userId") || "";

  const dispatch = useAppDispatch();
  const { posts, meta, loading } = useAppSelector((state) => state.posts);
  const { users, userWithPosts, aggregationLoading } = useAppSelector(
    (state) => state.users
  );

  const [activeTab, setActiveTab] = useState<"feed" | "lookup">(
    initialUserId ? "lookup" : "feed"
  );
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 10 }));
    dispatch(fetchUsers({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchUserWithPosts(selectedUserId));
    }
  }, [selectedUserId, dispatch]);

  const handleCreatePost = async (payload: ICreatePostPayload) => {
    const result = await dispatch(createPost(payload));
    if (createPost.fulfilled.match(result)) {
      dispatch(showToast({ message: "Post published successfully!", type: "success" }));
      dispatch(fetchPosts({ page: 1, limit: 10 }));
      if (selectedUserId) {
        dispatch(fetchUserWithPosts(selectedUserId));
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Community Posts & Aggregation Showcase</h1>
          <p>Public discussions feed and MongoDB $lookup cross-collection pipeline</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn ${activeTab === "feed" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("feed")}
        >
          <MessageSquare size={16} />
          <span>Public Community Feed</span>
        </button>

        <button
          className={`btn ${activeTab === "lookup" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("lookup")}
        >
          <Layers size={16} />
          <span>Scenario 2: $lookup User Posts Explorer</span>
        </button>
      </div>

      {activeTab === "feed" ? (
        <div>
          {loading && posts.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <MessageSquare size={36} color="var(--text-muted)" style={{ marginBottom: "0.75rem" }} />
              <h3>No community posts yet</h3>
              <p style={{ marginTop: "0.25rem" }}>Be the first to publish a discussion or architectural note!</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} />
                <span>Write Post</span>
              </button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => {
                const authorName =
                  typeof post.userId === "object" && post.userId !== null
                    ? post.userId.fullName
                    : "Community Member";

                return (
                  <div key={post._id} className="post-card animate-fade">
                    <div className="post-header">
                      <div className="user-avatar-circle" style={{ width: 32, height: 32 }}>
                        {authorName[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{authorName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <h3 className="post-title">{post.title}</h3>
                    <div className="post-content">{post.content}</div>
                  </div>
                );
              })}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="pagination" style={{ marginTop: "1rem" }}>
                  <div className="pagination-info">
                    Page {meta.page} of {meta.totalPages} (Total {meta.total} posts)
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={meta.page <= 1 || loading}
                      onClick={() => dispatch(fetchPosts({ page: meta.page - 1, limit: 10 }))}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={meta.page >= meta.totalPages || loading}
                      onClick={() => dispatch(fetchPosts({ page: meta.page + 1, limit: 10 }))}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Technical Aggregation Blueprint */}
          <div className="aggregation-banner" style={{ flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="aggregation-badge">MongoDB $lookup Pipeline</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Endpoint: <code>GET /api/v1/users/:id/posts</code>
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              <strong>Scenario 2 Requirement:</strong> Retrieve all posts belonging to a user using a single aggregation pipeline with a <code>$lookup</code> stage. Supported by index <code>postSchema.index({`{ userId: 1 }`})</code>.
            </p>

            <div className="code-preview" style={{ width: "100%" }}>
              {`User.aggregate([
  { $match: { _id: new Types.ObjectId(userId), isDeleted: false } },
  { $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      as: "posts"
    }
  },
  { $project: { password: 0 } }
])`}
            </div>
          </div>

          {/* User Selector */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Select User to Inspect Joined Posts:
            </label>
            <select
              className="form-control"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose User Account --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>

          {/* User With Posts Result Display */}
          {aggregationLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : userWithPosts ? (
            <div className="animate-fade">
              {/* Profile Card */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="user-avatar-circle" style={{ width: 44, height: 44, fontSize: "1.1rem" }}>
                    {userWithPosts.fullName ? userWithPosts.fullName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h2>{userWithPosts.fullName}</h2>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {userWithPosts.email} • <span className={`badge badge-${userWithPosts.role.toLowerCase()}`}>{userWithPosts.role}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Aggregated Posts Found: <strong>{userWithPosts.posts?.length || 0}</strong>
                </div>
              </div>

              {/* Aggregated Posts List */}
              <h3 style={{ marginBottom: "1rem" }}>Posts Retrieved via $lookup:</h3>
              {!userWithPosts.posts || userWithPosts.posts.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
                  <p>This user has not authored any posts yet.</p>
                </div>
              ) : (
                <div className="posts-list">
                  {userWithPosts.posts.map((p) => (
                    <div key={p._id} className="post-card">
                      <h4 className="post-title">{p.title}</h4>
                      <p className="post-content">{p.content}</p>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                        Published on {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p>Select a user from the dropdown above to run the <code>$lookup</code> aggregation pipeline.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      }
    >
      <PostsPageContent />
    </Suspense>
  );
}
