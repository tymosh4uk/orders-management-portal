export type OrderStatusFilter = "all" | "open" | "closed" | "cancelled";

export type FinancialStatusFilter =
  | "all"
  | "paid"
  | "pending"
  | "authorized"
  | "partially_paid"
  | "partially_refunded"
  | "refunded"
  | "voided";

export type FulfillmentStatusFilter =
  | "all"
  | "fulfilled"
  | "unfulfilled"
  | "partial"
  | "scheduled"
  | "on_hold";

export type OrderFilters = {
  status: OrderStatusFilter;
  financial: FinancialStatusFilter;
  fulfillment: FulfillmentStatusFilter;
};

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  status: "all",
  financial: "all",
  fulfillment: "all",
};

const STATUS_PARAM = "status";
const FINANCIAL_PARAM = "financial";
const FULFILLMENT_PARAM = "fulfillment";

const STATUS_VALUES = new Set<OrderStatusFilter>([
  "all",
  "open",
  "closed",
  "cancelled",
]);

const FINANCIAL_VALUES = new Set<FinancialStatusFilter>([
  "all",
  "paid",
  "pending",
  "authorized",
  "partially_paid",
  "partially_refunded",
  "refunded",
  "voided",
]);

const FULFILLMENT_VALUES = new Set<FulfillmentStatusFilter>([
  "all",
  "fulfilled",
  "unfulfilled",
  "partial",
  "scheduled",
  "on_hold",
]);

function readFilterParam<T extends string>(
  value: string | null,
  allowed: Set<T>,
  fallback: T,
): T {
  if (value && allowed.has(value as T)) {
    return value as T;
  }
  return fallback;
}

export function parseOrderFilters(request: Request): OrderFilters {
  const url = new URL(request.url);

  return {
    status: readFilterParam(
      url.searchParams.get(STATUS_PARAM),
      STATUS_VALUES,
      "all",
    ),
    financial: readFilterParam(
      url.searchParams.get(FINANCIAL_PARAM),
      FINANCIAL_VALUES,
      "all",
    ),
    fulfillment: readFilterParam(
      url.searchParams.get(FULFILLMENT_PARAM),
      FULFILLMENT_VALUES,
      "all",
    ),
  };
}

export function buildOrdersSearchQuery(filters: OrderFilters): string | undefined {
  const parts: string[] = [];

  if (filters.status !== "all") {
    parts.push(`status:${filters.status}`);
  }

  if (filters.financial !== "all") {
    parts.push(`financial_status:${filters.financial}`);
  }

  if (filters.fulfillment !== "all") {
    parts.push(`fulfillment_status:${filters.fulfillment}`);
  }

  return parts.length > 0 ? parts.join(" AND ") : undefined;
}

export function hasActiveFilters(filters: OrderFilters) {
  return (
    filters.status !== "all" ||
    filters.financial !== "all" ||
    filters.fulfillment !== "all"
  );
}

export function buildOrdersListSearchParams(
  filters: OrderFilters,
  pagination?: { cursor?: string | null; before?: string | null },
) {
  const params = new URLSearchParams();

  if (filters.status !== "all") {
    params.set(STATUS_PARAM, filters.status);
  }

  if (filters.financial !== "all") {
    params.set(FINANCIAL_PARAM, filters.financial);
  }

  if (filters.fulfillment !== "all") {
    params.set(FULFILLMENT_PARAM, filters.fulfillment);
  }

  if (pagination?.before) {
    params.set("before", pagination.before);
  } else if (pagination?.cursor) {
    params.set("cursor", pagination.cursor);
  }

  return params;
}

export function buildOrdersListPath(
  filters: OrderFilters,
  pagination?: { cursor?: string | null; before?: string | null },
) {
  const params = buildOrdersListSearchParams(filters, pagination);
  const query = params.toString();
  return query ? `?${query}` : ".";
}

export const STATUS_FILTER_OPTIONS: Array<{
  value: OrderStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export const FINANCIAL_FILTER_OPTIONS: Array<{
  value: FinancialStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "refunded", label: "Refunded" },
  { value: "voided", label: "Voided" },
];

export const FULFILLMENT_FILTER_OPTIONS: Array<{
  value: FulfillmentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All fulfillment" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "partial", label: "Partially fulfilled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "on_hold", label: "On hold" },
];
