import { formatOrderDate } from "./format";
import { getLineItemSku, getLineItemVariantLabel } from "./line-item";
import type { Order } from "./types";

const CSV_HEADERS = [
  "Order",
  "Order ID",
  "Date",
  "Payment status",
  "Fulfillment status",
  "Total amount",
  "Currency",
  "Product",
  "Variant",
  "SKU",
  "Quantity",
] as const;

const MAX_EXPORT_ORDERS = 250;
const MAX_EXPORT_ROWS = 5_000;
const UTF8_BOM = "\uFEFF";

export type ExportErrorCode =
  | "NO_ORDERS_SELECTED"
  | "TOO_MANY_ORDERS"
  | "TOO_MANY_ROWS"
  | "BROWSER_UNSUPPORTED"
  | "BUILD_FAILED"
  | "DOWNLOAD_BLOCKED"
  | "DOWNLOAD_FAILED";

export type ExportResult =
  | {
      ok: true;
      filename: string;
      orderCount: number;
      rowCount: number;
    }
  | {
      ok: false;
      code: ExportErrorCode;
      message: string;
    };

function escapeCsvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function countExportRows(orders: Order[]) {
  return orders.reduce(
    (total, order) =>
      total + Math.max(1, order.lineItems?.edges?.length ?? 0),
    0,
  );
}

function validateExport(orders: Order[]): ExportResult | null {
  if (!orders.length) {
    return {
      ok: false,
      code: "NO_ORDERS_SELECTED",
      message: "Select at least one order before exporting.",
    };
  }

  if (orders.length > MAX_EXPORT_ORDERS) {
    return {
      ok: false,
      code: "TOO_MANY_ORDERS",
      message: `You can export up to ${MAX_EXPORT_ORDERS} orders at a time. Narrow your selection and try again.`,
    };
  }

  const rowCount = countExportRows(orders);
  if (rowCount > MAX_EXPORT_ROWS) {
    return {
      ok: false,
      code: "TOO_MANY_ROWS",
      message: `This export would create ${rowCount} rows, which exceeds the ${MAX_EXPORT_ROWS} row limit. Select fewer orders and try again.`,
    };
  }

  if (
    typeof Blob === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return {
      ok: false,
      code: "BROWSER_UNSUPPORTED",
      message: "Your browser does not support file downloads from this app.",
    };
  }

  return null;
}

function orderToRows(order: Order) {
  const lineItems = order.lineItems?.edges?.map((edge) => edge.node) ?? [];
  const shopMoney = order.totalPriceSet?.shopMoney;

  const baseFields = [
    order.name ?? "",
    order.id ?? "",
    order.createdAt ? formatOrderDate(order.createdAt) : "",
    order.displayFinancialStatus ?? "",
    order.displayFulfillmentStatus ?? "",
    shopMoney?.amount ?? "",
    shopMoney?.currencyCode ?? "",
  ];

  if (lineItems.length === 0) {
    return [[...baseFields, "", "", "", ""]];
  }

  return lineItems.map((lineItem) => [
    ...baseFields,
    lineItem.title ?? "",
    getLineItemVariantLabel(lineItem),
    getLineItemSku(lineItem),
    lineItem.quantity ?? "",
  ]);
}

export function buildOrdersCsv(orders: Order[]) {
  const rows = orders.flatMap(orderToRows);
  const lines = [
    CSV_HEADERS.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  return {
    csv: `${UTF8_BOM}${lines.join("\n")}`,
    rowCount: rows.length,
  };
}

function buildExportFilename() {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `orders-export-${timestamp}.csv`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function openDownloadFallback(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank", "noopener,noreferrer");

  window.setTimeout(() => URL.revokeObjectURL(url), 5_000);

  if (!popup) {
    return false;
  }

  popup.document.title = filename;
  return true;
}

function downloadCsvFile(csv: string, filename: string): ExportResult | null {
  try {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    try {
      triggerDownload(blob, filename);
      return null;
    } catch {
      const opened = openDownloadFallback(blob, filename);
      if (!opened) {
        return {
          ok: false,
          code: "DOWNLOAD_BLOCKED",
          message:
            "The download was blocked by your browser. Allow pop-ups for this app or try again.",
        };
      }
    }

    return null;
  } catch {
    return {
      ok: false,
      code: "DOWNLOAD_FAILED",
      message: "The CSV file could not be downloaded. Please try again.",
    };
  }
}

export function exportOrdersCsv(orders: Order[]): ExportResult {
  const validationError = validateExport(orders);
  if (validationError) {
    return validationError;
  }

  let csv: string;
  let rowCount: number;

  try {
    const built = buildOrdersCsv(orders);
    csv = built.csv;
    rowCount = built.rowCount;
  } catch {
    return {
      ok: false,
      code: "BUILD_FAILED",
      message: "The export file could not be created. Please try again.",
    };
  }

  const filename = buildExportFilename();
  const downloadError = downloadCsvFile(csv, filename);
  if (downloadError) {
    return downloadError;
  }

  return {
    ok: true,
    filename,
    orderCount: orders.length,
    rowCount,
  };
}
