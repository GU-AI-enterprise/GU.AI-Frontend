import { apiFetch } from '@/lib/apiFetch';

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credit_amount: number;
  bonus_credit: number;
  sort_order: number;
  grants_plan_type?: string | null;
}

export interface TopupInfo {
  plan_type: 'free' | 'basic' | 'pro';
  plan_expires_at: string | null;
  discount_pct: number;
  base_rate: number;
  rate: number;
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

export async function getTopupInfo(): Promise<TopupInfo> {
  const res = await apiFetch('/api/payments/topup-info');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể tải thông tin top-up');
  return json.data as TopupInfo;
}

/** Top-up: buy exactly `creditAmount` credits at the user's plan-discounted rate */
export async function createTopupPayment(creditAmount: number): Promise<CreatePaymentResult> {
  const res = await apiFetch('/api/payments/topup', {
    method: 'POST',
    body: JSON.stringify({ creditAmount }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể tạo link thanh toán top-up');
  return json.data as CreatePaymentResult;
}

export async function getPaymentInfo(orderCode: string | number) {
  const res = await apiFetch(`/api/payments/${orderCode}`);
  const json = await res.json();
  return json;
}
