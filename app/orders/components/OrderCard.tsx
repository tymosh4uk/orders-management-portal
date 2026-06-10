import { formatOrderDate, formatShopMoney } from "../format";
import type { Order } from "../types";
import { OrderLineItemsTable } from "./OrderLineItemsTable";

type OrderCardProps = {
  order: Order;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (checked: boolean) => void;
  onToggleItems: () => void;
};

export function OrderCard({
  order,
  isSelected,
  isExpanded,
  onSelect,
  onToggleItems,
}: OrderCardProps) {
  const lineItems = order.lineItems.edges.map((edge) => edge.node);

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background={isSelected ? "subdued" : "base"}
    >
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-checkbox
            accessibilityLabel={`Select order ${order.name}`}
            checked={isSelected}
            onChange={(event) => {
              const target = event.target as HTMLInputElement;
              onSelect(target.checked);
            }}
          />
          <s-stack direction="block" gap="small-100">
            <s-text type="strong">{order.name}</s-text>
            <s-text color="subdued">{formatOrderDate(order.createdAt)}</s-text>
          </s-stack>
          <s-badge tone="info">{order.displayFinancialStatus}</s-badge>
          <s-badge tone="neutral">{order.displayFulfillmentStatus}</s-badge>
          <s-text>{formatShopMoney(order.totalPriceSet.shopMoney)}</s-text>
          <s-text>
            {lineItems.length} item{lineItems.length === 1 ? "" : "s"}
          </s-text>
          <s-button variant="tertiary" onClick={onToggleItems}>
            {isExpanded ? "Hide items" : "View items"}
          </s-button>
        </s-stack>

        {isExpanded && <OrderLineItemsTable lineItems={lineItems} />}
      </s-stack>
    </s-box>
  );
}
