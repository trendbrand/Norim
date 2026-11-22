import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Data Retention & Deletion Policy | NormInvoice", description: LEGAL_DOCUMENTS["data-retention"].subtitle };
export default function DataRetentionPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["data-retention"]} />; }
