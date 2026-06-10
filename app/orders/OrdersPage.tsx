import { useCallback, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ProtectedDataBanner } from "./components/ProtectedDataBanner";
import { OrderList } from "./components/OrderList";
import { SelectionSummary } from "./components/SelectionSummary";
import { exportOrdersCsv } from "./export-csv";
import { useOrderSelection } from "./hooks/useOrderSelection";
import type { OrdersLoaderData } from "./types";

export default function OrdersPage() {
  const { orders, accessError } = useLoaderData<OrdersLoaderData>();
  const shopify = useAppBridge();

  const orderList = useMemo(
    () => orders?.edges.map((edge) => edge.node) ?? [],
    [orders],
  );

  const {
    selectedIds,
    selectedOrders,
    allSelected,
    someSelected,
    toggleOrder,
    toggleAll,
    clearSelection,
  } = useOrderSelection(orderList);

  const handleClearSelection = useCallback(() => {
    clearSelection();
    shopify.toast.show("Selection cleared");
  }, [clearSelection, shopify]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = useCallback(() => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const result = exportOrdersCsv(selectedOrders);

      if (!result.ok) {
        shopify.toast.show(result.message, { isError: true });
        return;
      }

      shopify.toast.show(
        `Exported ${result.orderCount} order${result.orderCount === 1 ? "" : "s"} (${result.rowCount} row${result.rowCount === 1 ? "" : "s"}) to ${result.filename}`,
      );
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, selectedOrders, shopify]);

  return (
    <s-page heading="Orders">
      {selectedIds.size > 0 && (
        <s-button-group slot="primary-action" gap="base">
          <s-button
            variant="primary"
            onClick={handleExportCsv}
            {...(isExporting ? { loading: true } : {})}
          >
            Export CSV ({selectedIds.size})
          </s-button>
          <s-button variant="secondary" onClick={handleClearSelection}>
            Clear selection
          </s-button>
        </s-button-group>
      )}

      {accessError && <ProtectedDataBanner message={accessError} />}

      <s-section heading="All orders">
        <s-stack direction="block" gap="base">
          <SelectionSummary
            orders={selectedOrders}
            isExporting={isExporting}
            onExport={handleExportCsv}
            onClear={handleClearSelection}
          />

          {!accessError && orderList.length === 0 && (
            <s-paragraph>No orders found in this store.</s-paragraph>
          )}

          {!accessError && orders && orderList.length > 0 && (
            <OrderList
            orders={orders}
            allSelected={allSelected}
            someSelected={someSelected}
            selectedIds={selectedIds}
            onToggleAll={toggleAll}
            onToggleOrder={toggleOrder}
          />
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
