// Mirrors prisma/schema.prisma but as plain TS for the demo in-memory store.

export type UserRole = "ADMIN" | "CLIENT";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "PENDING_REVIEW"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethodKey = "MERCADOPAGO" | "BANK_TRANSFER" | "CRYPTO";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING_REVIEW"
  | "CONFIRMED"
  | "REJECTED"
  | "REFUNDED";

export type PaymentMethodKind = "BANK_ACCOUNT" | "CRYPTO_WALLET";

export type EmailKind =
  | "INVOICE_CREATED"
  | "REMINDER_BEFORE_DUE"
  | "OVERDUE"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_REVIEW_REQUIRED"
  | "WELCOME";

export type DemoUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clientId?: string;
};

export type Client = {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  taxId?: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
};

export type RecurringPlan = {
  id: string;
  clientId: string;
  amountUsd: number;
  description: string;
  dueDayOfMonth: number;
  active: boolean;
  startDate: Date;
};

export type Invoice = {
  id: string;
  clientId: string;
  amountUsd: number;
  description: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  status: InvoiceStatus;
  paidAt?: Date;
  createdAt: Date;
};

export type Payment = {
  id: string;
  invoiceId: string;
  method: PaymentMethodKey;
  status: PaymentStatus;
  amountUsd: number;
  arsAmount?: number;
  arsRate?: number;
  externalId?: string;
  proofUrl?: string;
  notes?: string;
  confirmedAt?: Date;
  createdAt: Date;
};

export type BankAccountDetails = {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias?: string;
  taxId?: string;
};

export type CryptoWalletDetails = {
  network: string;
  asset: string;
  address: string;
  memo?: string;
};

export type PaymentMethodConfig =
  | {
      id: string;
      kind: "BANK_ACCOUNT";
      label: string;
      details: BankAccountDetails;
      instructions?: string;
      active: boolean;
      sortOrder: number;
    }
  | {
      id: string;
      kind: "CRYPTO_WALLET";
      label: string;
      details: CryptoWalletDetails;
      instructions?: string;
      active: boolean;
      sortOrder: number;
    };

export type EmailLog = {
  id: string;
  kind: EmailKind;
  toEmail: string;
  subject: string;
  invoiceId?: string;
  sentAt: Date;
};
