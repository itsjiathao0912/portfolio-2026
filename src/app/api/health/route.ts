import { getDb } from "@/lib/db";
import { countPublishedProjects } from "@/lib/projects";

// D1-backed health check. The post-deploy smoke calls this: a page shell can
// return 200 while every database call fails, so "the site is up" is proven by
// this route returning real data, not by the home page's status code.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await countPublishedProjects(getDb());
    return Response.json({ ok: true, projects }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    // Detail goes to the Worker log (observability is on), never to the public response.
    console.error("[health] database check failed:", error);
    return Response.json(
      { ok: false, error: "database unavailable" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
