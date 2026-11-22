import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";

export const metadata = {
  title: "Legal Notice / Impressum | NormInvoice — Product of Trend&Brand",
  description: LEGAL_DOCUMENTS["legal-notice"].subtitle,
};

export default function LegalNoticePage() {
  return <LegalPageLayout doc={LEGAL_DOCUMENTS["legal-notice"]} />;
}
