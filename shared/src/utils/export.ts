/**
 * Export utilities for admin table data (CSV). Excel/PDF/Word are done server-side.
 */

/**
 * Escape a CSV cell: wrap in quotes and escape internal quotes.
 */
function escapeCsvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build CSV string from an array of row objects. Uses first row's keys as headers if columns not provided.
 */
export function toCSVString(
  rows: Record<string, unknown>[],
  columns?: string[]
): string {
  if (rows.length === 0) {
    return columns && columns.length > 0 ? columns.join(",") + "\n" : "";
  }
  const headers = columns ?? Object.keys(rows[0] as Record<string, unknown>);
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell((row as Record<string, unknown>)[h])).join(","));
  }
  return lines.join("\n");
}
