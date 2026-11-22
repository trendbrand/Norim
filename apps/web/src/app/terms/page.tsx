import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";

export const metadata = {
  title: "Terms of Service | NormInvoice",
  description: LEGAL_DOCUMENTS.terms.subtitle,
};

export default function PublicTermsPage() {
  return <LegalPageLayout doc={LEGAL_DOCUMENTS.terms} />;
}
