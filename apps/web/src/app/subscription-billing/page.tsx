import { LegalPageLayout } from "@/components/LegalPageLayout";
import { LEGAL_DOCUMENTS } from "@/lib/website-content";

export const metadata = {
  title: "Subscription & Billing Policy | NormInvoice",
  description: LEGAL_DOCUMENTS["subscription-billing"].subtitle,
};

export default function SubscriptionBillingPage() {
  return <LegalPageLayout doc={LEGAL_DOCUMENTS["subscription-billing"]} />;
}
