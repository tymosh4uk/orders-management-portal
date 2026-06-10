import { useCallback, useMemo, useState } from "react";
import type { Order } from "../types";

export function useOrderSelection(orders: Order[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const allSelected =
    orders.length > 0 && selectedIds.size === orders.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < orders.length;

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.has(order.id)),
    [orders, selectedIds],
  );

  const toggleOrder = useCallback((orderId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(
        checked ? new Set(orders.map((order) => order.id)) : new Set(),
      );
    },
    [orders],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedOrders,
    allSelected,
    someSelected,
    toggleOrder,
    toggleAll,
    clearSelection,
  };
}
