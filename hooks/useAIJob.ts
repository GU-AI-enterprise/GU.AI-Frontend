"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNotifications, type AIJobUpdatePayload } from "@/contexts/NotificationContext";
import { getJobStatus } from "@/features/studio/studioService";

const POLL_INTERVAL_MS = 4_000;

export type AIJobState = "idle" | "processing" | "completed" | "failed";

export interface UseAIJobReturn {
  /** Current state of the tracked job */
  state: AIJobState;
  /** Output image URL — set when state === 'completed' */
  imageUrl: string | null;
  /** Error message — set when state === 'failed' */
  error: string | null;
  /** true while Fashn is still processing */
  isProcessing: boolean;
  /** Reset back to idle (clear result) */
  reset: () => void;
}

/**
 * Tracks an async AI job by subscribing to Socket.IO `ai_job_update` events
 * and falling back to polling GET /api/ai/jobs/:jobId every 4 seconds.
 *
 * Pass `null` to keep the hook idle.
 */
export function useAIJob(jobId: string | null): UseAIJobReturn {
  const { subscribeAIJob, unsubscribeAIJob } = useNotifications();

  const [state, setState] = useState<AIJobState>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleUpdate = useCallback(
    (payload: AIJobUpdatePayload) => {
      stopPolling();
      if (payload.status === "completed") {
        setState("completed");
        setImageUrl(payload.imageUrl ?? null);
      } else {
        setState("failed");
        setError(payload.error ?? "Tác vụ AI thất bại.");
      }
    },
    [stopPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setState("idle");
    setImageUrl(null);
    setError(null);
  }, [stopPolling]);

  useEffect(() => {
    if (!jobId) {
      reset();
      return;
    }

    setState("processing");
    setImageUrl(null);
    setError(null);

    // Primary: Socket.IO push
    subscribeAIJob(jobId, handleUpdate);

    // Fallback: poll every 4 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const result = await getJobStatus(jobId);
        if (result.status === "completed" || result.status === "failed") {
          handleUpdate({
            jobId: result.jobId,
            status: result.status,
            error: result.error ?? undefined,
          });
        }
      } catch {
        // Ignore transient poll errors
      }
    }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
      unsubscribeAIJob(jobId);
    };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    imageUrl,
    error,
    isProcessing: state === "processing",
    reset,
  };
}
