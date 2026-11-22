import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Subprocessor Register | NormInvoice", description: LEGAL_DOCUMENTS.subprocessors.subtitle };
export default function SubprocessorsPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS.subprocessors} />; }
