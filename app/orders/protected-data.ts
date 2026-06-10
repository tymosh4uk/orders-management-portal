export const PROTECTED_CUSTOMER_DATA_MESSAGE =
  "This app needs Protected customer data access enabled in the Partner Dashboard before it can read orders.";

export function isProtectedCustomerDataError(message: string) {
  return (
    message.includes("not approved to access the Order object") ||
    message.includes("protected customer data") ||
    message.includes("not approved to access")
  );
}
