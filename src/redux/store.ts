import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import notesReducer from "./slices/notesSlice";
import usersReducer from "./slices/usersSlice";
import postsReducer from "./slices/postsSlice";
import toastReducer from "./slices/toastSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      users: usersReducer,
      posts: postsReducer,
      toast: toastReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
