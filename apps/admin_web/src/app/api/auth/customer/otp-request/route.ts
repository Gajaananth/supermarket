import { requestOtp } from "@/lib/server/otp-login";

export async function POST(request: Request) {
  return requestOtp(request, "customer");
}
