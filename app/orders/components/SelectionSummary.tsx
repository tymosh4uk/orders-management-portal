import type { Order } from "../types";

type SelectionSummaryProps = {
  orders: Order[];
  isExporting: boolean;
  onExport: () => void;
  onClear: () => void;
};

export function SelectionSummary({
  orders,
  isExporting,
  onExport,
  onClear,
}: SelectionSummaryProps) {
  if (orders.length === 0) return null;

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
    >
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-text type="strong">
            {orders.length} order{orders.length === 1 ? "" : "s"} selected
          </s-text>
          <s-button
            variant="primary"
            onClick={onExport}
            {...(isExporting ? { loading: true } : {})}
          >
            Export to CSV
          </s-button>
          <s-button variant="secondary" onClick={onClear}>
            Clear selection
          </s-button>
        </s-stack>
        <s-unordered-list>
          {orders.map((order) => (
            <s-list-item key={order.id}>{order.name}</s-list-item>
          ))}
        </s-unordered-list>
      </s-stack>
    </s-box>
  );
}
