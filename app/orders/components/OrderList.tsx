import { useState } from "react";
import type { OrderFilters } from "../filters";
import type { Order, OrdersConnection } from "../types";
import { OrderCard } from "./OrderCard";
import { OrdersPagination } from "./OrdersPagination";
import { SelectAllBanner } from "./SelectAllBanner";

type OrderListProps = {
  orders: OrdersConnection;
  filters: OrderFilters;
  totalCount: number;
  allPageSelected: boolean;
  somePageSelected: boolean;
  showSelectAllBanner: boolean;
  isOrderSelected: (orderId: string) => boolean;
  onToggleAllOnPage: (checked: boolean) => void;
  onSelectAllMatching: () => void;
  onToggleOrder: (orderId: string, checked: boolean) => void;
};

export function OrderList({
  orders,
  filters,
  totalCount,
  allPageSelected,
  somePageSelected,
  showSelectAllBanner,
  isOrderSelected,
  onToggleAllOnPage,
  onSelectAllMatching,
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
          accessibilityLabel="Select all orders on this page"
          checked={allPageSelected}
          indeterminate={somePageSelected}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            onToggleAllOnPage(target.checked);
          }}
        />
        <s-text type="strong">Select all</s-text>
      </s-stack>

      {showSelectAllBanner && (
        <SelectAllBanner
          pageCount={orderList.length}
          totalCount={totalCount}
          onSelectAllMatching={onSelectAllMatching}
        />
      )}

      {orderList.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isSelected={isOrderSelected(order.id)}
          isExpanded={expandedId === order.id}
          onSelect={(checked) => onToggleOrder(order.id, checked)}
          onToggleItems={() => handleToggleItems(order)}
        />
      ))}

      <OrdersPagination pageInfo={orders.pageInfo} filters={filters} />
    </s-stack>
  );
}
