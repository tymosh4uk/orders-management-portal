import { authenticate } from "../shopify.server";
import { buildOrdersSearchQuery, parseOrderFilters } from "./filters";
import { ORDERS_LIST_QUERY } from "./queries";
import type { Order, OrdersConnection } from "./types";

const FETCH_BATCH_SIZE = 50;
export const MAX_FETCH_ORDERS = 250;

type OrdersQueryResponse = {
  data?: { orders: OrdersConnection };
  errors?: Array<{ message: string }>;
};

export async function fetchAllOrders(request: Request, max = MAX_FETCH_ORDERS) {
  const { admin } = await authenticate.admin(request);
  const filters = parseOrderFilters(request);
  const searchQuery = buildOrdersSearchQuery(filters);
  const orders: Order[] = [];
  let cursor: string | null = null;

  while (orders.length < max) {
    const first = Math.min(FETCH_BATCH_SIZE, max - orders.length);
    const response = await admin.graphql(ORDERS_LIST_QUERY, {
      variables: { first, after: cursor, query: searchQuery },
    });
    const body = (await response.json()) as OrdersQueryResponse;

    if (body.errors?.length) {
      throw new Response(body.errors.map((error) => error.message).join(", "), {
        status: 500,
      });
    }

    const connection = body.data!.orders;
    orders.push(...connection.edges.map((edge) => edge.node));

    if (!connection.pageInfo.hasNextPage || connection.edges.length === 0) {
      break;
    }

    cursor = connection.pageInfo.endCursor;
  }

  return orders;
}
