import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Intellectual Property & Brand Guidelines | NormInvoice", description: LEGAL_DOCUMENTS["intellectual-property"].subtitle };
export default function IntellectualPropertyPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["intellectual-property"]} />; }
