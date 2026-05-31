import type {
  Client,
  DemoUser,
  EmailLog,
  Invoice,
  Payment,
  PaymentMethodConfig,
  RecurringPlan,
} from "./types";

// Module-level state. Reset on every server restart — fine for demo.
type State = {
  users: DemoUser[];
  clients: Client[];
  plans: RecurringPlan[];
  invoices: Invoice[];
  payments: Payment[];
  paymentMethods: PaymentMethodConfig[];
  emailLogs: EmailLog[];
};

const globalForDemo = globalThis as unknown as { __demoStore?: State };

function seed(): State {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const dueThisMonth = (day: number) => new Date(now.getFullYear(), now.getMonth(), day);
  const duePrevMonth = (day: number) => new Date(now.getFullYear(), now.getMonth() - 1, day);

  const users: DemoUser[] = [
    {
      id: "u_admin",
      email: "admin@demo.test",
      fullName: "Admin Demo",
      role: "ADMIN",
    },
    {
      id: "u_client_juan",
      email: "juan@acme.test",
      fullName: "Juan Pérez (Acme SRL)",
      role: "CLIENT",
      clientId: "c_juan",
    },
    {
      id: "u_client_lucia",
      email: "lucia@solostartup.test",
      fullName: "Lucía Gómez (Solo Startup)",
      role: "CLIENT",
      clientId: "c_lucia",
    },
    {
      id: "u_client_marco",
      email: "marco@bytefactory.test",
      fullName: "Marco Díaz (Byte Factory)",
      role: "CLIENT",
      clientId: "c_marco",
    },
  ];

  const clients: Client[] = [
    {
      id: "c_juan",
      userId: "u_client_juan",
      fullName: "Acme SRL",
      email: "juan@acme.test",
      phone: "+54 11 5555 1234",
      taxId: "30-12345678-9",
      notes: "Cobro mensual de mantenimiento de infraestructura",
      active: true,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 10),
    },
    {
      id: "c_lucia",
      userId: "u_client_lucia",
      fullName: "Solo Startup",
      email: "lucia@solostartup.test",
      phone: "+54 11 5555 7766",
      taxId: "27-98765432-1",
      notes: "Fee mensual de gestión de cuenta",
      active: true,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 3),
    },
    {
      id: "c_marco",
      userId: "u_client_marco",
      fullName: "Byte Factory",
      email: "marco@bytefactory.test",
      phone: "+54 351 555 9090",
      taxId: "30-22233344-5",
      notes: "Hosting + soporte",
      active: true,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 6, 21),
    },
  ];

  const plans: RecurringPlan[] = [
    {
      id: "p_juan",
      clientId: "c_juan",
      amountUsd: 350,
      description: "Mantenimiento de infraestructura cloud + monitoreo 24/7",
      dueDayOfMonth: 10,
      active: true,
      startDate: new Date(now.getFullYear(), now.getMonth() - 4, 10),
    },
    {
      id: "p_lucia",
      clientId: "c_lucia",
      amountUsd: 180,
      description: "Gestión de cuenta + reportes mensuales",
      dueDayOfMonth: 5,
      active: true,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
    },
    {
      id: "p_marco",
      clientId: "c_marco",
      amountUsd: 220,
      description: "Hosting VPS + soporte técnico (10 hs/mes)",
      dueDayOfMonth: 1,
      active: true,
      startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
    },
  ];

  const invoices: Invoice[] = [
    {
      id: "i_juan_prev",
      clientId: "c_juan",
      amountUsd: 350,
      description: "Mantenimiento infra — mes anterior",
      periodStart: prevMonthStart,
      periodEnd: prevMonthEnd,
      dueDate: duePrevMonth(10),
      status: "PAID",
      paidAt: duePrevMonth(8),
      createdAt: prevMonthStart,
    },
    {
      id: "i_juan_curr",
      clientId: "c_juan",
      amountUsd: 350,
      description: "Mantenimiento infra — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(10),
      status: "PENDING",
      createdAt: monthStart,
    },
    {
      id: "i_lucia_curr",
      clientId: "c_lucia",
      amountUsd: 180,
      description: "Gestión de cuenta — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(5),
      status: "PENDING_REVIEW",
      createdAt: monthStart,
    },
    {
      id: "i_marco_prev",
      clientId: "c_marco",
      amountUsd: 220,
      description: "Hosting + soporte — mes anterior",
      periodStart: prevMonthStart,
      periodEnd: prevMonthEnd,
      dueDate: duePrevMonth(1),
      status: "OVERDUE",
      createdAt: prevMonthStart,
    },
    {
      id: "i_marco_curr",
      clientId: "c_marco",
      amountUsd: 220,
      description: "Hosting + soporte — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(1),
      status: "PENDING",
      createdAt: monthStart,
    },
  ];

  const payments: Payment[] = [
    {
      id: "pay_juan_prev",
      invoiceId: "i_juan_prev",
      method: "MERCADOPAGO",
      status: "CONFIRMED",
      amountUsd: 350,
      externalId: "MP-DEMO-99887",
      confirmedAt: duePrevMonth(8),
      createdAt: duePrevMonth(8),
    },
    {
      id: "pay_lucia_review",
      invoiceId: "i_lucia_curr",
      method: "BANK_TRANSFER",
      status: "PENDING_REVIEW",
      amountUsd: 180,
      proofUrl: "https://demo.invalid/proofs/transfer-1234.png",
      notes: "Transferencia enviada desde Banco Galicia.",
      createdAt: dueThisMonth(3),
    },
  ];

  const paymentMethods: PaymentMethodConfig[] = [
    {
      id: "pm_bank_galicia",
      kind: "BANK_ACCOUNT",
      label: "Banco Galicia — Caja de ahorro USD",
      details: {
        bankName: "Banco Galicia",
        accountHolder: "Admin Demo",
        cbu: "0070123456789012345678",
        alias: "demo.payment.usd",
        taxId: "20-12345678-9",
      },
      instructions:
        "Transferí el monto exacto en USD y subí el comprobante. Acreditación en 1-2 días hábiles.",
      active: true,
      sortOrder: 0,
    },
    {
      id: "pm_crypto_usdt_tron",
      kind: "CRYPTO_WALLET",
      label: "USDT (red Tron / TRC20)",
      details: {
        network: "TRON (TRC20)",
        asset: "USDT",
        address: "TXYZdemo1234567890abcdefABCDEF",
      },
      instructions:
        "Enviá únicamente USDT en red TRC20. Otras redes pueden generar pérdida de fondos.",
      active: true,
      sortOrder: 1,
    },
    {
      id: "pm_crypto_usdc_polygon",
      kind: "CRYPTO_WALLET",
      label: "USDC (red Polygon)",
      details: {
        network: "Polygon",
        asset: "USDC",
        address: "0xDemoPolygon0000000000000000000000DEAD",
      },
      instructions: "Enviá USDC en red Polygon. Otras redes pueden generar pérdida de fondos.",
      active: true,
      sortOrder: 2,
    },
  ];

  const emailLogs: EmailLog[] = [
    {
      id: "el_1",
      kind: "INVOICE_CREATED",
      toEmail: "juan@acme.test",
      subject: "Nueva factura — Mantenimiento infra (USD 350)",
      invoiceId: "i_juan_curr",
      sentAt: monthStart,
    },
    {
      id: "el_2",
      kind: "OVERDUE",
      toEmail: "marco@bytefactory.test",
      subject: "Tu pago está vencido — Hosting + soporte",
      invoiceId: "i_marco_prev",
      sentAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
    },
  ];

  return { users, clients, plans, invoices, payments, paymentMethods, emailLogs };
}

export function store(): State {
  return (globalForDemo.__demoStore ??= seed());
}

export function resetStore() {
  globalForDemo.__demoStore = seed();
}

let idCounter = 1000;
export function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
