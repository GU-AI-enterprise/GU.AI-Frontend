import { useCallback, useState } from "react";
import { getHistory, type AIJob, type Transaction } from "./historyService";

const PAGE_SIZE = 10;

export function useHistoryData() {
  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (page: number, dateFrom?: string, dateTo?: string) => {
    setLoading(true);
    try {
      const data = await getHistory({
        jobPage: page,
        jobLimit: PAGE_SIZE,
        jobDateFrom: dateFrom || undefined,
        jobDateTo: dateTo || undefined,
      });
      setAiJobs(data.aiJobs);
      setTotalPages(data.aiJobsTotalPages);
      setTotal(data.aiJobsTotal);
      setTransactions(data.transactions);
    } catch { } finally { setLoading(false); }
  }, []);

  return { aiJobs, transactions, loading, totalPages, total, fetch };
}
