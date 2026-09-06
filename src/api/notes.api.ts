import { apiClient } from "./client";
import { ICreateNotePayload, INote, IUpdateNotePayload } from "../types";

export const notesApi = {
  getNotes: (page: number = 1, limit: number = 10) => {
    return apiClient<INote[]>("/notes", {
      method: "GET",
      params: { page, limit },
    });
  },

  getNoteById: (id: string) => {
    return apiClient<INote>(`/notes/${id}`, {
      method: "GET",
    });
  },

  createNote: (payload: ICreateNotePayload) => {
    return apiClient<INote>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateNote: (id: string, payload: IUpdateNotePayload) => {
    return apiClient<INote>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteNote: (id: string) => {
    return apiClient<{ message: string }>(`/notes/${id}`, {
      method: "DELETE",
    });
  },
};
