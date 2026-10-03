import { AvatarSprite, AvatarStack } from "@/components/people/avatar";
import { PEOPLE_SEEDS } from "@/components/people/avatar-logic";
import { buildWallTiles } from "@/components/signature/characters/logic";
import { LiftCard } from "@/components/ui/lift-card";
import { Reveal } from "../reveal";

const STACKS: Record<string, { seeds: readonly string[]; label: string; total?: number }> = {
  "creatio-reach": { seeds: PEOPLE_SEEDS.participants, label: "Illustrated participants", total: 9 },
  "creatio-partners": { seeds: PEOPLE_SEEDS.sponsors, label: "Illustrated sponsors", total: 7 },
  "build-stuffs": { seeds: PEOPLE_SEEDS.builders, label: "Illustrated builders" },
  aabw: { seeds: PEOPLE_SEEDS.judges, label: "Illustrated team and judges" },
};

/** "Building with people": four sourced stat cards with illustrated avatar stacks (role seeds, never real names). */
export function PeopleSection() {
  const tiles = buildWallTiles();
  return (
    <section aria-labelledby="people-title" className="bg-bg py-14 md:py-[80px]" data-testid="section-people">
      <AvatarSprite />
      <div className="mx-auto max-w-[1320px] px-6 md:px-10 lg:px-[60px]">
        <h2 id="people-title" className="text-[32px] md:text-[46px]">Building with people</h2>
        <p className="mt-4 max-w-xl text-[17px] leading-[1.55] text-ink-2">Communities, hackathons and demo rooms: the part of the job that happens away from the screen.</p>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {tiles.map((t, i) => {
            const stack = STACKS[t.id];
            return (
              <Reveal as="li" key={t.id} index={i} className="group/card">
                <LiftCard className="h-full">
                  <div className="flex h-full min-h-[240px] flex-col justify-between gap-6 rounded-[16px] bg-bg p-6 md:p-7" data-testid="people-card">
                    <div>
                      <p className="label-mono text-[12px] uppercase text-ink-3">{t.kicker}</p>
                      <p className="mt-3 font-display text-[32px] leading-[1.05] text-ink-1 md:text-[36px]">{t.front}</p>
                      <p className="mt-3 text-[14px] leading-[1.5] text-ink-2">{t.back}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="label-mono text-[11px] uppercase text-ink-3">{t.source}</p>
                      {stack ? <AvatarStack seeds={stack.seeds} total={stack.total} label={stack.label} /> : null}
                    </div>
                  </div>
                </LiftCard>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
