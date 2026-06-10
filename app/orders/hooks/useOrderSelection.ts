import { useCallback, useMemo, useState } from "react";
import type { Order } from "../types";

export function useOrderSelection(pageOrders: Order[], totalCount: number) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => new Set());

  const isOrderSelected = useCallback(
    (orderId: string) => {
      if (selectAllMatching) {
        return !excludedIds.has(orderId);
      }
      return selectedIds.has(orderId);
    },
    [selectAllMatching, excludedIds, selectedIds],
  );

  const selectedCount = selectAllMatching
    ? totalCount - excludedIds.size
    : selectedIds.size;

  const allPageSelected =
    pageOrders.length > 0 &&
    pageOrders.every((order) => isOrderSelected(order.id));

  const somePageSelected =
    pageOrders.some((order) => isOrderSelected(order.id)) && !allPageSelected;

  const showSelectAllBanner =
    allPageSelected && !selectAllMatching && totalCount > pageOrders.length;

  const selectedOrdersOnPage = useMemo(
    () => pageOrders.filter((order) => isOrderSelected(order.id)),
    [pageOrders, isOrderSelected],
  );

  const toggleOrder = useCallback(
    (orderId: string, checked: boolean) => {
      if (selectAllMatching) {
        setExcludedIds((previous) => {
          const next = new Set(previous);
          if (checked) {
            next.delete(orderId);
          } else {
            next.add(orderId);
          }
          return next;
        });
        return;
      }

      setSelectedIds((previous) => {
        const next = new Set(previous);
        if (checked) {
          next.add(orderId);
        } else {
          next.delete(orderId);
        }
        return next;
      });
    },
    [selectAllMatching],
  );

  const toggleAllOnPage = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectAllMatching(false);
        setExcludedIds(new Set());
        setSelectedIds(new Set(pageOrders.map((order) => order.id)));
        return;
      }

      setSelectAllMatching(false);
      setExcludedIds(new Set());
      setSelectedIds(new Set());
    },
    [pageOrders],
  );

  const selectAllMatchingOrders = useCallback(() => {
    setSelectAllMatching(true);
    setSelectedIds(new Set());
    setExcludedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectAllMatching(false);
    setSelectedIds(new Set());
    setExcludedIds(new Set());
  }, []);

  const needsFullOrderFetch =
    selectAllMatching || selectedIds.size > selectedOrdersOnPage.length;

  return {
    selectedIds,
    excludedIds,
    selectAllMatching,
    selectedCount,
    selectedOrdersOnPage,
    allPageSelected,
    somePageSelected,
    showSelectAllBanner,
    needsFullOrderFetch,
    isOrderSelected,
    toggleOrder,
    toggleAllOnPage,
    selectAllMatchingOrders,
    clearSelection,
  };
}
