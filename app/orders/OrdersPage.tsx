import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { OrderFilters } from "./components/OrderFilters";
import { ProtectedDataBanner } from "./components/ProtectedDataBanner";
import { OrderList } from "./components/OrderList";
import { SelectionSummary } from "./components/SelectionSummary";
import { exportOrdersCsv } from "./export-csv";
import { hasActiveFilters } from "./filters";
import { useOrderSelection } from "./hooks/useOrderSelection";
import type { Order, OrdersLoaderData } from "./types";

async function fetchOrdersForExport(search: string) {
  const response = await fetch(
    `/app/orders/export${search ? `?${search}` : ""}`,
  );
  if (!response.ok) {
    throw new Error("Failed to load orders for export.");
  }

  const data = (await response.json()) as { orders: Order[] };
  return data.orders;
}

export default function OrdersPage() {
  const { orders, ordersCount, filters, accessError } =
    useLoaderData<OrdersLoaderData>();
  const [searchParams] = useSearchParams();
  const shopify = useAppBridge();

  const orderList = useMemo(
    () => orders?.edges.map((edge) => edge.node) ?? [],
    [orders],
  );

  const {
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
  } = useOrderSelection(orderList, ordersCount);

  useEffect(() => {
    clearSelection();
  }, [searchParams.toString(), clearSelection]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
    shopify.toast.show("Selection cleared");
  }, [clearSelection, shopify]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      let ordersToExport: Order[];
      const filterQuery = searchParams.toString();

      if (needsFullOrderFetch) {
        const allOrders = await fetchOrdersForExport(filterQuery);
        ordersToExport = selectAllMatching
          ? allOrders.filter((order) => !excludedIds.has(order.id))
          : allOrders.filter((order) => selectedIds.has(order.id));
      } else {
        ordersToExport = selectedOrdersOnPage;
      }

      const result = exportOrdersCsv(ordersToExport);

      if (!result.ok) {
        shopify.toast.show(result.message, { isError: true });
        return;
      }

      shopify.toast.show(
        `Exported ${result.orderCount} order${result.orderCount === 1 ? "" : "s"} (${result.rowCount} row${result.rowCount === 1 ? "" : "s"}) to ${result.filename}`,
      );
    } catch {
      shopify.toast.show("Failed to load orders for export.", {
        isError: true,
      });
    } finally {
      setIsExporting(false);
    }
  }, [
    isExporting,
    needsFullOrderFetch,
    selectAllMatching,
    excludedIds,
    selectedIds,
    selectedOrdersOnPage,
    searchParams,
    shopify,
  ]);

  const emptyMessage = hasActiveFilters(filters)
    ? "No orders match the current filters."
    : "No orders found in this store.";

  return (
    <s-page heading="Orders">
      {selectedCount > 0 && (
        <s-button-group slot="primary-action" gap="base">
          <s-button
            variant="primary"
            onClick={handleExportCsv}
            {...(isExporting ? { loading: true } : {})}
          >
            Export CSV ({selectedCount})
          </s-button>
          <s-button variant="secondary" onClick={handleClearSelection}>
            Clear selection
          </s-button>
        </s-button-group>
      )}

      {accessError && <ProtectedDataBanner message={accessError} />}

      <s-section heading="All orders">
        <s-stack direction="block" gap="base">
          {!accessError && (
            <OrderFilters filters={filters} ordersCount={ordersCount} />
          )}

          <SelectionSummary
            selectedCount={selectedCount}
            selectAllMatching={selectAllMatching}
            isExporting={isExporting}
            onExport={handleExportCsv}
            onClear={handleClearSelection}
          />

          {!accessError && orderList.length === 0 && (
            <s-paragraph>{emptyMessage}</s-paragraph>
          )}

          {!accessError && orders && orderList.length > 0 && (
            <OrderList
              orders={orders}
              filters={filters}
              totalCount={ordersCount}
              allPageSelected={allPageSelected}
              somePageSelected={somePageSelected}
              showSelectAllBanner={showSelectAllBanner}
              isOrderSelected={isOrderSelected}
              onToggleAllOnPage={toggleAllOnPage}
              onSelectAllMatching={selectAllMatchingOrders}
              onToggleOrder={toggleOrder}
            />
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
