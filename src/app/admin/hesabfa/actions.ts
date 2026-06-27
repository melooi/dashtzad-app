"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getEffectiveValue } from "@/lib/admin/integration-config";
import { prisma } from "@/lib/prisma";

const BASE = "https://api.hesabfa.com/v1";

// ── Auth helper ────────────────────────────────────────────────────────

async function getAuth(): Promise<{
  apiKey: string;
  loginToken: string;
} | null> {
  const [apiKey, loginToken] = await Promise.all([
    getEffectiveValue("hesabfa", "apiKey"),
    getEffectiveValue("hesabfa", "loginToken"),
  ]);
  if (!apiKey || !loginToken) return null;
  return { apiKey, loginToken };
}

async function hfPost<T>(
  path: string,
  extra: Record<string, unknown> = {}
): Promise<{ ok: boolean; result?: T; error?: string }> {
  const auth = await getAuth();
  if (!auth) return { ok: false, error: "اعتبارنامهٔ حسابفا ناقص است." };

  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, ...extra }),
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 0 },
    });
    const json = (await res.json()) as {
      Success: boolean;
      ErrorCode: number;
      ErrorMessage: string;
      Result: T;
    };
    if (!json.Success)
      return { ok: false, error: json.ErrorMessage || `کد خطا: ${json.ErrorCode}` };
    return { ok: true, result: json.Result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطای اتصال" };
  }
}

// ── Types ──────────────────────────────────────────────────────────────

export type HfContact = {
  Code: string;
  Id: number;
  Name: string;
  ContactType: number;
  Mobile: string;
  Phone: string;
  Email: string;
  City: string;
  Active: boolean;
};

export type HfInvoice = {
  Number: number;
  Id: number;
  Date: string;
  DueDate: string;
  ContactCode: string;
  ContactName: string;
  InvoiceType: number;
  Sum: number;
  Payable: number;
  Paid: number;
  Rest: number;
  Status: number;
};

export type HfItem = {
  Code: string;
  Id: number;
  Name: string;
  Barcode: string;
  ItemType: number;
  Unit: string;
  Stock: number;
  SellPrice: number;
  BuyPrice: number;
};

export type HfListResult<T> = {
  TotalCount: number;
  FilteredCount: number;
  From: number;
  To: number;
  List: T[];
};

// ── Overview (dashboard aggregation) ─────────────────────────────────

export type HfOverview = {
  invoiceTotalCount: number;
  invoiceTotalSum: number;
  invoiceTotalPaid: number;
  invoiceTotalRest: number;
  unpaidCount: number;
  contactCount: number;
  itemCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  recentInvoices: HfInvoice[];
  lowStockItems: HfItem[];
  banks: HfBank[];
};

export async function fetchHesabfaOverviewAction(): Promise<{
  ok: boolean;
  data?: HfOverview;
  error?: string;
}> {
  await requireAdmin();

  const [invRes, contactRes, itemRes, bankRes] = await Promise.all([
    hfPost<HfListResult<HfInvoice>>("/invoice/getInvoices", {
      type: 0,
      queryInfo: { SortBy: "Id", SortDesc: true, Take: 20, Skip: 0 },
    }),
    hfPost<HfListResult<HfContact>>("/contact/getContacts", {
      queryInfo: { SortBy: "Id", SortDesc: true, Take: 1, Skip: 0 },
    }),
    hfPost<HfListResult<HfItem>>("/item/getItems", {
      queryInfo: { SortBy: "Id", SortDesc: false, Take: 200, Skip: 0 },
    }),
    hfPost<HfBank[]>("/setting/getBanks"),
  ]);

  if (!invRes.ok) return { ok: false, error: invRes.error };

  const invoices = invRes.result?.List ?? [];
  const items = itemRes.result?.List ?? [];

  return {
    ok: true,
    data: {
      invoiceTotalCount: invRes.result?.TotalCount ?? 0,
      invoiceTotalSum: invoices.reduce((s, i) => s + (i.Sum ?? 0), 0),
      invoiceTotalPaid: invoices.reduce((s, i) => s + (i.Paid ?? 0), 0),
      invoiceTotalRest: invoices.reduce((s, i) => s + (i.Rest ?? 0), 0),
      unpaidCount: invoices.filter(i => (i.Rest ?? 0) > 0).length,
      contactCount: contactRes.result?.TotalCount ?? 0,
      itemCount: itemRes.result?.TotalCount ?? 0,
      outOfStockCount: items.filter(i => (i.Stock ?? 0) <= 0).length,
      lowStockCount: items.filter(i => (i.Stock ?? 0) > 0 && (i.Stock ?? 0) < 5).length,
      recentInvoices: invoices.slice(0, 8),
      lowStockItems: items.filter(i => (i.Stock ?? 0) <= 5).slice(0, 8),
      banks: bankRes.ok ? (bankRes.result ?? []) : [],
    },
  };
}

// ── Contacts ───────────────────────────────────────────────────────────

export async function fetchContactsAction(skip = 0, take = 20): Promise<{
  ok: boolean;
  data?: HfListResult<HfContact>;
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfContact>>("/contact/getContacts", {
    queryInfo: { sortBy: "Id", sortDesc: true, take, skip, filters: [] },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Invoices ───────────────────────────────────────────────────────────

export async function fetchInvoicesAction(
  invoiceType: number,
  skip = 0,
  take = 20
): Promise<{ ok: boolean; data?: HfListResult<HfInvoice>; error?: string }> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfInvoice>>("/invoice/getInvoices", {
    type: invoiceType,
    queryInfo: { sortBy: "Id", sortDesc: true, take, skip, filters: [] },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Items / Products ────────────────────────────────────────────────────

export async function fetchItemsAction(skip = 0, take = 20): Promise<{
  ok: boolean;
  data?: HfListResult<HfItem>;
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfItem>>("/item/getItems", {
    queryInfo: { sortBy: "Id", sortDesc: true, take, skip, filters: [] },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Accounting Documents ───────────────────────────────────────────────

export type HfDocument = {
  Id: number;
  Number: number;
  Date: string;
  Description: string;
  Reference: string;
  Sum: number;
  Type: number;
};

export async function fetchDocumentsAction(skip = 0, take = 20): Promise<{
  ok: boolean;
  data?: HfListResult<HfDocument>;
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfDocument>>("/document/getDocuments", {
    queryInfo: { sortBy: "Id", sortDesc: true, take, skip, filters: [] },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Banks (Settings) ──────────────────────────────────────────────────

export type HfBank = {
  Id: number;
  Code: string;
  AccountNumber: string;
  Name: string;
  Branch: string;
  Currency: string;
};

export type HfInvoiceItem = {
  RowNumber: number;
  Description: string;
  ItemCode: string | null;
  ItemName: string;
  Unit: string;
  Quantity: number;
  UnitPrice: number;
  Discount: number;
  Tax: number;
  Total: number;
};

export type HfInvoiceDetail = {
  Id: number;
  Number: number;
  Reference: string;
  Date: string;
  DueDate: string;
  ContactCode: string;
  ContactName: string;
  ContactTitle: string;
  InvoiceType: number;
  Status: number;
  Sum: number;
  Payable: number;
  Paid: number;
  Rest: number;
  Freight: number;
  Note: string;
  SalesmanCode: string;
  Project: string;
  Sent: boolean;
  Currency: string;
  InvoiceItems: HfInvoiceItem[];
};

export type HfReceiptItem = {
  Contact: { Code: string; Name: string };
  Amount: number;
  Description: string;
};

export type HfReceipt = {
  Id: number;
  Number: string;
  DateTime: string;
  Description: string;
  Amount: number;
  Currency: string;
  Project: string;
  BankCode: string;
  Items: HfReceiptItem[];
};

export type HfBankTransfer = {
  Id: number;
  Number: string;
  Date: string;
  Description: string;
  FromBank: string;
  FromCash: string;
  ToBank: string;
  ToCash: string;
  FromAmount: number;
  ToAmount: number;
};

export type HfWarehouseReceiptItem = {
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  Notes: string;
};

export type HfWarehouseReceipt = {
  Id: number;
  Number: string;
  Date: string;
  Type: number;
  WarehouseCode: string;
  Notes: string;
  Items: HfWarehouseReceiptItem[];
};

export type HfItemQuantity = {
  Code: string;
  Name: string;
  WarehouseCode: string;
  Quantity: number;
};

export type HfDebtorCreditor = {
  Code: string;
  Name: string;
  NodeName: string;
  Debit: number;
  Credit: number;
};

export type HfInventoryItem = {
  Code: string;
  Name: string;
  MainUnit: string;
  Opening: number;
  Increase: number;
  Decrease: number;
  Quantity: number;
  Amount: number;
};

export type HfProfitLoss = {
  ProfitOrLoss: number;
  BeginningInventory: number;
  EndingInventory: number;
  Accounts: Array<{ Account: { Name: string }; Debit: number; Credit: number; Balance: number }>;
};

export type HfBusinessInfo = {
  Name: string;
  LegalName: string;
  Calendar: string;
  Currency: string;
  Subscription: string;
  Credit: number;
  ExpireDate: string;
};

export type HfFiscalYear = {
  Name: string;
  StartDate: string;
  EndDate: string;
};

export type HfSalesman = {
  Id: number;
  Code: string;
  Name: string;
  Active: boolean;
};

export type HfProject = {
  Id: number;
  Title: string;
  Active: boolean;
};

export type HfWarehouse = {
  Id: number;
  Code: string;
  Name: string;
};

export type HfCash = {
  Id: number;
  Code: string;
  Name: string;
};

export async function fetchBanksAction(): Promise<{
  ok: boolean;
  data?: HfBank[];
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfBank[]>("/setting/getBanks");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Create Invoice from Order ──────────────────────────────────────────

export async function createInvoiceFromOrderAction(orderId: string): Promise<{
  ok: boolean;
  invoiceNumber?: number;
  error?: string;
}> {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
      items: {
        select: {
          title: true, quantity: true, unitPrice_rial: true, lineTotal_rial: true,
          product: { select: { hesabfaCode: true } },
        },
      },
      address: { select: { city: true, province: true, postalCode: true, line: true } },
    },
  });
  if (!order) return { ok: false, error: "سفارش یافت نشد." };

  // Try to find existing contact by mobile
  let contactCode: string | undefined;
  if (order.user.phoneNumber) {
    const findRes = await hfPost<{ TotalCount: number; List: HfContact[] }>("/contact/getContacts", {
      queryInfo: {
        SortBy: "Id", SortDesc: true, Take: 1, Skip: 0,
        Filters: [{ Property: "Mobile", Value: order.user.phoneNumber, Operation: 5 }],
      },
    });
    if (findRes.ok && findRes.result?.List?.length) {
      contactCode = findRes.result.List[0].Code;
    }
  }

  // Create contact if not found
  if (!contactCode) {
    const cr = await hfPost<HfContact>("/contact/save", {
      contact: {
        Code: null,
        Name: order.user.name || order.user.phoneNumber || "مشتری",
        ContactType: 1,
        Mobile: order.user.phoneNumber || null,
        Email: order.user.email || null,
        Address: order.address?.line || null,
        City: order.address?.city || null,
        PostalCode: order.address?.postalCode || null,
      },
    });
    if (!cr.ok) return { ok: false, error: `خطا در ثبت مخاطب: ${cr.error}` };
    contactCode = cr.result?.Code;
  }
  if (!contactCode) return { ok: false, error: "کد مخاطب دریافت نشد." };

  // Build invoice items (ItemCode = hesabfaCode if linked)
  const invoiceItems = order.items.map((item, i) => ({
    RowNumber: i + 1,
    Description: item.title,
    ItemCode: item.product?.hesabfaCode ?? null,
    Unit: "عدد",
    Quantity: item.quantity,
    UnitPrice: item.unitPrice_rial,
    Discount: 0,
    Tax: 0,
  }));
  if (order.shipping_rial > 0) {
    invoiceItems.push({
      RowNumber: invoiceItems.length + 1,
      Description: "هزینه حمل و نقل",
      ItemCode: null,
      Unit: "عدد",
      Quantity: 1,
      UnitPrice: order.shipping_rial,
      Discount: 0,
      Tax: 0,
    });
  }
  if (order.discount_rial > 0) {
    invoiceItems.push({
      RowNumber: invoiceItems.length + 1,
      Description: "تخفیف",
      ItemCode: null,
      Unit: "عدد",
      Quantity: 1,
      UnitPrice: -order.discount_rial,
      Discount: 0,
      Tax: 0,
    });
  }

  const now = new Date().toISOString().split("T")[0] + "T00:00:00";

  // Load optional settings
  const [salesmanCode, projectCode, feePercent, isDraftStr, defaultBankCode, payment] =
    await Promise.all([
      getEffectiveValue("hesabfa", "salesmanCode"),
      getEffectiveValue("hesabfa", "projectCode"),
      getEffectiveValue("hesabfa", "transactionFeePercent"),
      getEffectiveValue("hesabfa", "invoiceDraft"),
      getEffectiveValue("hesabfa", "defaultBankCode"),
      prisma.payment.findUnique({ where: { orderId }, select: { status: true, amount_rial: true } }),
    ]);

  const isDraft = isDraftStr === "true";
  const feeRate = parseFloat(feePercent ?? "0") / 100;

  const ir = await hfPost<HfInvoice>("/invoice/save", {
    invoice: {
      Number: null,
      Reference: order.orderNumber,
      Date: now,
      DueDate: now,
      ContactCode: contactCode,
      InvoiceType: 0,
      Status: isDraft ? 0 : 1,
      SalesmanCode: salesmanCode || null,
      Project: projectCode || null,
      InvoiceItems: invoiceItems,
    },
  });

  if (!ir.ok) return { ok: false, error: ir.error };
  const invoiceNumber = ir.result?.Number;

  // Auto-record payment if defaultBankCode set and order is paid
  if (defaultBankCode && invoiceNumber && payment?.status === "SUCCESS") {
    let amount = payment.amount_rial;
    // Deduct transaction fee if configured
    if (feeRate > 0) amount = Math.round(amount * (1 - feeRate));
    await hfPost("/invoice/savePayment", {
      invoiceNumber,
      bankCode: defaultBankCode,
      date: now,
      amount,
    });
  }

  return { ok: true, invoiceNumber };
}

// ── Save Payment for Invoice ───────────────────────────────────────────

export async function savePaymentForInvoiceAction(
  invoiceNumber: number,
  bankCode: string,
  amount: number,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const now = new Date().toISOString().split("T")[0] + "T00:00:00";
  const r = await hfPost("/invoice/savePayment", {
    invoiceNumber,
    bankCode,
    date: now,
    amount,
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

// ── Export product to Hesabfa (create or update item) ──────────────────

export async function exportProductToHesabfaAction(productId: string): Promise<{
  ok: boolean;
  itemCode?: string;
  error?: string;
}> {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true, price_rial: true, hesabfaCode: true },
  });
  if (!product) return { ok: false, error: "محصول یافت نشد." };

  // Use existing hesabfaCode if linked, otherwise use product.id as code
  const code = product.hesabfaCode ?? product.id;

  const r = await hfPost<HfItem>("/item/save", {
    item: {
      code,
      name: product.title,
      itemType: 0,
      unit: "عدد",
      sellPrice: product.price_rial,
      active: true,
    },
  });

  if (!r.ok) return { ok: false, error: r.error };
  const returnedCode = r.result?.Code ?? code;

  // Save code back to product if not already set
  if (!product.hesabfaCode && returnedCode) {
    await prisma.product.update({ where: { id: productId }, data: { hesabfaCode: returnedCode } });
  }

  return { ok: true, itemCode: returnedCode };
}

// ── Sync all product stocks from Hesabfa → Dashtzad ───────────────────

export async function syncAllProductStocksAction(): Promise<{
  ok: boolean;
  matched: number;
  updated: number;
  error?: string;
}> {
  await requireAdmin();

  // Fetch all Hesabfa items (up to 500)
  const r = await hfPost<HfListResult<HfItem>>("/item/getItems", {
    queryInfo: { SortBy: "Id", SortDesc: false, Take: 500, Skip: 0 },
  });
  if (!r.ok) return { ok: false, matched: 0, updated: 0, error: r.error };

  // Build code → stock map  (code در حسابفا = product.id در دشت‌زاد)
  const codeMap = new Map<string, number>();
  for (const item of r.result?.List ?? []) {
    if (item.Code) codeMap.set(item.Code, item.Stock ?? 0);
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, hesabfaCode: true, countInStock: true },
  });

  let matched = 0;
  let updated = 0;
  for (const p of products) {
    const key = p.hesabfaCode ?? p.id;
    if (!codeMap.has(key)) continue;
    matched++;
    const newStock = codeMap.get(key)!;
    if (newStock !== p.countInStock) {
      await prisma.product.update({ where: { id: p.id }, data: { countInStock: newStock } });
      updated++;
    }
  }

  return { ok: true, matched, updated };
}

// ── Return Invoice (برگشت از فروش) ───────────────────────────────────

export async function createReturnInvoiceAction(orderId: string): Promise<{
  ok: boolean;
  invoiceNumber?: number;
  error?: string;
}> {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { phoneNumber: true } },
      items: {
        select: {
          title: true, quantity: true, unitPrice_rial: true,
          product: { select: { hesabfaCode: true } },
        },
      },
    },
  });
  if (!order) return { ok: false, error: "سفارش یافت نشد." };

  // Find existing contact
  let contactCode: string | undefined;
  if (order.user.phoneNumber) {
    const findRes = await hfPost<{ TotalCount: number; List: HfContact[] }>("/contact/getContacts", {
      queryInfo: {
        SortBy: "Id", SortDesc: true, Take: 1, Skip: 0,
        Filters: [{ Property: "Mobile", Value: order.user.phoneNumber, Operation: 5 }],
      },
    });
    if (findRes.ok && findRes.result?.List?.length) contactCode = findRes.result.List[0].Code;
  }
  if (!contactCode) return { ok: false, error: "مخاطب مشتری در حسابفا یافت نشد. ابتدا فاکتور فروش را ثبت کنید." };

  const invoiceItems = order.items.map((item, i) => ({
    RowNumber: i + 1,
    Description: item.title,
    ItemCode: item.product?.hesabfaCode ?? null,
    Unit: "عدد",
    Quantity: item.quantity,
    UnitPrice: item.unitPrice_rial,
    Discount: 0,
    Tax: 0,
  }));

  const now = new Date().toISOString().split("T")[0] + "T00:00:00";

  const ir = await hfPost<HfInvoice>("/invoice/save", {
    invoice: {
      Number: null,
      Reference: order.orderNumber + "-R",
      Date: now,
      DueDate: now,
      ContactCode: contactCode,
      InvoiceType: 2,   // برگشت از فروش
      Status: 1,
      InvoiceItems: invoiceItems,
    },
  });

  if (!ir.ok) return { ok: false, error: ir.error };
  return { ok: true, invoiceNumber: ir.result?.Number };
}

// ── Get invoice number by order reference ─────────────────────────────

export async function getInvoiceByOrderNumberAction(orderNumber: string): Promise<{
  ok: boolean;
  invoiceNumber?: number;
  invoiceId?: number;
  sum?: number;
  paid?: number;
  status?: number;
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfInvoice>>("/invoice/getInvoices", {
    type: 0,
    queryInfo: {
      SortBy: "Id", SortDesc: true, Take: 1, Skip: 0,
      Filters: [{ Property: "Reference", Value: orderNumber, Operation: 0 }],
    },
  });
  if (!r.ok) return { ok: false, error: r.error };
  const inv = r.result?.List?.[0];
  if (!inv) return { ok: false, error: "فاکتوری برای این سفارش یافت نشد." };
  return {
    ok: true,
    invoiceNumber: inv.Number,
    invoiceId: inv.Id,
    sum: inv.Sum,
    paid: inv.Paid,
    status: inv.Status,
  };
}

// ── Get online invoice URL ─────────────────────────────────────────────

export async function getOnlineInvoiceUrlAction(invoiceId: number): Promise<{
  ok: boolean;
  url?: string;
  error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Url: string }>("/invoice/getonlineinvoiceurl", { id: invoiceId });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, url: r.result?.Url };
}

// ── Batch export all active products to Hesabfa ───────────────────────

export async function exportAllProductsAction(): Promise<{
  ok: boolean;
  exported: number;
  failed: number;
  error?: string;
}> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, title: true, price_rial: true, hesabfaCode: true },
  });

  let exported = 0;
  let failed = 0;
  for (const product of products) {
    const code = product.hesabfaCode ?? product.id;
    const r = await hfPost<HfItem>("/item/save", {
      item: { code, name: product.title, itemType: 0, unit: "عدد", sellPrice: product.price_rial, active: true },
    });
    if (r.ok) {
      // Save returned code if product wasn't linked yet
      const returnedCode = r.result?.Code ?? code;
      if (!product.hesabfaCode && returnedCode) {
        await prisma.product.update({ where: { id: product.id }, data: { hesabfaCode: returnedCode } });
      }
      exported++;
    } else {
      failed++;
    }
  }

  return { ok: true, exported, failed };
}

// ── Sync price & stock from Hesabfa → Dashtzad ────────────────────────

export async function syncAllProductPricesAndStocksAction(): Promise<{
  ok: boolean;
  matched: number;
  stockUpdated: number;
  priceUpdated: number;
  error?: string;
}> {
  await requireAdmin();

  const r = await hfPost<HfListResult<HfItem>>("/item/getItems", {
    queryInfo: { SortBy: "Id", SortDesc: false, Take: 500, Skip: 0 },
  });
  if (!r.ok) return { ok: false, matched: 0, stockUpdated: 0, priceUpdated: 0, error: r.error };

  const codeMap = new Map<string, { stock: number; price: number }>();
  for (const item of r.result?.List ?? []) {
    if (item.Code) codeMap.set(item.Code, { stock: item.Stock ?? 0, price: item.SellPrice ?? 0 });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, hesabfaCode: true, countInStock: true, price_rial: true },
  });

  let matched = 0, stockUpdated = 0, priceUpdated = 0;
  for (const p of products) {
    const hf = codeMap.get(p.hesabfaCode ?? p.id);
    if (!hf) continue;
    matched++;
    const data: { countInStock?: number; price_rial?: number } = {};
    if (hf.stock !== p.countInStock) { data.countInStock = hf.stock; stockUpdated++; }
    if (hf.price > 0 && hf.price !== p.price_rial) { data.price_rial = hf.price; priceUpdated++; }
    if (Object.keys(data).length > 0) {
      await prisma.product.update({ where: { id: p.id }, data });
    }
  }

  return { ok: true, matched, stockUpdated, priceUpdated };
}

// ── Export all customers to Hesabfa ───────────────────────────────────

export async function exportAllCustomersAction(): Promise<{
  ok: boolean;
  exported: number;
  skipped: number;
  error?: string;
}> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { name: true, phoneNumber: true, email: true },
    take: 200,
  });

  let exported = 0;
  let skipped = 0;
  for (const u of users) {
    if (!u.name && !u.phoneNumber) { skipped++; continue; }
    const r = await hfPost("/contact/save", {
      contact: {
        Code: null,
        Name: u.name || u.phoneNumber || "مشتری",
        ContactType: 1,
        Mobile: u.phoneNumber || null,
        Email: u.email || null,
      },
    });
    if (r.ok) exported++; else skipped++;
  }

  return { ok: true, exported, skipped };
}

// ── Push dashtzad prices → Hesabfa ────────────────────────────────────

export async function pushAllPricesToHesabfaAction(): Promise<{
  ok: boolean;
  pushed: number;
  skipped: number;
  failed: number;
  error?: string;
}> {
  await requireAdmin();

  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, title: true, price_rial: true, hesabfaCode: true },
  });

  let pushed = 0, skipped = 0, failed = 0;
  for (const p of products) {
    const code = p.hesabfaCode ?? p.id;
    const r = await hfPost<HfItem>("/item/save", {
      item: { code, name: p.title, itemType: 0, unit: "عدد", sellPrice: p.price_rial, active: true },
    });
    if (r.ok) pushed++;
    else if (!p.hesabfaCode) skipped++;
    else failed++;
  }

  return { ok: true, pushed, skipped, failed };
}

// ── Set product hesabfaCode (manual link) ─────────────────────────────

export async function setProductHesabfaCodeAction(
  productId: string,
  hesabfaCode: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const code = hesabfaCode.trim();
  if (!code) return { ok: false, error: "کد نمی‌تواند خالی باشد." };
  try {
    await prisma.product.update({ where: { id: productId }, data: { hesabfaCode: code } });
    return { ok: true };
  } catch {
    return { ok: false, error: "این کد قبلاً به محصول دیگری لینک شده است." };
  }
}

// ── Invoice Detail ────────────────────────────────────────────────────

export async function getInvoiceDetailAction(number: number, type = 0): Promise<{
  ok: boolean; data?: HfInvoiceDetail; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfInvoiceDetail>("/invoice/get", { number, type });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function changeInvoiceSentStatusAction(number: number, type: number, sent: boolean): Promise<{
  ok: boolean; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost("/invoice/changeSentStatus", { number: String(number), type, sent });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

// ── Receipts / Payments ───────────────────────────────────────────────

export async function fetchReceiptsAction(type: 1 | 2, skip = 0, take = 20): Promise<{
  ok: boolean; data?: HfListResult<HfReceipt>; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfReceipt>>("/receipt/getReceipts", {
    type,
    queryInfo: { SortBy: "Id", SortDesc: true, Take: take, Skip: skip },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Bank Transfers ────────────────────────────────────────────────────

export async function fetchBankTransfersAction(skip = 0, take = 20): Promise<{
  ok: boolean; data?: HfListResult<HfBankTransfer>; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfBankTransfer>>("/bankTransfer/getBankTransferList", {
    queryInfo: { SortBy: "Id", SortDesc: true, Take: take, Skip: skip },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Warehouse Receipts ────────────────────────────────────────────────

export async function fetchWarehouseReceiptsAction(type: 1 | 2, skip = 0, take = 20): Promise<{
  ok: boolean; data?: HfListResult<HfWarehouseReceipt>; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfWarehouseReceipt>>("/warehouse/getWarehouseReceipts", {
    type,
    queryInfo: { SortBy: "Id", SortDesc: true, Take: take, Skip: skip },
  });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Item Quantities ───────────────────────────────────────────────────

export async function fetchItemQuantitiesAction(): Promise<{
  ok: boolean; data?: HfItemQuantity[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfItemQuantity[]>("/item/getItemQuantity");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Contact Link ──────────────────────────────────────────────────────

export async function getContactLinkAction(code: string): Promise<{
  ok: boolean; url?: string; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Url: string }>("/contact/getContactLink", { code, showAllAccounts: true, days: 90 });
  return r.ok ? { ok: true, url: r.result?.Url } : { ok: false, error: r.error };
}

// ── Reports ───────────────────────────────────────────────────────────

export async function fetchProfitAndLossAction(startDate: string, endDate: string): Promise<{
  ok: boolean; data?: HfProfitLoss; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfProfitLoss>("/report/profitAndLossStatement", { startDate, endDate });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchDebtorsCreditorsAction(startDate: string, endDate: string): Promise<{
  ok: boolean; data?: HfDebtorCreditor[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfDebtorCreditor[]>("/report/debtorscreditors", { startDate, endDate });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchInventoryReportAction(startDate: string, endDate: string): Promise<{
  ok: boolean; data?: HfInventoryItem[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfInventoryItem[]>("/report/reportInventory", { startDate, endDate });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchBankReportAction(startDate: string, endDate: string, code = ""): Promise<{
  ok: boolean; data?: Array<{ Code: string; Name: string; Opening: number; Increase: number; Decrease: number; Amount: number }>; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<Array<{ Code: string; Name: string; Opening: number; Increase: number; Decrease: number; Amount: number }>>("/report/bank", { startDate, endDate, ...(code ? { code } : {}) });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export type HfBalanceSheetItem = {
  Account: { Code: string; Name: string };
  Debit: number;
  Credit: number;
  Balance: number;
};

export async function fetchBalanceSheetAction(startDate: string, endDate: string): Promise<{
  ok: boolean; data?: HfBalanceSheetItem[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfBalanceSheetItem[]>("/report/balanceSheet", { startDate, endDate });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchTrialBalanceAction(startDate: string, endDate: string): Promise<{
  ok: boolean; data?: HfBalanceSheetItem[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfBalanceSheetItem[]>("/report/trialBalance", { startDate, endDate });
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function saveReceiptAction(params: {
  type: 1 | 2;
  bankCode: string;
  amount: number;
  date: string;
  description: string;
  contactCode?: string;
}): Promise<{ ok: boolean; number?: string; error?: string }> {
  await requireAdmin();
  const r = await hfPost<{ Number: string }>("/receipt/save", {
    receipt: {
      Type: params.type,
      BankCode: params.bankCode,
      Amount: params.amount,
      DateTime: params.date + "T00:00:00",
      Description: params.description,
      Items: params.contactCode ? [{ Contact: { Code: params.contactCode }, Amount: params.amount, Description: params.description }] : [],
    },
  });
  return r.ok ? { ok: true, number: r.result?.Number } : { ok: false, error: r.error };
}

// ── Settings / Info ───────────────────────────────────────────────────

export async function fetchBusinessInfoAction(): Promise<{
  ok: boolean; data?: HfBusinessInfo; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfBusinessInfo>("/setting/getBusinessInfo");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchFiscalYearAction(): Promise<{
  ok: boolean; data?: HfFiscalYear; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfFiscalYear>("/setting/getFiscalYears");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchSalesmenAction(): Promise<{
  ok: boolean; data?: HfSalesman[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfSalesman[]>("/setting/getSalesmen");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchProjectsAction(): Promise<{
  ok: boolean; data?: HfProject[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfProject[]>("/setting/getProjects");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchWarehousesAction(): Promise<{
  ok: boolean; data?: HfWarehouse[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfWarehouse[]>("/setting/getWarehouses");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

export async function fetchCashesAction(): Promise<{
  ok: boolean; data?: HfCash[]; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<HfCash[]>("/setting/getCashes");
  return r.ok ? { ok: true, data: r.result } : { ok: false, error: r.error };
}

// ── Inquiries ─────────────────────────────────────────────────────────

export async function inquiryCreditAction(): Promise<{
  ok: boolean; credit?: number; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<number>("/inquiry/credit");
  return r.ok ? { ok: true, credit: r.result } : { ok: false, error: r.error };
}

export async function inquiryCardAction(cardNumber: string): Promise<{
  ok: boolean; name?: string; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Data: { Name: string } }>("/inquiry/card", { cardNumber });
  return r.ok ? { ok: true, name: r.result?.Data?.Name } : { ok: false, error: r.error };
}

export async function inquiryIbanAction(iban: string): Promise<{
  ok: boolean; data?: { Name: string; BankName: string; IsTransferable: boolean }; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Data: { Name: string; BankName: string; IsTransferable: boolean } }>("/inquiry/iban", { iban });
  return r.ok ? { ok: true, data: r.result?.Data } : { ok: false, error: r.error };
}

export async function inquiryCardToIbanAction(cardNumber: string): Promise<{
  ok: boolean; data?: { IBAN: string; BankName: string; Name: string }; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Data: { IBAN: string; BankName: string; Name: string } }>("/inquiry/cardToIban", { cardNumber });
  return r.ok ? { ok: true, data: r.result?.Data } : { ok: false, error: r.error };
}

export async function inquiryPostalCodeAction(postalCode: string): Promise<{
  ok: boolean; data?: { Province: string; Town: string; District: string; Street: string; description: string }; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Data: { Address: { Province: string; Town: string; District: string; Street: string; description: string } } }>("/inquiry/postalCode", { postalCode });
  return r.ok ? { ok: true, data: r.result?.Data?.Address } : { ok: false, error: r.error };
}

export async function inquiryNationalIdAction(nationalCode: string, birthDate: string): Promise<{
  ok: boolean; data?: { Matched: boolean; FirstName: string; LastName: string; IsDead: boolean }; error?: string;
}> {
  await requireAdmin();
  const r = await hfPost<{ Data: { Matched: boolean; FirstName: string; LastName: string; IsDead: boolean } }>("/inquiry/getNationalIdentity", { nationalCode, birthDate });
  return r.ok ? { ok: true, data: r.result?.Data } : { ok: false, error: r.error };
}

// ── Connection test ────────────────────────────────────────────────────

export async function testHesabfaAction(): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const r = await hfPost<HfListResult<HfContact>>("/contact/getContacts", {
    queryInfo: { sortBy: "Id", sortDesc: true, take: 1, skip: 0, filters: [] },
  });
  if (r.ok)
    return { ok: true, message: `اتصال به حسابفا برقرار است.` };
  return { ok: false, message: r.error ?? "اتصال ناموفق" };
}
