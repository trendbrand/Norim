import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Accessibility Statement | NormInvoice", description: LEGAL_DOCUMENTS.accessibility.subtitle };
export default function AccessibilityPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS.accessibility} />; }
