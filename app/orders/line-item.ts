import type { LineItem } from "./types";

export function getLineItemVariantLabel(lineItem: LineItem) {
  const options = lineItem.variant?.selectedOptions;
  if (options?.length) {
    return options.map((option) => `${option.name}: ${option.value}`).join(", ");
  }

  return lineItem.variantTitle || lineItem.variant?.title || "Default";
}

export function getLineItemSku(lineItem: LineItem) {
  return lineItem.variant?.sku || lineItem.sku || "—";
}
