import { useCallback, useState } from "react";
import { getHistory, type AIJob, type Transaction } from "./historyService";

const PAGE_SIZE = 10;

export function useHistoryData() {
  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  const fetch = useCallback(async (page: number, dateFrom?: string, dateTo?: string, txPage = 1) => {
    setLoading(true);
    try {
      const data = await getHistory({
        jobPage: page,
        jobLimit: PAGE_SIZE,
        jobDateFrom: dateFrom || undefined,
        jobDateTo: dateTo || undefined,
        txPage,
        txLimit: PAGE_SIZE,
      });
      setAiJobs(data.aiJobs);
      setTotalPages(data.aiJobsTotalPages);
      setTotal(data.aiJobsTotal);
      setTransactions(data.transactions);
      setTxTotalPages(data.transactionsTotalPages);
      setTxTotal(data.transactionsTotal);
    } catch { } finally { setLoading(false); }
  }, []);

  return { aiJobs, transactions, loading, totalPages, total, txTotalPages, txTotal, fetch };
}
