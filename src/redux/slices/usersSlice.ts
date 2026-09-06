import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "../../api/users.api";
import {
  ICreateUserPayload,
  IInterestsGroup,
  IPaginationMeta,
  IUpdateUserPayload,
  IUser,
  IUserWithPosts,
} from "../../types";

export interface UsersState {
  users: IUser[];
  meta: IPaginationMeta;
  interestsGroups: IInterestsGroup[];
  userWithPosts: IUserWithPosts | null;
  loading: boolean;
  aggregationLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
  interestsGroups: [],
  userWithPosts: null,
  loading: false,
  aggregationLoading: false,
  submitting: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  { data: IUser[]; meta?: IPaginationMeta },
  { page?: number; limit?: number; search?: string; role?: string } | undefined,
  { rejectValue: string }
>("users/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const response = await usersApi.getAllUsers(page, limit, params?.search, params?.role);
    return { data: response.data, meta: response.meta };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load users");
  }
});

export const fetchInterestsGroups = createAsyncThunk<
  IInterestsGroup[],
  void,
  { rejectValue: string }
>("users/fetchInterestsGroups", async (_, { rejectWithValue }) => {
  try {
    const response = await usersApi.getUsersGroupedByInterests();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load interest clusters");
  }
});

export const fetchUserWithPosts = createAsyncThunk<
  IUserWithPosts,
  string,
  { rejectValue: string }
>("users/fetchUserWithPosts", async (id, { rejectWithValue }) => {
  try {
    const response = await usersApi.getUserWithPosts(id);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load user posts");
  }
});

export const createUser = createAsyncThunk<
  IUser,
  ICreateUserPayload,
  { rejectValue: string }
>("users/createUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await usersApi.createUser(payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to create user");
  }
});

export const updateUser = createAsyncThunk<
  IUser,
  { id: string; payload: IUpdateUserPayload },
  { rejectValue: string }
>("users/updateUser", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await usersApi.updateUser(id, payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update user");
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await usersApi.deleteUser(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete user");
  }
});

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    clearSelectedUserPosts: (state) => {
      state.userWithPosts = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload.data;
      if (action.payload.meta) {
        state.meta = action.payload.meta;
      }
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to load users";
    });

    // Interests Groups (Aggregation 1)
    builder.addCase(fetchInterestsGroups.pending, (state) => {
      state.aggregationLoading = true;
      state.error = null;
    });
    builder.addCase(fetchInterestsGroups.fulfilled, (state, action) => {
      state.aggregationLoading = false;
      state.interestsGroups = action.payload;
    });
    builder.addCase(fetchInterestsGroups.rejected, (state, action) => {
      state.aggregationLoading = false;
      state.error = action.payload || "Failed to load interest clusters";
    });

    // User With Posts (Aggregation 2)
    builder.addCase(fetchUserWithPosts.pending, (state) => {
      state.aggregationLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserWithPosts.fulfilled, (state, action) => {
      state.aggregationLoading = false;
      state.userWithPosts = action.payload;
    });
    builder.addCase(fetchUserWithPosts.rejected, (state, action) => {
      state.aggregationLoading = false;
      state.error = action.payload || "Failed to load user with posts";
    });

    // Create User
    builder.addCase(createUser.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.submitting = false;
      state.users.unshift(action.payload);
      state.meta.total += 1;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || "Failed to create user";
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.submitting = false;
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || "Failed to update user";
    });

    // Delete User
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
      state.meta.total = Math.max(0, state.meta.total - 1);
    });
  },
});

export const { clearUsersError, clearSelectedUserPosts } = usersSlice.actions;
export default usersSlice.reducer;
