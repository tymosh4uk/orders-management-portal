import { Link } from "react-router";
import { buildOrdersListPath, type OrderFilters } from "../filters";
import type { OrdersConnection } from "../types";

type OrdersPaginationProps = {
  pageInfo: OrdersConnection["pageInfo"];
  filters: OrderFilters;
};

export function OrdersPagination({ pageInfo, filters }: OrdersPaginationProps) {
  if (!pageInfo.hasPreviousPage && !pageInfo.hasNextPage) {
    return null;
  }

  return (
    <s-stack direction="inline" gap="base" alignItems="center">
      {pageInfo.hasPreviousPage && (
        <Link
          to={buildOrdersListPath(filters, {
            before: pageInfo.startCursor,
          })}
        >
          <s-button variant="secondary">Previous</s-button>
        </Link>
      )}
      {pageInfo.hasNextPage && (
        <Link
          to={buildOrdersListPath(filters, {
            cursor: pageInfo.endCursor,
          })}
        >
          <s-button variant="secondary">Next</s-button>
        </Link>
      )}
    </s-stack>
  );
}
