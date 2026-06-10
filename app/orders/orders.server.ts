import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  buildOrdersSearchQuery,
  DEFAULT_ORDER_FILTERS,
  parseOrderFilters,
} from "./filters";
import { ORDERS_LIST_QUERY, ORDERS_PAGE_SIZE } from "./queries";
import {
  isProtectedCustomerDataError,
  PROTECTED_CUSTOMER_DATA_MESSAGE,
} from "./protected-data";
import type { OrdersConnection, OrdersLoaderData } from "./types";

type OrdersQueryResponse = {
  data?: {
    orders: OrdersConnection;
    ordersCount: { count: number };
  };
  errors?: Array<{ message: string }>;
};

function getPaginationVariables(request: Request) {
  const url = new URL(request.url);
  const before = url.searchParams.get("before");

  if (before) {
    return { last: ORDERS_PAGE_SIZE, before };
  }

  return { first: ORDERS_PAGE_SIZE, after: url.searchParams.get("cursor") };
}

function protectedDataLoaderResult(
  filters = DEFAULT_ORDER_FILTERS,
): OrdersLoaderData {
  return {
    orders: null,
    ordersCount: 0,
    filters,
    accessError: PROTECTED_CUSTOMER_DATA_MESSAGE,
  };
}

export async function loadOrders(request: Request): Promise<OrdersLoaderData> {
  const { admin } = await authenticate.admin(request);
  const filters = parseOrderFilters(request);
  const searchQuery = buildOrdersSearchQuery(filters);

  try {
    const response = await admin.graphql(ORDERS_LIST_QUERY, {
      variables: {
        ...getPaginationVariables(request),
        query: searchQuery,
      },
    });
    const body = (await response.json()) as OrdersQueryResponse;

    if (body.errors?.length) {
      const message = body.errors.map((error) => error.message).join(", ");
      if (isProtectedCustomerDataError(message)) {
        return protectedDataLoaderResult(filters);
      }
      throw new Response(message, { status: 500 });
    }

    return {
      orders: body.data!.orders,
      ordersCount: body.data!.ordersCount.count,
      filters,
      accessError: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isProtectedCustomerDataError(message)) {
      return protectedDataLoaderResult(filters);
    }
    throw error;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) =>
  loadOrders(request);

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
