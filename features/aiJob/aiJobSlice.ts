import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

const STORAGE_KEY = "guai_active_job";

export interface ActiveJob {
  jobId: string;
  status: "processing" | "completed" | "failed";
  tool: string;
  imageUrl: string | null;
  assetId: string | null;
  error: string | null;
  startedAt: string;
}

interface PendingLightbox {
  imageUrl: string;
  assetId?: string;
}

interface AIJobSliceState {
  activeJob: ActiveJob | null;
  pendingLightbox: PendingLightbox | null;
}

const initialState: AIJobSliceState = {
  activeJob: null,
  pendingLightbox: null,
};

const aiJobSlice = createSlice({
  name: "aiJob",
  initialState,
  reducers: {
    setActiveJob(state, action: PayloadAction<ActiveJob>) {
      state.activeJob = action.payload;
    },
    patchActiveJob(
      state,
      action: PayloadAction<{
        jobId: string;
        status: "completed" | "failed";
        imageUrl?: string;
        assetId?: string;
        error?: string;
      }>
    ) {
      if (!state.activeJob || state.activeJob.jobId !== action.payload.jobId) return;
      state.activeJob.status = action.payload.status;
      state.activeJob.imageUrl = action.payload.imageUrl ?? null;
      state.activeJob.assetId = action.payload.assetId ?? null;
      state.activeJob.error = action.payload.error ?? null;
    },
    clearActiveJob(state) {
      state.activeJob = null;
    },
    setPendingLightbox(state, action: PayloadAction<PendingLightbox>) {
      state.pendingLightbox = action.payload;
    },
    clearPendingLightbox(state) {
      state.pendingLightbox = null;
    },
  },
});

export const {
  setActiveJob,
  patchActiveJob,
  clearActiveJob,
  setPendingLightbox,
  clearPendingLightbox,
} = aiJobSlice.actions;

export const selectActiveJob = (state: RootState) => state.aiJob.activeJob;
export const selectPendingLightbox = (state: RootState) => state.aiJob.pendingLightbox;

// localStorage helpers (called outside reducers to keep reducers pure)
export function saveJobToStorage(job: ActiveJob) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
}

export function removeJobFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function loadJobFromStorage(): ActiveJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as ActiveJob;
    const age = Date.now() - new Date(job.startedAt).getTime();
    if (age > 3_600_000) { removeJobFromStorage(); return null; }
    return job;
  } catch {
    return null;
  }
}

export default aiJobSlice.reducer;
