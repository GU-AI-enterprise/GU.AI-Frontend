import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/apiFetch';
import type { RootState } from '@/store/store';

interface CreditState {
  balance: number | null;
  loading: boolean;
}

const initialState: CreditState = {
  balance: null,
  loading: false,
};

export const fetchCredit = createAsyncThunk(
  'credit/fetch',
  async (_, { getState, rejectWithValue }) => {
    if (!(getState() as RootState).auth.session?.access_token) return rejectWithValue('No token');
    const res = await apiFetch('/api/users/profile');
    const json = await res.json();
    if (json.current_credit === undefined) return rejectWithValue('No credit field');
    return json.current_credit as number;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredit.pending, (state) => { state.loading = true; })
      .addCase(fetchCredit.fulfilled, (state, action) => { state.balance = action.payload; state.loading = false; })
      .addCase(fetchCredit.rejected, (state) => { state.loading = false; });
  },
});

export const { setBalance, adjustBalance } = creditSlice.actions;
export const selectCreditBalance = (s: RootState) => s.credit.balance;
export const selectCreditLoading = (s: RootState) => s.credit.loading;
export default creditSlice.reducer;
