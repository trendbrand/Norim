import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Complaints & Dispute Resolution | NormInvoice", description: LEGAL_DOCUMENTS.complaints.subtitle };
export default function ComplaintsPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS.complaints} />; }
