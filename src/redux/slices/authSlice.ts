import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api";
import { usersApi } from "../../api/users.api";
import {
  clearStoredTokens,
  getStoredToken,
  setStoredToken,
} from "../../api/client";
import {
  IAuthResponse,
  ILoginPayload,
  IRegisterPayload,
  IRegisterResponse,
  IUser,
  IVerifyOtpPayload,
} from "../../types";

export interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  initialized: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  IAuthResponse,
  ILoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.login(payload);
    if (response.data?.accessToken) {
      setStoredToken(response.data.accessToken);
      if (response.data.refreshToken && typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to sign in");
  }
});

export const registerUser = createAsyncThunk<
  IRegisterResponse,
  IRegisterPayload,
  { rejectValue: string }
>("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.register(payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Registration failed");
  }
});

export const verifyOtp = createAsyncThunk<
  IAuthResponse,
  IVerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyOtp(payload);
    if (response.data?.accessToken) {
      setStoredToken(response.data.accessToken);
      if (response.data.refreshToken && typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "OTP verification failed");
  }
});

export const fetchMyProfile = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>("auth/fetchMyProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await usersApi.getMyProfile();
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (err: any) {
    clearStoredTokens();
    return rejectWithValue(err.message || "Failed to fetch profile");
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logoutUser",
  async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors
    } finally {
      clearStoredTokens();
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeFromStorage: (state) => {
      const token = getStoredToken();
      state.token = token;
      if (typeof window !== "undefined") {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          try {
            state.user = JSON.parse(cachedUser);
          } catch {
            state.user = null;
          }
        }
      }
      state.initialized = true;
    },
    updateProfileLocally: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.accessToken;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Registration failed";
    });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.accessToken;
      state.error = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Verification failed";
    });

    // Fetch Profile
    builder.addCase(fetchMyProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMyProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchMyProfile.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    });
  },
});

export const { initializeFromStorage, updateProfileLocally, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;
