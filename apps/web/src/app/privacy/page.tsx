import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";

export const metadata = {
  title: "Privacy Policy | NormInvoice",
  description: LEGAL_DOCUMENTS.privacy.subtitle,
};

export default function PublicPrivacyPage() {
  return <LegalPageLayout doc={LEGAL_DOCUMENTS.privacy} />;
}
