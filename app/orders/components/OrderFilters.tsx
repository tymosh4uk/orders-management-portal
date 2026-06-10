import { Form, useNavigate, useSearchParams } from "react-router";
import {
  FINANCIAL_FILTER_OPTIONS,
  FULFILLMENT_FILTER_OPTIONS,
  hasActiveFilters,
  STATUS_FILTER_OPTIONS,
  type OrderFilters,
} from "../filters";

type OrderFiltersProps = {
  filters: OrderFilters;
  ordersCount: number;
};

export function OrderFilters({ filters, ordersCount }: OrderFiltersProps) {
  const [searchParams] = useSearchParams();
  const active = hasActiveFilters(filters);

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
    >
      <s-stack direction="block" gap="base">
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-text type="strong">Filters</s-text>
          <s-text color="subdued">
            {ordersCount} order{ordersCount === 1 ? "" : "s"} matching
          </s-text>
          {active && (
            <Form method="get" action=".">
              <s-button type="submit" variant="tertiary">
                Clear filters
              </s-button>
            </Form>
          )}
        </s-stack>

        <s-stack direction="inline" gap="base" alignItems="end">
          <FilterField
            label="Order status"
            name="status"
            value={filters.status}
            options={STATUS_FILTER_OPTIONS}
            searchParams={searchParams}
          />
          <FilterField
            label="Payment status"
            name="financial"
            value={filters.financial}
            options={FINANCIAL_FILTER_OPTIONS}
            searchParams={searchParams}
          />
          <FilterField
            label="Fulfillment status"
            name="fulfillment"
            value={filters.fulfillment}
            options={FULFILLMENT_FILTER_OPTIONS}
            searchParams={searchParams}
          />
        </s-stack>
      </s-stack>
    </s-box>
  );
}

type FilterFieldProps<T extends string> = {
  label: string;
  name: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  searchParams: URLSearchParams;
};

function FilterField<T extends string>({
  label,
  name,
  value,
  options,
  searchParams,
}: FilterFieldProps<T>) {
  const navigate = useNavigate();

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <s-text color="subdued">{label}</s-text>
      <select
        name={name}
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams);
          params.delete("cursor");
          params.delete("before");

          const nextValue = event.currentTarget.value;
          if (nextValue === "all") {
            params.delete(name);
          } else {
            params.set(name, nextValue);
          }

          const query = params.toString();
          navigate(query ? `?${query}` : ".");
        }}
        style={{
          minWidth: "180px",
          padding: "8px 10px",
          borderRadius: "8px",
          border: "1px solid var(--p-color-border, #c9cccf)",
          background: "var(--p-color-bg-surface, #fff)",
          font: "inherit",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
