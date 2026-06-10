type SelectionSummaryProps = {
  selectedCount: number;
  selectAllMatching: boolean;
  isExporting: boolean;
  onExport: () => void;
  onClear: () => void;
};

export function SelectionSummary({
  selectedCount,
  selectAllMatching,
  isExporting,
  onExport,
  onClear,
}: SelectionSummaryProps) {
  if (selectedCount === 0) return null;

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
    >
      <s-stack direction="inline" gap="base" alignItems="center">
        <s-text type="strong">
          {selectedCount} order{selectedCount === 1 ? "" : "s"} selected
          {selectAllMatching ? " (all pages)" : ""}
        </s-text>
        <s-button
          variant="primary"
          onClick={onExport}
          {...(isExporting ? { loading: true } : {})}
        >
          Export to CSV
        </s-button>
        <s-button variant="secondary" onClick={onClear}>
          Clear selection
        </s-button>
      </s-stack>
    </s-box>
  );
}
