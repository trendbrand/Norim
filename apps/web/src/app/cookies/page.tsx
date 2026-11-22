import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Cookie Policy | NormInvoice", description: LEGAL_DOCUMENTS.cookies.subtitle };
export default function CookiesPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS.cookies} />; }
