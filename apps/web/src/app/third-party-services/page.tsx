import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Third-Party Services Disclaimer | NormInvoice", description: LEGAL_DOCUMENTS["third-party-services"].subtitle };
export default function ThirdPartyServicesPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["third-party-services"]} />; }
