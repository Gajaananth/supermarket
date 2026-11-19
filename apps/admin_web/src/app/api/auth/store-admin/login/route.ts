import { loginAdmin } from "@/lib/server/admin-login";

export async function POST(request: Request) {
  return loginAdmin(request, "STORE_ADMIN");
}
