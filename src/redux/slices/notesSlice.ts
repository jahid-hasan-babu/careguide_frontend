import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notesApi } from "../../api/notes.api";
import { ICreateNotePayload, INote, IPaginationMeta, IUpdateNotePayload } from "../../types";

export interface NotesState {
  notes: INote[];
  meta: IPaginationMeta;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
  loading: false,
  submitting: false,
  error: null,
};

export const fetchNotes = createAsyncThunk<
  { data: INote[]; meta?: IPaginationMeta },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>("notes/fetchNotes", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const response = await notesApi.getNotes(page, limit);
    return { data: response.data, meta: response.meta };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load notes");
  }
});

export const createNote = createAsyncThunk<
  INote,
  ICreateNotePayload,
  { rejectValue: string }
>("notes/createNote", async (payload, { rejectWithValue }) => {
  try {
    const response = await notesApi.createNote(payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to create note");
  }
});

export const updateNote = createAsyncThunk<
  INote,
  { id: string; payload: IUpdateNotePayload },
  { rejectValue: string }
>("notes/updateNote", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await notesApi.updateNote(id, payload);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update note");
  }
});

export const deleteNote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notes/deleteNote", async (id, { rejectWithValue }) => {
  try {
    await notesApi.deleteNote(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete note");
  }
});

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearNotesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notes
    builder.addCase(fetchNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.loading = false;
      state.notes = action.payload.data;
      if (action.payload.meta) {
        state.meta = action.payload.meta;
      }
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to load notes";
    });

    // Create Note
    builder.addCase(createNote.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(createNote.fulfilled, (state, action) => {
      state.submitting = false;
      state.notes.unshift(action.payload);
      state.meta.total += 1;
    });
    builder.addCase(createNote.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || "Failed to create note";
    });

    // Update Note
    builder.addCase(updateNote.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(updateNote.fulfilled, (state, action) => {
      state.submitting = false;
      const index = state.notes.findIndex((n) => n._id === action.payload._id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    });
    builder.addCase(updateNote.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || "Failed to update note";
    });

    // Delete Note
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
      state.meta.total = Math.max(0, state.meta.total - 1);
    });
  },
});

export const { clearNotesError } = notesSlice.actions;
export default notesSlice.reducer;
