import { NextRequest, NextResponse } from "next/server"
import { checkAdmin } from "@/lib/auth/check-admin"
import {
  getAdminUsers,
  getAdminVenues,
  getAdminDateInvites,
  getAdminVerifications,
} from "@/lib/actions/admin-actions"
import { toCSVString } from "shared"

const TABLES = ["users", "venues", "dates", "verifications"] as const
type TableName = (typeof TABLES)[number]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  await checkAdmin()

  const { table } = await params
  if (!TABLES.includes(table as TableName)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const format = (searchParams.get("format") ?? "csv").toLowerCase()

  let rows: Record<string, unknown>[] = []
  let filename = `${table}.csv`

  switch (table as TableName) {
    case "users":
      rows = await getAdminUsers()
      break
    case "venues":
      rows = await getAdminVenues()
      break
    case "dates":
      rows = await getAdminDateInvites()
      break
    case "verifications":
      rows = await getAdminVerifications()
      break
    default:
      return NextResponse.json({ error: "Invalid table" }, { status: 400 })
  }

  if (format === "csv") {
    const csv = toCSVString(rows)
    filename = `${table}.csv`
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  }

  if (format === "xlsx") {
    try {
      const XLSX = await import("xlsx")
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, table)
      const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
      filename = `${table}.xlsx`
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } catch {
      return NextResponse.json(
        { error: "Excel export not available. Install xlsx package." },
        { status: 501 }
      )
    }
  }

  if (format === "pdf") {
    try {
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF({ orientation: "landscape" })
      const headers = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : []
      const body = rows.map((r) => headers.map((h) => String((r as Record<string, unknown>)[h] ?? "")))
      autoTable(doc, {
        head: [headers],
        body,
        margin: { top: 10 },
      })
      const buf = Buffer.from(doc.output("arraybuffer"))
      filename = `${table}.pdf`
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } catch (e) {
      console.error("PDF export error:", e)
      return NextResponse.json(
        { error: "PDF export failed. Install jspdf and jspdf-autotable." },
        { status: 501 }
      )
    }
  }

  if (format === "docx") {
    try {
      const docx = await import("docx")
      const { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType } = docx
      const headers = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : []
      const headerRow = new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ text: h, bold: true })],
            })
        ),
      })
      const bodyRows = rows.map(
        (r) =>
          new TableRow({
            children: headers.map((h) =>
              new TableCell({
                children: [
                  new Paragraph({
                    text: String((r as Record<string, unknown>)[h] ?? ""),
                  }),
                ],
              })
            ),
          })
      )
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...bodyRows],
      })
      const doc = new Document({
        sections: [{ children: [table] }],
      })
      const buf = await Packer.toBuffer(doc)
      filename = `${table}.docx`
      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } catch (e) {
      console.error("Word export error:", e)
      return NextResponse.json(
        { error: "Word export failed. Install docx package." },
        { status: 501 }
      )
    }
  }

  return NextResponse.json(
    { error: "Unsupported format. Use csv, xlsx, pdf, or docx." },
    { status: 400 }
  )
}
