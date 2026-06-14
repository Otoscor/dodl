export interface Wallet {
  id: string;
  session_id: string;
  balance: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}
