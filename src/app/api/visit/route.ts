import { handleVisit, liveDeps } from "@/lib/visitor-handlers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleVisit(req, liveDeps(req));
}
