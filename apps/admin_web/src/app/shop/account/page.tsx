import FutureGateNotice from "@/components/FutureGateNotice";

export default function CustomerAccountPage() {
  return (
    <FutureGateNotice
      portal="Customer account"
      description="Your secure customer sign-in is ready. Profile, saved addresses, and order history will be available in a later implementation gate."
      loginHref="/customer/login"
    />
  );
}
