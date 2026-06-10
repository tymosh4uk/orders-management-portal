type ProtectedDataBannerProps = {
  message: string;
};

export function ProtectedDataBanner({ message }: ProtectedDataBannerProps) {
  return (
    <s-banner heading="Protected customer data access required" tone="warning">
      <s-stack direction="block" gap="base">
        <s-paragraph>{message}</s-paragraph>
        <s-ordered-list>
          <s-list-item>
            Open{" "}
            <s-link href="https://partners.shopify.com" target="_blank">
              Partner Dashboard
            </s-link>{" "}
            → Apps → orders management portal → API access requests
          </s-list-item>
          <s-list-item>
            Under Protected customer data access, click Request access
          </s-list-item>
          <s-list-item>
            Select Protected customer data, explain that the app lists and
            manages orders, then save
          </s-list-item>
          <s-list-item>
            Reinstall the app on your dev store (or run dev and accept new
            permissions)
          </s-list-item>
        </s-ordered-list>
        <s-paragraph>
          See{" "}
          <s-link
            href="https://shopify.dev/docs/apps/launch/protected-customer-data"
            target="_blank"
          >
            Shopify&apos;s protected customer data guide
          </s-link>{" "}
          for details. Dev-store apps can use order data after this step without
          App Store review.
        </s-paragraph>
      </s-stack>
    </s-banner>
  );
}
