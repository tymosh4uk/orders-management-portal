import type { ShopMoney } from "./types";

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function getMoneyFormatter(currencyCode: string) {
  const cached = moneyFormatters.get(currencyCode);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  moneyFormatters.set(currencyCode, formatter);
  return formatter;
}

export function formatShopMoney({ amount, currencyCode }: ShopMoney) {
  return getMoneyFormatter(currencyCode).format(Number(amount));
}

export function formatOrderDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
