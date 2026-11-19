import FutureGateNotice from "@/components/FutureGateNotice";

export default function RiderPortalPage() {
  return (
    <FutureGateNotice
      portal="Rider portal"
      description="Your rider sign-in is ready. Delivery workflow, cash ledger, deposits, and shift management are scheduled for a later implementation gate."
      loginHref="/rider/login"
    />
  );
}
