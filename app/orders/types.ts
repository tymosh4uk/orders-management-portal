export type LineItem = {
  id: string;
  title: string;
  quantity: number;
  variantTitle: string | null;
  sku: string | null;
  variant: {
    id: string;
    title: string;
    sku: string | null;
    selectedOptions: Array<{ name: string; value: string }>;
  } | null;
};

export type ShopMoney = {
  amount: string;
  currencyCode: string;
};

export type Order = {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: {
    shopMoney: ShopMoney;
  };
  lineItems: { edges: Array<{ node: LineItem }> };
};

export type OrdersConnection = {
  edges: Array<{ cursor: string; node: Order }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
};

export type OrdersLoaderData = {
  orders: OrdersConnection | null;
  accessError: string | null;
};
