import { verifyOtp } from "@/lib/server/otp-login";

export async function POST(request: Request) {
  return verifyOtp(request, "customer");
}
