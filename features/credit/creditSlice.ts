import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/apiFetch';
import type { RootState } from '@/store/store';

export type PlanType = 'free' | 'basic' | 'pro';

interface CreditState {
  balance: number | null;
  loading: boolean;
  planType: PlanType;
  planExpiresAt: string | null;
}

const initialState: CreditState = {
  balance: null,
  loading: false,
  planType: 'free',
  planExpiresAt: null,
};

export const fetchCredit = createAsyncThunk(
  'credit/fetch',
  async (_, { getState, rejectWithValue }) => {
    if (!(getState() as RootState).auth.session?.access_token) return rejectWithValue('No token');
    const res = await apiFetch('/api/users/profile');
    const json = await res.json();
    if (json.current_credit === undefined) return rejectWithValue('No credit field');
    return {
      balance: json.current_credit as number,
      planType: (json.plan_type ?? 'free') as PlanType,
      planExpiresAt: (json.plan_expires_at ?? null) as string | null,
    };
  },
  {
    // Only run when balance has never been loaded — socket keeps it fresh after that
    condition: (_, { getState }) => (getState() as RootState).credit.balance === null,
  }
);

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    adjustBalance(state, action: PayloadAction<number>) {
      if (state.balance !== null) state.balance = Math.max(0, state.balance + action.payload);
    },
    setPlanType(state, action: PayloadAction<PlanType>) {
      state.planType = action.payload;
    },
    setPlanExpiresAt(state, action: PayloadAction<string | null>) {
      state.planExpiresAt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredit.pending, (state) => { state.loading = true; })
      .addCase(fetchCredit.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.planType = action.payload.planType;
        state.planExpiresAt = action.payload.planExpiresAt;
        state.loading = false;
      })
      .addCase(fetchCredit.rejected, (state) => { state.loading = false; });
  },
});

export const { setBalance, adjustBalance, setPlanType, setPlanExpiresAt } = creditSlice.actions;
export const selectCreditBalance = (s: RootState) => s.credit.balance;
export const selectCreditLoading = (s: RootState) => s.credit.loading;
export const selectPlanType = (s: RootState) => s.credit.planType;
export const selectPlanExpiresAt = (s: RootState) => s.credit.planExpiresAt;
export default creditSlice.reducer;
