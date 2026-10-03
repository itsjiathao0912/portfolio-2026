import type { Metadata } from "next";
import { ContactBand } from "@/components/site/contact-band";
import { WorkGrid } from "@/components/site/work-grid";
import { loadProjects, loadSite } from "@/lib/load";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project: platforms owned end-to-end, growth and data work, and personal products.",
};

export default async function WorkPage() {
  const [projects, site] = await Promise.all([loadProjects(), loadSite()]);
  return (
    <main className="bg-canvas px-5 pt-28 pb-16 md:px-8 md:pt-[150px] xl:px-0" data-testid="work-page">
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
      {site ? (
        <div className="mx-auto max-w-6xl pt-28 xl:px-8">
          <ContactBand profile={site.profile} />
        </div>
      ) : null}
    </main>
  );
}
