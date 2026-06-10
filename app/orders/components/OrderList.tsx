import { useState } from "react";
import type { Order, OrdersConnection } from "../types";
import { OrderCard } from "./OrderCard";
import { OrdersPagination } from "./OrdersPagination";

type OrderListProps = {
  orders: OrdersConnection;
  allSelected: boolean;
  someSelected: boolean;
  selectedIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleOrder: (orderId: string, checked: boolean) => void;
};

export function OrderList({
  orders,
  allSelected,
  someSelected,
  selectedIds,
  onToggleAll,
  onToggleOrder,
}: OrderListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const orderList = orders.edges.map((edge) => edge.node);

  const handleToggleItems = (order: Order) => {
    setExpandedId((current) => (current === order.id ? null : order.id));
  };

  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="inline" gap="base" alignItems="center">
        <s-checkbox
          accessibilityLabel="Select all orders"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            onToggleAll(target.checked);
          }}
        />
        <s-text type="strong">Select all</s-text>
      </s-stack>

      {orderList.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isSelected={selectedIds.has(order.id)}
          isExpanded={expandedId === order.id}
          onSelect={(checked) => onToggleOrder(order.id, checked)}
          onToggleItems={() => handleToggleItems(order)}
        />
      ))}

      <OrdersPagination pageInfo={orders.pageInfo} />
    </s-stack>
  );
}
