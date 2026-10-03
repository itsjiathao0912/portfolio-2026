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
    <main className="mx-auto max-w-6xl px-5 pt-32 pb-16 md:px-8 md:pt-40" data-testid="work-page">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="label-mono text-accent">Work</p>
        <h1 className="text-[2.5rem] md:text-7xl">All projects</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Three platforms owned end-to-end at SkyLab Group, growth and data work at Zalo and ReOrc AI, and the products I
          build on my own time.
        </p>
      </header>
      <div className="mt-12">
        {projects.length === 0 ? (
          <p className="text-ink-3" data-testid="empty-state">
            No projects yet.
          </p>
        ) : (
          <WorkGrid projects={projects} />
        )}
      </div>
      {site ? (
        <div className="-mx-2 pt-28 md:mx-0">
          <ContactBand profile={site.profile} />
        </div>
      ) : null}
    </main>
  );
}
