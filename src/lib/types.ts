// Shared app-level types. Re-exports Prisma enums + adds discriminated
// unions for JSON fields (Prisma can't infer those — they're typed as
// Prisma.JsonValue at the schema level).

export type {
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentMethodKind,
  EmailKind,
  UserRole,
} from "@/generated/prisma/enums";

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

// Frontend-friendly discriminated PaymentMethodConfig.
// Routers cast Prisma's `details: JsonValue` into this shape at the boundary.
export type PaymentMethodConfigDto =
  | {
      id: string;
      kind: "BANK_ACCOUNT";
      label: string;
      details: BankAccountDetails;
      instructions?: string | null;
      active: boolean;
      sortOrder: number;
    }
  | {
      id: string;
      kind: "CRYPTO_WALLET";
      label: string;
      details: CryptoWalletDetails;
      instructions?: string | null;
      active: boolean;
      sortOrder: number;
    };
