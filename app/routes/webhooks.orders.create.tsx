import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { saveGeneratedMessageToOrder } from "../orders/save-generated-message.server";

type OrdersCreatePayload = {
  admin_graphql_api_id?: string;
  name?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, payload, session, shop, topic } =
    await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (!session) {
    return new Response();
  }

  const orderPayload = payload as OrdersCreatePayload;
  const orderId = orderPayload.admin_graphql_api_id;

  if (!orderId) {
    console.error("orders/create webhook missing admin_graphql_api_id");
    return new Response("Missing order id", { status: 400 });
  }

  if (!admin) {
    console.error("orders/create webhook missing admin API context");
    return new Response("Missing admin context", { status: 500 });
  }

  try {
    const message = await saveGeneratedMessageToOrder(admin, orderId);
    console.log(
      `Saved generated message to ${orderPayload.name ?? orderId}: ${message.slice(0, 80)}...`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to save generated message for ${orderId}:`, message);
    return new Response(message, { status: 500 });
  }

  return new Response();
};
