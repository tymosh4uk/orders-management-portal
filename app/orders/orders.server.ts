import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ORDERS_LIST_QUERY, ORDERS_PAGE_SIZE } from "./queries";
import {
  isProtectedCustomerDataError,
  PROTECTED_CUSTOMER_DATA_MESSAGE,
} from "./protected-data";
import type { OrdersConnection, OrdersLoaderData } from "./types";

type OrdersQueryResponse = {
  data?: { orders: OrdersConnection };
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

function protectedDataLoaderResult(): OrdersLoaderData {
  return { orders: null, accessError: PROTECTED_CUSTOMER_DATA_MESSAGE };
}

export async function loadOrders(request: Request): Promise<OrdersLoaderData> {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(ORDERS_LIST_QUERY, {
      variables: getPaginationVariables(request),
    });
    const body = (await response.json()) as OrdersQueryResponse;

    if (body.errors?.length) {
      const message = body.errors.map((error) => error.message).join(", ");
      if (isProtectedCustomerDataError(message)) {
        return protectedDataLoaderResult();
      }
      throw new Response(message, { status: 500 });
    }

    return { orders: body.data!.orders, accessError: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isProtectedCustomerDataError(message)) {
      return protectedDataLoaderResult();
    }
    throw error;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) =>
  loadOrders(request);

export const headers: HeadersFunction = (headersArgs) =>
  boundary.headers(headersArgs);
