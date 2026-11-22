import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Acceptable Use Policy | NormInvoice", description: LEGAL_DOCUMENTS["acceptable-use"].subtitle };
export default function AcceptableUsePage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["acceptable-use"]} />; }
