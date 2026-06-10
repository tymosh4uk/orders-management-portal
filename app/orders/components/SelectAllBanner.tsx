type SelectAllBannerProps = {
  pageCount: number;
  totalCount: number;
  onSelectAllMatching: () => void;
};

export function SelectAllBanner({
  pageCount,
  totalCount,
  onSelectAllMatching,
}: SelectAllBannerProps) {
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
    >
      <s-stack direction="inline" gap="small-200" alignItems="center">
        <s-text>
          All {pageCount} order{pageCount === 1 ? "" : "s"} on this page{" "}
          {pageCount === 1 ? "is" : "are"} selected.
        </s-text>
        <s-button variant="tertiary" onClick={onSelectAllMatching}>
          Select all {totalCount} order{totalCount === 1 ? "" : "s"}
        </s-button>
      </s-stack>
    </s-box>
  );
}
