import Link from "next/link";
import QRCode from "qrcode";
import { getInvoiceByPaymentToken } from "@/lib/db-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pay Invoice — NormInvoice",
  robots: { index: false, follow: false },
};

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function buildEpcSepaPayload(inv: NonNullable<ReturnType<typeof getInvoiceByPaymentToken>>, amount: number): string | null {
  const iban = inv.canonical.payment.iban?.replace(/\s+/g, "").toUpperCase();
  if (!iban || inv.currency !== "EUR" || amount <= 0) return null;
  const bic = (inv.canonical.payment.bic || "").replace(/\s+/g, "").toUpperCase();
  const beneficiary = inv.canonical.seller.name.slice(0, 70);
  return ["BCD", "002", "1", "SCT", bic, beneficiary, iban, `EUR${amount.toFixed(2)}`, "", "", inv.invoiceNumber.slice(0, 140)].join("\n");
}

export default async function PayInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = getInvoiceByPaymentToken(token);

  if (!inv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
        <div className="max-w-md rounded-2xl border border-navy-800 bg-navy-900 p-8 text-center text-navy-100">
          <p className="text-lg font-extrabold text-white">Payment link invalid or expired</p>
          <p className="mt-2 text-sm text-navy-300">
            This payment link is not valid. Please ask the sender for an up-to-date link.
          </p>
          <Link href="/" className="mt-5 inline-block text-xs font-bold text-accent-400 hover:text-accent-300">
            NormInvoice — Product of Trend&amp;Brand
          </Link>
        </div>
      </div>
    );
  }

  const balance = Math.max(0, inv.grossAmount - inv.paidAmount);
  const isPaid = inv.paymentStatus === "PAID" || balance <= 0;
  const epcPayload = isPaid ? null : buildEpcSepaPayload(inv, balance);
  let qr: string | null = null;
  if (epcPayload) {
    try {
      qr = await QRCode.toDataURL(epcPayload, { width: 220, margin: 1 });
    } catch {
      qr = null;
    }
  }

  const iban = inv.canonical.payment.iban?.replace(/\s+/g, "").toUpperCase();
  const bic = (inv.canonical.payment.bic || "").replace(/\s+/g, "").toUpperCase();

  return (
    <div className="min-h-screen bg-navy-950 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 text-center">
          <span className="text-sm font-extrabold tracking-tight text-white">
            {inv.canonical.seller.name}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {inv.typeCode === 381 ? "Credit Note" : "Invoice"} {inv.invoiceNumber}
            </p>
            {isPaid ? (
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">Paid ✓</p>
            ) : (
              <>
                <p className="mt-1 text-xs font-semibold text-slate-500">Amount due</p>
                <p className="text-3xl font-extrabold tracking-tight text-navy-900">{money(balance, inv.currency)}</p>
                {inv.dueDate && <p className="mt-0.5 text-[11px] text-slate-500">Due {inv.dueDate}</p>}
              </>
            )}
          </div>

          <div className="px-6 py-6">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Billed to</span>
              <span className="font-semibold text-navy-900">{inv.buyerName}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="text-slate-500">Total</span>
              <span className="font-mono font-semibold text-navy-900">{money(inv.grossAmount, inv.currency)}</span>
            </div>
            {inv.paidAmount > 0 && !isPaid && (
              <div className="mt-1.5 flex justify-between text-xs">
                <span className="text-slate-500">Already paid</span>
                <span className="font-mono font-semibold text-emerald-700">−{money(inv.paidAmount, inv.currency)}</span>
              </div>
            )}

            {isPaid ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs font-semibold text-emerald-800">
                This invoice has been settled in full. Thank you.
              </div>
            ) : (
              <>
                {/* Scan-to-pay (EPC SEPA GiroCode) */}
                {qr ? (
                  <div className="mt-6 flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                    <p className="text-sm font-extrabold text-navy-900">Pay now — scan to pay</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Open your banking app and scan to pre-fill a SEPA transfer.
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr} alt="SEPA GiroCode payment QR" className="mt-3 h-52 w-52 rounded-lg border border-slate-200 bg-white p-1.5" />
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    Scan-to-pay is available for EUR invoices with a bank account on file. Please use the bank details below.
                  </div>
                )}

                {/* Manual bank transfer details */}
                <div className="mt-4 rounded-xl border border-slate-200 p-4 text-xs">
                  <p className="font-bold text-navy-900">Or pay by bank transfer</p>
                  <dl className="mt-2 space-y-1.5">
                    {iban && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">IBAN</dt>
                        <dd className="font-mono font-semibold text-navy-900">{iban}</dd>
                      </div>
                    )}
                    {bic && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">BIC</dt>
                        <dd className="font-mono font-semibold text-navy-900">{bic}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Reference</dt>
                      <dd className="font-mono font-semibold text-navy-900">{inv.invoiceNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Beneficiary</dt>
                      <dd className="font-semibold text-navy-900">{inv.canonical.seller.name}</dd>
                    </div>
                  </dl>
                  {inv.canonical.payment.paymentTerms && (
                    <p className="mt-2 text-[11px] text-slate-500">{inv.canonical.payment.paymentTerms}</p>
                  )}
                </div>
              </>
            )}

            <p className="mt-5 text-center text-[10.5px] text-slate-400">
              Secured by NormInvoice — Product of Trend&amp;Brand. Payment is made directly to the biller&apos;s bank
              account; NormInvoice never holds your funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
