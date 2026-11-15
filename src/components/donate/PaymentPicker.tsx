/**
 * Compact pickers shared by the home quick-donate and the /donate page: the payment method as a
 * dropdown (one line instead of a grid of cards), and, for bank transfer with several accounts,
 * which bank to transfer to. What is offered (methods, banks, account numbers, IBANs) comes only
 * from the dashboard («طرق الدفع»).
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentBrandIcon } from "@/components/donate/PaymentBrandLogos";
import type { PayoutDestination } from "@/data/paymentOptions";

export interface PickerMethod {
  id: string;
  label: string;
  note?: string;
  /** PaymentBrandIcon key (e.g. "vodafone_cash", "bank_cib", "delegate_pickup"). */
  iconKey: string;
}

const triggerCls =
  "h-auto min-h-[56px] w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-start transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 data-[state=open]:border-primary";

function Row({ iconKey, label, note }: { iconKey: string; label: string; note?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-white px-1.5 dark:bg-card">
        <PaymentBrandIcon methodKey={iconKey} className="h-5 w-auto max-w-full object-contain" />
      </span>
      <span className="min-w-0 text-start">
        <span className="block truncate text-sm font-black text-primary">{label}</span>
        {note && <span className="block truncate text-xs font-medium text-muted-foreground">{note}</span>}
      </span>
    </span>
  );
}

export function PaymentMethodSelect({
  methods, value, onChange, isAr, id,
}: { methods: PickerMethod[]; value: string; onChange: (id: string) => void; isAr: boolean; id?: string }) {
  return (
    <Select value={value} onValueChange={onChange} dir={isAr ? "rtl" : "ltr"}>
      <SelectTrigger id={id} className={triggerCls} aria-label={isAr ? "طريقة الدفع" : "Payment method"}>
        <SelectValue placeholder={isAr ? "اختر طريقة الدفع" : "Choose a payment method"} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {methods.map((m) => (
          <SelectItem key={m.id} value={m.id} className="py-2">
            <Row iconKey={m.iconKey} label={m.label} note={m.note} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Short bank name for the picker: the name typed in the dashboard, else the bank code. */
export const bankTitle = (d: PayoutDestination) => d.bankName || (d.bankCode ?? "").toUpperCase() || "—";

/** Which bank account to transfer to (shown only when the dashboard lists more than one). */
export function BankAccountSelect({
  accounts, value, onChange, isAr, id,
}: { accounts: PayoutDestination[]; value: number; onChange: (index: number) => void; isAr: boolean; id?: string }) {
  if (accounts.length < 2) return null;
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))} dir={isAr ? "rtl" : "ltr"}>
      <SelectTrigger id={id} className={triggerCls} aria-label={isAr ? "البنك" : "Bank"}>
        <SelectValue placeholder={isAr ? "اختر البنك" : "Choose a bank"} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {accounts.map((d, i) => (
          <SelectItem key={`${d.bankCode}-${d.value}`} value={String(i)} className="py-2">
            <Row
              iconKey={`bank_${d.bankCode ?? "other"}`}
              label={bankTitle(d)}
              note={`${isAr ? "حساب" : "Account"} …${d.value.slice(-4)}${d.iban ? " · IBAN" : ""}`}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
