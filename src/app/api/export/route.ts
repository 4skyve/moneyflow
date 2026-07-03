import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, wallets, categories } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { formatIDR, formatDateFull } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";

  const rows = await db
    .select({
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      occurredAt: transactions.occurredAt,
      note: transactions.note,
      wallet: wallets.name,
      category: categories.name,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.userId, userId), eq(transactions.isDraft, false)))
    .orderBy(desc(transactions.occurredAt));

  if (format === "xlsx") {
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Tanggal: formatDateFull(r.occurredAt),
        Judul: r.title,
        Jenis: r.type === "income" ? "Pemasukan" : "Pengeluaran",
        Nominal: parseFloat(r.amount),
        Kategori: r.category ?? "-",
        Dompet: r.wallet ?? "-",
        Catatan: r.note ?? "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=moneyflow-transaksi.xlsx",
      },
    });
  }

  if (format === "pdf") {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    doc.fontSize(18).text("MoneyFlow — Riwayat Transaksi", { align: "left" });
    doc.moveDown();
    doc.fontSize(10);
    rows.forEach((r) => {
      doc
        .text(
          `${formatDateFull(r.occurredAt)}  |  ${r.title}  |  ${r.type === "income" ? "+" : "-"}${formatIDR(r.amount)}  |  ${r.category ?? "-"}  |  ${r.wallet ?? "-"}`
        )
        .moveDown(0.2);
    });
    doc.end();
    const buf = await done;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=moneyflow-transaksi.pdf",
      },
    });
  }

  // default CSV
  const header = "Tanggal,Judul,Jenis,Nominal,Kategori,Dompet,Catatan";
  const csvRows = rows.map((r) =>
    [
      formatDateFull(r.occurredAt),
      `"${r.title.replace(/"/g, '""')}"`,
      r.type === "income" ? "Pemasukan" : "Pengeluaran",
      r.amount,
      r.category ?? "-",
      r.wallet ?? "-",
      `"${(r.note ?? "").replace(/"/g, '""')}"`,
    ].join(",")
  );
  const csv = [header, ...csvRows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=moneyflow-transaksi.csv",
    },
  });
}
