export interface StripeAccount {
  accountId: string;
  
  friendlyName: string;
  workerUrl: string;
  status: "ACTIVE" | "INACTIVE";
  dailyLimit: number;

  // Динамические поля, которые мы пока "глушим"
  grossVolume: number;
  transferredInvoices: number;
  lastTransfer: string;
}

// Тип для перенесенного инвойса
export interface TransferredInvoice {
  logId: string;
  stripeInvoiceId: string;
  amount: number; // Целая сумма
  currency: string;
  transferredByWorker: string;
  transferDate: string;
}