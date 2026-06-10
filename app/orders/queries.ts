export const ORDERS_LIST_QUERY = `#graphql
  query OrdersList($first: Int, $after: String, $last: Int, $before: String) {
    orders(
      first: $first
      after: $after
      last: $last
      before: $before
      sortKey: CREATED_AT
      reverse: true
    ) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 25) {
            edges {
              node {
                id
                title
                quantity
                variantTitle
                sku
                variant {
                  id
                  title
                  sku
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }`;

export const ORDERS_PAGE_SIZE = 20;
