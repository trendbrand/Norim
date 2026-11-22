import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";
export const metadata = { title: "Service Availability & Support Policy | NormInvoice", description: LEGAL_DOCUMENTS["service-availability"].subtitle };
export default function ServiceAvailabilityPage() { return <LegalPageLayout doc={LEGAL_DOCUMENTS["service-availability"]} />; }
