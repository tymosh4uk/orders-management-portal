import type { Order } from "./types";

export function isOrderCancelled(order: Order) {
  return Boolean(order.cancelledAt);
}
