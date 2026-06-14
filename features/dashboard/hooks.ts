import { useEffect, useState } from "react";
import { getImages } from "@/features/archive/imageService";
import { getCollections } from "@/features/archive/collectionService";
import { getHistory, type AIJob } from "@/features/history/historyService";

export function useDashboardStats() {
  const [imageCount, setImageCount]           = useState<number | null>(null);
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [recentJobs, setRecentJobs]           = useState<AIJob[]>([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getImages().catch(() => []),
      getCollections().catch(() => []),
      getHistory().catch(() => ({ aiJobs: [], transactions: [], aiJobsTotal: 0, aiJobsPage: 1, aiJobsLimit: 10, aiJobsTotalPages: 1 })),
    ]).then(([imgs, cols, hist]) => {
      if (cancelled) return;
      setImageCount(imgs.length);
      setCollectionCount(cols.length);
      setRecentJobs(hist.aiJobs.slice(0, 6));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { imageCount, collectionCount, recentJobs, loading };
}
