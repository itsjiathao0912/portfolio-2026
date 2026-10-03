import { FadeIn } from "@/components/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { listPublishedProjects } from "@/lib/projects";

// Placeholder home page. Its only job is to prove the stack end to end:
// D1 (or local SQLite) → raw SQL → validated content → shadcn + motion + tokens.
// The real site design replaces this later.

// Reads the database per request. Without this Next would try to prerender the
// page at BUILD time, where no Cloudflare context exists.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { projects } = await listPublishedProjects(getDb());

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20" data-testid="home">
      <FadeIn>
        <header className="flex flex-col gap-3">
          <p className="font-mono text-sm text-muted">portfolio-2026 · foundation</p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Portfolio</h1>
          <p className="max-w-prose text-muted">
            Placeholder home page. Content flows from <code className="font-mono text-ink">content/</code> into
            the database and renders here.
          </p>
          <div>
            <Button asChild variant="outline">
              <a href="#work">Selected work</a>
            </Button>
          </div>
        </header>
      </FadeIn>

      <section id="work" className="flex flex-col gap-4 border-t border-hairline pt-8">
        <h2 className="text-sm font-medium text-navy">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-muted" data-testid="empty-state">
            No projects yet. Run <code className="font-mono text-ink">pnpm db:seed:local</code>.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {projects.map((project, index) => (
              <li key={project.id}>
                <FadeIn delay={0.05 * index}>
                  <Card data-testid="project-card">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.summary}</CardDescription>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.category ? <Badge variant="secondary">{project.category}</Badge> : null}
                        {project.year ? <Badge variant="outline">{project.year}</Badge> : null}
                      </div>
                    </CardHeader>
                  </Card>
                </FadeIn>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="text-sm text-accent">© 2026</footer>
    </main>
  );
}
