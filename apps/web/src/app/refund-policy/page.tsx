import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Cancellation & Refund Policy | NormInvoice", description: LEGAL_DOCUMENTS["cancellation-refunds"].subtitle };
export default function RefundPolicyAliasPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["cancellation-refunds"]} />; }
