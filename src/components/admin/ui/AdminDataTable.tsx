import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

const ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;

/**
 * Generic, presentational data table reused by every collection list.
 * Selection is optional (drives AdminBulkActionBar) — passed in from a client
 * wrapper so this component stays render-only.
 */
export function AdminDataTable<T>({
  columns,
  rows,
  getRowId,
  selectable = false,
  selectedIds,
  onToggleRow,
  onToggleAll,
  empty,
  minWidth = "720px",
}: {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  empty?: ReactNode;
  /** Minimum table width before horizontal scroll kicks in. Defaults to 720px. */
  minWidth?: string;
}) {
  const allChecked = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(getRowId(r)));

  if (rows.length === 0 && empty) {
    return <div className="rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card">{empty}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card shadow-xs">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-dz-primary-100 dark:border-dz-night-border bg-dz-primary-50/60 dark:bg-white/5 text-xs font-medium text-dz-primary-500 dark:text-dz-night-muted">
            {selectable && (
              <th className="w-10 px-3 py-3.5 text-center">
                <input
                  type="checkbox"
                  aria-label="انتخاب همه"
                  checked={allChecked}
                  onChange={(e) => onToggleAll?.(e.target.checked)}
                  className="size-4 cursor-pointer accent-dz-primary-600"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-3.5 font-medium ${ALIGN[col.align ?? "start"]} ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row);
            const checked = selectedIds?.has(id) ?? false;
            return (
              <tr
                key={id}
                className={`border-b border-dz-primary-50 dark:border-dz-night-border transition-colors last:border-0 hover:bg-dz-primary-50/40 dark:hover:bg-white/5 ${
                  checked ? "bg-dz-primary-50/60 dark:bg-white/5" : ""
                }`}
              >
                {selectable && (
                  <td className="px-3 py-3.5 text-center">
                    <input
                      type="checkbox"
                      aria-label="انتخاب ردیف"
                      checked={checked}
                      onChange={() => onToggleRow?.(id)}
                      className="size-4 cursor-pointer accent-dz-primary-600"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3.5 align-middle text-dz-primary-800 dark:text-dz-night-fg ${ALIGN[col.align ?? "start"]} ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
