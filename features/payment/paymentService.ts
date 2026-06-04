import { apiFetch } from '@/lib/apiFetch';

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credit_amount: number;
  bonus_credit: number;
  sort_order: number;
}

export interface CreatePaymentResult {
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
  orderCode: number;
  transactionId: string;
}

export async function getPackages(): Promise<CreditPackage[]> {
  const res = await apiFetch('/api/payments/packages');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể tải danh sách gói');
  return json.data as CreditPackage[];
}

export async function createPaymentLink(packageId: string): Promise<CreatePaymentResult> {
  const res = await apiFetch('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể tạo link thanh toán');
  return json.data as CreatePaymentResult;
}

export async function getPaymentInfo(orderCode: string | number) {
  const res = await apiFetch(`/api/payments/${orderCode}`);
  const json = await res.json();
  return json;
}
