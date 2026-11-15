import { ExternalLink, FileText, ImageIcon, Package } from "lucide-react";
import type { DonationLine } from "@/lib/donationLines";

const money = (n: number, isAr: boolean) => `${Math.round(n).toLocaleString("en-US")} ${isAr ? "ج.م" : "EGP"}`;

/** What one donation was made of, shown like the products of an order. */
export function DonationLinesTable({ lines, total, isAr }: { lines: DonationLine[]; total: number; isAr: boolean }) {
  if (!lines.length) return null;
  const sum = lines.reduce((a, l) => a + (Number(l.amount) || 0), 0);
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 text-xs font-black text-primary">
        <Package className="h-3.5 w-3.5" />
        {isAr ? `بنود التبرع (${lines.length})` : `Donation items (${lines.length})`}
      </div>
      <ul className="divide-y divide-border/50">
        {lines.map((l, i) => (
          <li key={i} className="flex items-start justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-black text-foreground leading-snug">{l.target}</p>
              {(l.choice || (l.qty && l.qty > 1)) && (
                <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                  {l.choice}
                  {l.qty && l.qty > 1 ? <span className="ms-1.5 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-black text-accent">×{l.qty}</span> : null}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-black tabular-nums text-foreground">
              {l.amount > 0 ? money(l.amount, isAr) : "—"}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-2 text-xs font-black">
        <span className="text-muted-foreground">{isAr ? "الإجمالي" : "Total"}</span>
        <span className="tabular-nums text-primary">{money(total || sum, isAr)}</span>
      </div>
      {total > 0 && sum > 0 && Math.round(sum) !== Math.round(total) && (
        <p className="border-t border-border/60 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
          {isAr ? `مجموع البنود ${money(sum, isAr)} ومبلغ التبرع ${money(total, isAr)}` : `Items add up to ${money(sum, isAr)}, the donation is ${money(total, isAr)}`}
        </p>
      )}
    </div>
  );
}

/** The transfer receipt the donor attached (image preview, or a link for a PDF). */
export function DonationReceiptFile({ url, isAr }: { url: string; isAr: boolean }) {
  const isPdf = /\.pdf(\?|$)/i.test(url);
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-black text-primary">
          {isPdf ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {isAr ? "إيصال التحويل المرفق من المتبرع" : "Transfer receipt from the donor"}
        </h2>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          {isAr ? "فتح في صفحة جديدة" : "Open"} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {isPdf ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-primary hover:bg-muted/40">
          <FileText className="h-5 w-5" /> {isAr ? "ملف PDF — اضغط للفتح" : "PDF file — open"}
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={url} alt={isAr ? "إيصال التحويل" : "Transfer receipt"} className="max-h-[480px] w-auto max-w-full rounded-xl border border-border object-contain" loading="lazy" />
        </a>
      )}
    </section>
  );
}
