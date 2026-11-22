import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Data Processing Addendum (DPA) | NormInvoice", description: LEGAL_DOCUMENTS.dpa.subtitle };
export default function PublicDpaPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS.dpa} />; }
