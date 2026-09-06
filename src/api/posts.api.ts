import { apiClient } from "./client";
import { ICreatePostPayload, IPost } from "../types";

export const postsApi = {
  getAllPosts: (page: number = 1, limit: number = 10) => {
    return apiClient<IPost[]>("/posts", {
      method: "GET",
      params: { page, limit },
      skipAuth: true,
    });
  },

  createPost: (payload: ICreatePostPayload) => {
    return apiClient<IPost>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
