import { handleGeo, liveDeps } from "@/lib/visitor-handlers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleGeo(req, liveDeps(req));
}
