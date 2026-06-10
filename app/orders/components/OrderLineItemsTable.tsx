import { getLineItemSku, getLineItemVariantLabel } from "../line-item";
import type { LineItem } from "../types";

type OrderLineItemsTableProps = {
  lineItems: LineItem[];
};

export function OrderLineItemsTable({ lineItems }: OrderLineItemsTableProps) {
  return (
    <s-table variant="auto">
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header listSlot="labeled">Variant</s-table-header>
        <s-table-header listSlot="labeled">SKU</s-table-header>
        <s-table-header listSlot="labeled">Qty</s-table-header>
      </s-table-header-row>
      <s-table-body>
        {lineItems.map((lineItem) => (
          <s-table-row key={lineItem.id}>
            <s-table-cell>{lineItem.title}</s-table-cell>
            <s-table-cell>{getLineItemVariantLabel(lineItem)}</s-table-cell>
            <s-table-cell>{getLineItemSku(lineItem)}</s-table-cell>
            <s-table-cell>{lineItem.quantity}</s-table-cell>
          </s-table-row>
        ))}
      </s-table-body>
    </s-table>
  );
}
