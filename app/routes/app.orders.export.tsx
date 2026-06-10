import type { LoaderFunctionArgs } from "react-router";
import { fetchAllOrders } from "../orders/fetch-all-orders.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const orders = await fetchAllOrders(request);
  return { orders };
};
