import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postsApi } from "../../api/posts.api";
import { ICreatePostPayload, IPaginationMeta, IPost } from "../../types";

export interface PostsState {
  posts: IPost[];
  meta: IPaginationMeta;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  loading: false,
  submitting: false,
  error: null,
};

export const fetchPosts = createAsyncThunk<
  { data: IPost[]; meta?: IPaginationMeta },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("posts/fetchPosts", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const response = await postsApi.getAllPosts(page, limit);
    return { data: response.data, meta: response.meta };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load posts");
  }
});

export const createPost = createAsyncThunk<
  IPost,
  ICreatePostPayload,
  { rejectValue: string }
>("posts/createPost", async (payload, { rejectWithValue }) => {
  try {
    const response = await postsApi.createPost(payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to publish post");
  }
});

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts
    builder.addCase(fetchPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload.data;
      if (action.payload.meta) {
        const m = action.payload.meta as any;
        const total = m.total ?? action.payload.data.length;
        const limit = m.limit || state.meta.limit || 10;
        const totalPages = m.totalPages || m.totalPage || Math.max(1, Math.ceil(total / limit));
        state.meta = {
          page: m.page || 1,
          limit,
          total,
          totalPages,
        };
      } else {
        state.meta.total = action.payload.data.length;
        state.meta.totalPages = Math.max(1, Math.ceil(action.payload.data.length / state.meta.limit));
      }
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to load posts";
    });

    // Create Post
    builder.addCase(createPost.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.submitting = false;
      state.posts.unshift(action.payload);
      state.meta.total += 1;
      state.meta.totalPages = Math.max(1, Math.ceil(state.meta.total / state.meta.limit));
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || "Failed to publish post";
    });
  },
});

export const { clearPostsError } = postsSlice.actions;
export default postsSlice.reducer;
