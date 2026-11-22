import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "AI Feature Disclosure | NormInvoice", description: LEGAL_DOCUMENTS["ai-transparency"].subtitle };
export default function AiDisclosureAliasPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["ai-transparency"]} />; }
