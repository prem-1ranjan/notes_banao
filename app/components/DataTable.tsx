import { ReactNode } from "react";

type DataTableProps<T> = {
  columns: string[];
  rows: T[];
  empty: string;
  renderRow: (row: T, index: number) => ReactNode;
  /** Optional summary row (a single <tr>), rendered in a tfoot below the rows. */
  footer?: ReactNode;
};

export function DataTable<T>({ columns, rows, empty, renderRow, footer }: DataTableProps<T>) {
  return (
    <div className="staff-table-wrap">
      <table className="staff-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map(renderRow) : (
            <tr>
              <td className="staff-empty-cell" colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
        {footer && rows.length ? <tfoot>{footer}</tfoot> : null}
      </table>
    </div>
  );
}
