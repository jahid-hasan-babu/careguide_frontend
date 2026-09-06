import { apiClient } from "./client";
import {
  ICreateUserPayload,
  IInterestsGroup,
  IUpdateUserPayload,
  IUser,
  IUserWithPosts,
} from "../types";

export const usersApi = {
  getMyProfile: () => {
    return apiClient<IUser>("/users/me", {
      method: "GET",
    });
  },

  updateMyProfile: (payload: { fullName?: string; interests?: string[] }) => {
    return apiClient<IUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getAllUsers: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ) => {
    return apiClient<IUser[]>("/users", {
      method: "GET",
      params: { page, limit, search, role },
    });
  },

  getUserById: (id: string) => {
    return apiClient<IUser>(`/users/${id}`, {
      method: "GET",
    });
  },

  createUser: (payload: ICreateUserPayload) => {
    return apiClient<IUser>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser: (id: string, payload: IUpdateUserPayload) => {
    return apiClient<IUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteUser: (id: string) => {
    return apiClient<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  getUsersGroupedByInterests: () => {
    return apiClient<IInterestsGroup[]>("/users/interests", {
      method: "GET",
    });
  },

  getUserWithPosts: (id: string) => {
    return apiClient<IUserWithPosts>(`/users/${id}/posts`, {
      method: "GET",
    });
  },
};
