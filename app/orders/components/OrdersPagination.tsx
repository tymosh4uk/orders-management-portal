import { Link } from "react-router";
import type { OrdersConnection } from "../types";

type OrdersPaginationProps = {
  pageInfo: OrdersConnection["pageInfo"];
};

export function OrdersPagination({ pageInfo }: OrdersPaginationProps) {
  if (!pageInfo.hasPreviousPage && !pageInfo.hasNextPage) {
    return null;
  }

  return (
    <s-stack direction="inline" gap="base" alignItems="center">
      {pageInfo.hasPreviousPage && (
        <Link
          to={`?before=${encodeURIComponent(pageInfo.startCursor ?? "")}`}
        >
          <s-button variant="secondary">Previous</s-button>
        </Link>
      )}
      {pageInfo.hasNextPage && (
        <Link to={`?cursor=${encodeURIComponent(pageInfo.endCursor ?? "")}`}>
          <s-button variant="secondary">Next</s-button>
        </Link>
      )}
    </s-stack>
  );
}
