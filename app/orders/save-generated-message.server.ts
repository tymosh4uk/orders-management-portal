import {
  GENERATED_MESSAGE_METAFIELD_KEY,
  generateOrderMessage,
} from "./generated-message";

const SET_ORDER_MESSAGE_MUTATION = `#graphql
  mutation SetOrderGeneratedMessage($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
      }
      userErrors {
        field
        message
      }
    }
  }`;

type AdminGraphqlClient = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

type MetafieldsSetResponse = {
  data?: {
    metafieldsSet?: {
      metafields?: Array<{ id: string; key: string }>;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  };
  errors?: Array<{ message: string }>;
};

export async function saveGeneratedMessageToOrder(
  admin: AdminGraphqlClient,
  orderId: string,
) {
  const message = generateOrderMessage();

  const response = await admin.graphql(SET_ORDER_MESSAGE_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: orderId,
          key: GENERATED_MESSAGE_METAFIELD_KEY,
          value: message,
        },
      ],
    },
  });

  const body = (await response.json()) as MetafieldsSetResponse;

  if (body.errors?.length) {
    throw new Error(
      body.errors.map((error) => error.message).join(", "),
    );
  }

  const userErrors = body.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(
      userErrors.map((error) => error.message).join(", "),
    );
  }

  return message;
}
