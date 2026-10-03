import { handlePoll, liveDeps } from "@/lib/visitor-handlers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handlePoll(req, liveDeps(req));
}

export async function POST(req: Request) {
  return handlePoll(req, liveDeps(req));
}
