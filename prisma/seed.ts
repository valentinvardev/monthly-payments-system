// Seed script — mirrors the in-memory demo data so a fresh DB looks
// exactly like the demo did. Idempotent: safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const dueThisMonth = (d: number) => new Date(now.getFullYear(), now.getMonth(), d);
  const duePrevMonth = (d: number) => new Date(now.getFullYear(), now.getMonth() - 1, d);

  console.log("→ Seeding payment method configs…");

  await prisma.paymentMethodConfig.upsert({
    where: { id: "pm_bank_galicia" },
    update: {},
    create: {
      id: "pm_bank_galicia",
      kind: "BANK_ACCOUNT",
      label: "Banco Galicia — Caja de ahorro USD",
      details: {
        bankName: "Banco Galicia",
        accountHolder: "Valentín Varela",
        cbu: "0070123456789012345678",
        alias: "surcodia.usd",
        taxId: "20-12345678-9",
      },
      instructions:
        "Transferí el monto exacto en USD y subí el comprobante. Acreditación en 1-2 días hábiles.",
      sortOrder: 0,
    },
  });

  const cryptos: Array<{
    id: string;
    label: string;
    network: string;
    asset: string;
    address: string;
    instructions: string;
    sortOrder: number;
  }> = [
    {
      id: "pm_crypto_usdt_tron",
      label: "USDT (red Tron / TRC20)",
      network: "TRON (TRC20)",
      asset: "USDT",
      address: "TXYZdemo1234567890abcdefABCDEF",
      instructions: "Enviá únicamente USDT en red TRC20.",
      sortOrder: 1,
    },
    {
      id: "pm_crypto_usdc_polygon",
      label: "USDC (red Polygon)",
      network: "Polygon",
      asset: "USDC",
      address: "0xDemoPolygon0000000000000000000000DEAD",
      instructions: "Enviá USDC en red Polygon.",
      sortOrder: 2,
    },
    {
      id: "pm_crypto_usdt_bep20",
      label: "USDT (red BNB Chain / BEP20)",
      network: "BNB Chain (BEP20)",
      asset: "USDT",
      address: "0xDemoBep20000000000000000000000BEEF",
      instructions: "Enviá únicamente USDT en red BEP20.",
      sortOrder: 3,
    },
    {
      id: "pm_crypto_btc",
      label: "Bitcoin (red BTC nativa)",
      network: "Bitcoin",
      asset: "BTC",
      address: "bc1qdem0btcaddress0000000000000000000000xy",
      instructions: "Enviá BTC a esta dirección nativa.",
      sortOrder: 4,
    },
    {
      id: "pm_crypto_ltc",
      label: "Litecoin (red LTC nativa)",
      network: "Litecoin",
      asset: "LTC",
      address: "ltc1qdem0ltcaddress00000000000000000000xyzz",
      instructions: "Enviá LTC a esta dirección nativa.",
      sortOrder: 5,
    },
  ];

  for (const c of cryptos) {
    await prisma.paymentMethodConfig.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        kind: "CRYPTO_WALLET",
        label: c.label,
        details: { network: c.network, asset: c.asset, address: c.address },
        instructions: c.instructions,
        sortOrder: c.sortOrder,
      },
    });
  }

  console.log("→ Seeding clients…");

  const acme = await prisma.client.upsert({
    where: { id: "c_juan" },
    update: {},
    create: {
      id: "c_juan",
      fullName: "Acme SRL",
      email: "juan@acme.test",
      phone: "+54 11 5555 1234",
      taxId: "30-12345678-9",
      notes: "Cobro mensual de mantenimiento de infraestructura",
      createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 10),
    },
  });

  const solo = await prisma.client.upsert({
    where: { id: "c_lucia" },
    update: {},
    create: {
      id: "c_lucia",
      fullName: "Solo Startup",
      email: "lucia@solostartup.test",
      phone: "+54 11 5555 7766",
      taxId: "27-98765432-1",
      notes: "Fee mensual de gestión de cuenta",
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 3),
    },
  });

  const byte = await prisma.client.upsert({
    where: { id: "c_marco" },
    update: {},
    create: {
      id: "c_marco",
      fullName: "Byte Factory",
      email: "marco@bytefactory.test",
      phone: "+54 351 555 9090",
      taxId: "30-22233344-5",
      notes: "Hosting + soporte",
      createdAt: new Date(now.getFullYear(), now.getMonth() - 6, 21),
    },
  });

  console.log("→ Seeding recurring plans…");

  await prisma.recurringPlan.upsert({
    where: { id: "p_juan" },
    update: {},
    create: {
      id: "p_juan",
      clientId: acme.id,
      amountUsd: 350,
      description: "Mantenimiento de infraestructura cloud + monitoreo 24/7",
      dueDayOfMonth: 10,
      startDate: new Date(now.getFullYear(), now.getMonth() - 4, 10),
    },
  });

  await prisma.recurringPlan.upsert({
    where: { id: "p_lucia" },
    update: {},
    create: {
      id: "p_lucia",
      clientId: solo.id,
      amountUsd: 180,
      description: "Gestión de cuenta + reportes mensuales",
      dueDayOfMonth: 5,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
    },
  });

  await prisma.recurringPlan.upsert({
    where: { id: "p_marco" },
    update: {},
    create: {
      id: "p_marco",
      clientId: byte.id,
      amountUsd: 220,
      description: "Hosting VPS + soporte técnico (10 hs/mes)",
      dueDayOfMonth: 1,
      startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
    },
  });

  console.log("→ Seeding invoices…");

  await prisma.invoice.upsert({
    where: { id: "i_juan_prev" },
    update: {},
    create: {
      id: "i_juan_prev",
      clientId: acme.id,
      amountUsd: 350,
      description: "Mantenimiento infra — mes anterior",
      periodStart: prevMonthStart,
      periodEnd: prevMonthEnd,
      dueDate: duePrevMonth(10),
      status: "PAID",
      paidAt: duePrevMonth(8),
      createdAt: prevMonthStart,
    },
  });

  await prisma.invoice.upsert({
    where: { id: "i_juan_curr" },
    update: {},
    create: {
      id: "i_juan_curr",
      clientId: acme.id,
      amountUsd: 350,
      description: "Mantenimiento infra — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(10),
      status: "PENDING",
      createdAt: monthStart,
    },
  });

  await prisma.invoice.upsert({
    where: { id: "i_lucia_curr" },
    update: {},
    create: {
      id: "i_lucia_curr",
      clientId: solo.id,
      amountUsd: 180,
      description: "Gestión de cuenta — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(5),
      status: "PENDING_REVIEW",
      createdAt: monthStart,
    },
  });

  await prisma.invoice.upsert({
    where: { id: "i_marco_prev" },
    update: {},
    create: {
      id: "i_marco_prev",
      clientId: byte.id,
      amountUsd: 220,
      description: "Hosting + soporte — mes anterior",
      periodStart: prevMonthStart,
      periodEnd: prevMonthEnd,
      dueDate: duePrevMonth(1),
      status: "OVERDUE",
      createdAt: prevMonthStart,
    },
  });

  await prisma.invoice.upsert({
    where: { id: "i_marco_curr" },
    update: {},
    create: {
      id: "i_marco_curr",
      clientId: byte.id,
      amountUsd: 220,
      description: "Hosting + soporte — mes en curso",
      periodStart: monthStart,
      periodEnd: monthEnd,
      dueDate: dueThisMonth(1),
      status: "PENDING",
      createdAt: monthStart,
    },
  });

  console.log("→ Seeding payments…");

  await prisma.payment.upsert({
    where: { id: "pay_juan_prev" },
    update: {},
    create: {
      id: "pay_juan_prev",
      invoiceId: "i_juan_prev",
      method: "MERCADOPAGO",
      status: "CONFIRMED",
      amountUsd: 350,
      externalId: "MP-DEMO-99887",
      confirmedAt: duePrevMonth(8),
      createdAt: duePrevMonth(8),
    },
  });

  await prisma.payment.upsert({
    where: { id: "pay_lucia_review" },
    update: {},
    create: {
      id: "pay_lucia_review",
      invoiceId: "i_lucia_curr",
      method: "BANK_TRANSFER",
      status: "PENDING_REVIEW",
      amountUsd: 180,
      proofUrl: "https://demo.invalid/proofs/transfer-1234.png",
      notes: "Transferencia enviada desde Banco Galicia.",
      createdAt: dueThisMonth(3),
    },
  });

  console.log("→ Seeding email logs…");

  await prisma.emailLog.upsert({
    where: { id: "el_1" },
    update: {},
    create: {
      id: "el_1",
      kind: "INVOICE_CREATED",
      toEmail: "juan@acme.test",
      subject: "Nueva factura — Mantenimiento infra (USD 350)",
      invoiceId: "i_juan_curr",
      sentAt: monthStart,
    },
  });

  await prisma.emailLog.upsert({
    where: { id: "el_2" },
    update: {},
    create: {
      id: "el_2",
      kind: "OVERDUE",
      toEmail: "marco@bytefactory.test",
      subject: "Tu pago está vencido — Hosting + soporte",
      invoiceId: "i_marco_prev",
      sentAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
    },
  });

  console.log("✓ Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
