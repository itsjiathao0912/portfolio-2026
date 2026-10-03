import type { Metadata } from "next";
import { WorkGrid } from "@/components/site/work-grid";
import { loadProjects } from "@/lib/load";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project: platforms owned end-to-end, growth and data work, and personal products.",
};

export default async function WorkPage() {
  const projects = await loadProjects();
  // Top padding = nav top offset + nav height + a fixed gap, so it follows the nav.
  return (
    <main
      className="bg-canvas px-5 pt-[calc(var(--nav-top-sm)+var(--nav-h-sm)+40px)] pb-24 md:px-8 md:pb-[150px] md:pt-[calc(var(--nav-top)+var(--nav-h)+67px)] xl:px-0"
      data-testid="work-page"
    >
      {/* No page header: the grid is the page. One sr-only H1 keeps the outline. */}
      <h1 className="sr-only">All projects</h1>
      <div className="mx-auto xl:max-w-none">
        {projects.length === 0 ? (
          <p className="text-center text-ink-3" data-testid="empty-state">
            No projects yet.
          </p>
        ) : (
          <WorkGrid projects={projects} />
        )}
      </div>
    </main>
  );
}
