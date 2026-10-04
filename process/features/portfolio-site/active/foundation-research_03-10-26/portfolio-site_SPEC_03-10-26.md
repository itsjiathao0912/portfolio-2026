---
name: spec:portfolio-site
description: "Product requirements for Thao Dao's portfolio site: pages, case-study variants, content blocks, interaction and motion catalogue, content map, acceptance criteria, open questions. Written for user review before any approach is chosen."
date: 03-10-26
feature: portfolio-site
metadata:
  node_type: memory
  type: spec
  feature: portfolio-site
  phase: foundation-research
---

# Portfolio site: SPEC (03-10-26)

**BLUF:** Build a clean, light, blue-and-white portfolio for Thao Dao that is laid out like the reference designer site (floating nav, colour-coded project cards, long case studies with a sticky table of contents) but uses Thao's own content, a navy/blue palette, and noticeably more interactivity (liquid-fill buttons, a cursor-reactive dot grid, logo and card hovers, smooth reveals and page transitions). It must feel just as good on a phone as on a laptop. Most of Thao's content already exists as short summaries; the site needs real screenshots and a few permissions from her before case studies can be written. The SPEC ends with 12 open questions and a 12-item ask list.

**TL;DR:** Home, Work index, Case study (4 variants), 404, all with mobile versions. Smooth, polished, reduced-motion safe, no sticky-hover on touch. Forms store to the database (pending your answer). Out of scope: login, a content admin, email sending, analytics.

---

## Summary

Thao Dao is a Technical Product Manager (Ho Chi Minh City) who has owned a blockchain investment platform, a multi-tenant AI ERP and a cloud billing platform at SkyLab Group, after earlier roles at ReOrc AI and Zalo. She wants a portfolio that makes a hiring manager think "this person ships and has taste" within a few seconds, and lets a curious reader go deep on any project.

The structure is modelled on a reference designer portfolio she liked: a floating pill navigation, a big hero, a strip of company logos, a stack of project cards each in its own colour, and long case-study pages with a sticky table of contents that highlights where you are. All words, images and projects are Thao's own. The look is light: a white base, navy for strong text and bands, and blue (#2563eb) as the accent. It keeps the IBM Plex family for body text (it handles Vietnamese accents) and adds a free, extra-wide display face for headings to get the reference's "big confident headline" feel.

Where the reference is deliberately quiet, Thao asked for more life: liquid fill on buttons, a dot grid that reacts to the cursor, logo and icon hovers, scroll reveals and page transitions. This SPEC lists each interaction, how it behaves on desktop versus phones, and its fallback for people who turn motion off.

## User Stories / Jobs To Be Done

**Visitors**
- As a recruiter or hiring manager, I want to see who Thao is, what she has owned and her strongest proof within the first screen or two, so I can decide in under a minute whether to keep reading.
- As a hiring manager, I want to scan every project as a card with its role, company and one or two proof numbers, so I can compare projects without opening each.
- As a curious reader, I want a long case study with a table of contents that follows me, so I can jump to the part I care about (the problem, her role, the outcome) and always know where I am.
- As a phone user (many recruiters open links on mobile), I want the same quality and the same section navigation as on a laptop, so nothing important is hidden on a small screen.
- As a visitor who hits a confidential project, I want a clear "private, request access" state with a short form, so I understand it exists and can ask without feeling blocked.
- As a visitor to an unfinished project, I want a "coming soon, notify me" form, so I can leave an email and come back.
- As a visitor, I want to contact Thao quickly (email, LinkedIn, CV download, a short message form), so reaching out takes seconds.
- As someone who uses a keyboard, a screen reader or "reduce motion", I want the site fully usable and calm without any animation.

**Thao (owner)**
- As the owner, I want projects to live as structured content with a fixed set of building blocks, so I can add or reorder case studies without redesigning anything.
- As the owner, I want placeholders that look intentional wherever I do not yet have real screenshots, so the site can launch honestly now and fill in later.
- As the owner, I want to see exactly what is still needed from me (photo, permissions, screenshots), so I can supply it in one pass.

## What The User Wants (Behavioral Outcomes)

### A. Look and feel

- Light theme only, white base. Navy (proposed #0b1f4d) for headlines, the footer band and the logo band; blue #2563eb for accents, links and the main buttons; soft slate greys for dividers and secondary text; pale blue tint for chips.
- IBM Plex Sans (body, 400/500/600) and IBM Plex Mono (small labels and dates) with full Vietnamese support. For headings, a free extended or wide display face as a stand-in for the reference's wide grotesque. The final pick is an open question (see Q3).
- Generous whitespace, 16 px rounded cards, fully rounded pill buttons and nav, soft shadows, one big hero moment per page.
- Calm by default: motion supports reading, it never blocks it.

### B. Pages

| Page | What it contains | Mobile (about 390 px wide) |
|---|---|---|
| **Home** | (1) Floating pill nav. (2) Hero: name, one-line role sentence, short pitch, portrait or a designed placeholder, primary and secondary buttons. (3) Credibility strip: company and product logos on a navy band. (4) Featured work: 3 to 4 large colour-coded project cards. (5) Experience: SkyLab Group, ReOrc AI, Zalo as a timeline or stacked rows with 1 to 2 proof numbers each. (6) Recognition: awards, certifications, education, talks (talks only if Thao has any). (7) Skills as grouped chips. (8) Contact call-to-action with short form and direct links. (9) Social row and footer. | One column, hero stacks, logo strip becomes a 2 to 3 column grid, cards full width, hamburger menu opens a full-width sheet |
| **Work index** | All projects as filterable cards (filter by kind such as Product, Personal, Case study, Coming soon, and optionally by company). Locked and coming-soon cards are visibly labelled. Contact CTA at the bottom. | One column; filters become a horizontally scrollable chip row |
| **Case study** | Four variants (section C). Shared shell: hero tinted by project colour, sticky scroll-spy table of contents (desktop), reading column, next-project card at the end, contact CTA. | Table of contents becomes a compact "On this page" bar or sheet pinned under the top bar; single column; all multi-column blocks stack |
| **404** | Friendly designed page with the same nav, a short line, and links back to Home and Work. | Same |

The nav items: name/home, Work, Experience (home anchor), CV, LinkedIn, Get in touch. In-site links navigate in the same tab (the reference opens everything in new tabs; we will not).

### C. Case-study variants

1. **Full case study.** Hero (project icon and name, title, subtitle, cover mockup that bleeds off the bottom), meta row (role, company, period, tools), then ordered sections each with a TOC entry and a small icon.
2. **Locked / NDA.** Same hero, the body replaced by a blurred preview of what the content would look like and a clear message "private for now", plus a request-access form (name, email, short note). Table of contents entries show but are faded.
3. **Coming soon.** Hero plus at most a short teaser (one or two real paragraphs, the last fading out), and a notify-me form (name, email).
4. **Article.** A single centred reading column, no table of contents, for shorter writing or event notes. Optional share row.

All four share the same shell, so switching a project's variant is a content change, not a design change.

### D. Reusable content blocks (what each needs)

| Block | Fields |
|---|---|
| Hero | title, subtitle, eyebrow, project icon/logo, brand colour or gradient, cover image, optional rating, optional share row |
| Meta row | role, company, period, team, tools list |
| Section header | eyebrow label, heading, TOC label, TOC icon |
| Rich text | paragraphs, bold sub-headings, inline links |
| Quote / pull quote | text, attribution |
| Numbered pair or list | items of number, title, short description |
| Stat grid | items of big number, caption (2 to 4 items) |
| Full-width figure | image, alt text, optional caption, optional panel background |
| Image strip / device row | 3 to 6 images, shared background |
| Feature row | title, paragraph, image, side (left or right) |
| Before / after | two images with labels |
| Logo strip | logos with links |
| Tool icon row | icons with captions |
| Team / avatar grid | photos, optional names and profile links |
| Timeline | milestones with dates, or an image |
| Video | file or link, poster image, caption |
| Learnings list | numbered titles with paragraphs |
| Credits | names with optional links |
| Callout | short highlighted note (such as an NDA disclaimer) |
| Locked state | blurred preview, message, request-access form |
| Coming-soon state | message, notify form |
| CTA footer | headline, sub-copy, form or buttons, social row |

The five blocks already supported by the starter (heading, paragraph, image, quote, list) stay valid; the rest are additions.

### E. Interaction and motion catalogue

Rules that apply to every row: all motion respects "reduce motion" (see the last column); nothing may rely on hover alone; no hover state may stay stuck after a tap on a touch screen (reference site bug, section "Background"); desktop and phones both get a deliberately designed behaviour, not a leftover.

| # | Interaction | Trigger | Effect | Desktop | Phone / touch | Reduced motion |
|---|---|---|---|---|---|---|
| 1 | **Liquid / water-fill pill buttons** (primary CTA, form submit, card CTA) | Pointer enters (or keyboard focus) | A wave-edged blue fill rises from the bottom of the pill and the label flips to white; on leave it drains back | Fill follows the side the cursor entered from, about 400 to 600 ms | No hover: fill plays once on press (about 300 ms) then navigates; resting state is already readable. Never stays filled after the finger lifts | Instant colour change, no wave |
| 2 | **Liquid nav chips** | Pointer over a nav item | A soft blue-tint blob fills the chip behind the label; active page keeps a quiet dot or underline | Same as above, smaller, about 250 ms | Menu items fill on press inside the sheet | Instant background tint |
| 3 | **Cursor-reactive dot grid** | Pointer moves over the hero and CTA bands | A faint grid of dots; dots near the cursor grow, brighten and shift to blue, with soft falloff and ease back | Follows the cursor with light smoothing | No cursor: dots drift or pulse gently on a slow idle loop, and react to touch-drag for a moment; paused when off-screen or tab hidden | Static dot pattern, no reaction |
| 4 | **Logo and icon hover** (credibility strip, tool icons, social icons) | Pointer over a logo | Greyscale to full colour, small lift (about 4 px) and tilt, soft shadow; optional brand-colour liquid fill behind social icons | About 200 ms | Logos are shown in colour at rest; press gives a brief scale pulse. No stuck state | Colour change only, no movement |
| 5 | **Project card hover** | Pointer over a card | Slight lift (scale about 1.02), shadow deepens, cover image eases up a few pixels, CTA fills with liquid | About 200 to 300 ms | Press state only: card dips slightly while pressed, releases on lift | Shadow change only |
| 6 | **Scroll reveals** | Element enters the viewport | Fade and rise about 24 px, staggered 60 to 80 ms across siblings; each element plays once | Applied to home sections, card grids and stat grids; not to long body text | Same but lighter distance (about 16 px) and no stagger over 4 items | Elements simply appear |
| 7 | **Page transitions** | Navigate between pages | A short cross-fade with a slight upward settle of the incoming page (about 300 to 400 ms); nav stays put | Between Home, Work and case studies | Same, never delays tapping; falls back to instant on slow devices | Instant swap |
| 8 | **Scroll-spy table of contents** | Scrolling a case study | The current section's TOC entry turns dark and bold, a small marker slides to it; TOC fades in once the hero scrolls away; clicking jumps with smooth scrolling | Sticky left column, keyboard focus visible, active entry announced | Compact "On this page" bar under the top bar showing the current section; tap opens a sheet of sections; same scroll-spy | Jump is instant, no sliding marker |
| 9 | **Next-project module** | Reaching the end of a case study | Large card for the next project with its colour and a liquid CTA | As card hover | As card press | As card |
| 10 | **Mobile menu sheet** | Tap the round hamburger | A rounded white sheet drops under the top bar (about 300 ms), big centred links, backdrop dims slightly, tap outside or on a link closes it; focus is trapped while open | n/a | Primary phone navigation | Sheet appears instantly |
| 11 | **Hero entrance** | Page load | Title, subline and nav settle in over about 500 ms; portrait follows a beat later | Once per visit | Same, shorter | Instant |
| 12 | **Form feedback** | Focus, submit | Field border strengthens on focus; submit shows a short progress state then a clear success or error message in place | Inline | Inline; inputs 16 px or larger so iOS does not zoom | No animation, same messages |

Note: the reference site itself is low-motion (no smooth scroll, no scroll reveals on body content, no page transitions, no cursor effects, hover states stuck after tap). Rows 1 to 5, 6, 7 and 9 are upgrades Thao asked for beyond that baseline; rows 8, 10 and 11 reproduce or improve what the reference does. Rows 3 and 4 interpret her "dots" and "logo hover" requests; the exact feel is something to review visually.

### F. Content map (what fills what)

| Section | Filled from (existing content) | Gap |
|---|---|---|
| Hero | Name, title "Technical Product Manager", location, tagline and summary, CV link | Headshot is missing (see ask list); designed placeholder until then |
| Credibility strip | SkyLab, Lumicap, COSAP, ReOrc, Zalo logos (already collected, usage permission unconfirmed) | PAC and any other product marks; permission to show logos |
| Featured work | Lumicap, COSAP, PAC (flagship); Ledgr and Cortex Sentinel (personal) | No written case studies exist; only 1 to 2 sentence summaries and tech lists. Cards launch with real summary text and designed mock frames for imagery |
| Case studies | Zalo (+30% ad revenue, +15% engagement, +3% payers, -40% manual reporting), ReOrc (-40% rework, +20% delivery speed, 95% first-pass UAT) have the strongest numbers; PAC pricing-standardisation draft exists | All problem/process/outcome writing; images; permission |
| Experience | SkyLab Group, ReOrc AI, Zalo with bullets and highlights | Chợ Tốt, MoMo and Creatio Marketing Club roles exist in old notes but were left out as unverifiable; MoMo and Chợ Tốt share an identical bullet (one is wrong) |
| Recognition | 3 certifications with verify links, education (FTU, MindX), 5 awards from 2021 | Talks and writing: none found |
| Skills | Four skill groups from the old site | None |
| Contact | Email, LinkedIn, GitHub, CV (phone is hidden by design) | Confirm preferred domain and whether to show a phone number |

Placeholder strategy for missing imagery: a designed "mock frame" (browser or phone outline on the project's brand colour with the project name and a subtle pattern) clearly intended as a stand-in, never a grey box or stock photo. Locked projects reuse the same frame, blurred. Every placeholder is tracked so it is easy to find and replace.

### G. Data and forms

- Projects (including kind, status, order, colour, cover, blocks, links) are stored in the site's database, seeded from files in the repository's content folder, so adding a case study is a content change.
- Three forms: **request access** (name, email, which project, short note), **notify me** (name, email, which project) and **contact** (name, email, message). Each has validation, clear success and error states, and basic spam protection (hidden field or similar).
- How submissions are delivered is an open question (Q5): the recommended minimum is to save them to the database and show the contact email prominently, because no email service is in scope.

## Flow / State Diagram

```
                              +-------------+
   link / search / CV  --->   |    HOME     |  hero > logos > featured > experience > recognition > contact
                              +------+------+
                     nav "Work" |    | card click
                                v    v
                        +-------------+        filter chips
                        | WORK INDEX  |<---- (All / Product / Personal / Soon)
                        +------+------+
                               | card click  (same tab, page transition)
                               v
                       +---------------+
                       | CASE STUDY    |  status decides which variant renders
                       +-------+-------+
        +---------+------------+------------+-----------+
        v         v            v            v
   [published] [restricted]  [coming-soon]  [article]
   full body   blurred +     teaser +       single column,
   + TOC       request       notify form    no TOC
   scroll-spy  access form       |
        |         |              v
        |         v          submission saved -> inline success
        |    submission saved -> inline success
        v
   next-project card ---> another CASE STUDY   (or back to WORK INDEX)

 Any page: unknown URL ---> 404 ---> Home / Work
 Phone: same graph; nav = hamburger sheet; TOC = "On this page" bar + sheet

 Interaction state (any animated element)
 rest --(hover/focus on desktop | press on touch)--> active --(leave | release)--> rest
          \--(reduce-motion on)--> instant state change, no movement
```

## Acceptance Criteria (Testable Outcomes)

Scenario names come from the lanes that already exist in the repo (bun unit, isolated Playwright E2E on Chromium, typecheck, lint, Cloudflare Worker build) plus Agent-Probe for visual feel and real-device checks. Where automation is not possible the criterion says why.

**Structure and content**

1. **Home shows every planned section.** A visitor sees hero, logo strip, featured work, experience, recognition, skills, contact and footer in order, with no empty section.
   - proven by: E2E `home-sections` (asserts each landmark and heading is present and ordered); unit `content-map` (every home section has seeded content).
   - strategy: Fully-Automated

2. **Work index lists and filters projects.** All seeded projects appear as cards; choosing a filter shows only matching projects and a count; locked and coming-soon cards carry visible labels.
   - proven by: E2E `work-filter`; unit `project-kind-status` (every project has a valid kind and status).
   - strategy: Fully-Automated

3. **Each of the four case-study variants renders correctly.** A full study shows hero, meta and sections; a locked study shows the blurred preview, message and request-access form; a coming-soon study shows teaser and notify form; an article shows one column and no TOC.
   - proven by: E2E `case-study-variants` (one seeded fixture per variant); unit `block-schema` (every block type validates and rejects bad input).
   - strategy: Fully-Automated

4. **The sticky table of contents follows the reader.** On desktop the current section's entry becomes active as sections scroll past, and clicking an entry brings that section into view; every TOC entry points to a real section.
   - proven by: E2E `toc-scrollspy`; unit `toc-anchors` (no dead anchors).
   - strategy: Fully-Automated

5. **A phone has section navigation too.** At 390 px wide an "On this page" control is present, opens a list of sections and jumps to the chosen one.
   - proven by: E2E `mobile-toc` on a 390 px mobile project.
   - strategy: Fully-Automated

6. **Navigation stays in the same tab and reaches every page.** All internal links and cards navigate in place; Home, Work, a case study, the next-project card and 404 are all reachable and the 404 links back.
   - proven by: E2E `navigation-and-404`; unit `internal-links` (no internal link opens a new tab).
   - strategy: Fully-Automated

**Forms and data**

7. **Forms work and fail kindly.** Each of the three forms rejects empty or invalid input with a clear message, accepts valid input, shows an inline success state, and the submission is stored (or delivered) as decided in Q5.
   - proven by: E2E `forms-happy-and-sad-paths`; unit `submission-validation` and `submission-store`.
   - strategy: Fully-Automated

8. **Project content comes from the database, seeded from files.** Re-seeding produces the same rows, and an unpublished project never appears on public pages.
   - proven by: existing unit `content` and `db` suites extended with `seed-sync` and `unpublished-hidden`; E2E `unpublished-not-visible`.
   - strategy: Fully-Automated

**Motion and interaction**

9. **Liquid fill appears on pill buttons and nav chips on desktop and responds to focus.** Hovering or keyboard-focusing a primary button or nav chip starts the fill; leaving or blurring drains it.
   - proven by: E2E `liquid-hover` (asserts fill state flags/attributes on hover and focus; screenshot compared against a baseline for the filled state).
   - strategy: Hybrid (state is automated; the visual quality of the wave is an Agent-Probe review, because a pixel test cannot judge whether it feels "liquid")

10. **Touch never leaves a stuck hover or fill.** In a touch-emulated 390 px browser, tapping any button, card, logo or nav item leaves no element in its hover or filled state once the finger is lifted or the page changes.
    - proven by: E2E `touch-no-sticky-hover` (Chromium with touch and `hover: none` emulation, tap then assert resting styles); Agent-Probe `real-iphone-safari-tap-pass` on a physical iPhone.
    - strategy: Hybrid (emulation automated; real-device Safari cannot be automated here)

11. **The dot grid reacts to the cursor and calms on touch.** Moving the pointer over the hero changes dots near it; on touch devices dots follow the idle behaviour and no console errors appear; the effect pauses when the tab is hidden.
    - proven by: E2E `dot-grid` (pointer move changes reported dot state; touch emulation shows idle mode; visibility change pauses it); unit `dot-grid-math` (falloff function).
    - strategy: Fully-Automated for state and math; the look is covered in criterion 9's Agent-Probe

12. **Scroll reveals and page transitions run once and never block use.** Revealed elements become visible after entering the viewport, play only once, and a link click works immediately during a transition.
    - proven by: E2E `reveal-and-transition` (scroll then assert visible; click during transition succeeds).
    - strategy: Fully-Automated

13. **Reduced motion is honoured everywhere.** With "reduce motion" on, no wave, dot reaction, reveal, tilt or page transition runs; every interaction still changes state instantly and all content is visible.
    - proven by: E2E `reduced-motion` (Playwright `reducedMotion: "reduce"`; asserts no running animations and all reveal elements visible).
    - strategy: Fully-Automated

**Quality**

14. **Mobile layout is clean at 390 px.** Every page has no horizontal scrolling, text is not clipped, tap targets are at least 44 px, and form inputs are 16 px or larger.
    - proven by: E2E `mobile-390-layout` over Home, Work, each case-study variant and 404.
    - strategy: Fully-Automated

15. **The site is keyboard and screen-reader usable.** Every interactive element is reachable by Tab in a sensible order with a visible focus ring; the mobile menu traps focus and closes on Escape; pages have one main heading and labelled landmarks; images have alt text; no serious automated accessibility violations.
    - proven by: E2E `keyboard-nav` and `a11y-scan` (axe); manual screen-reader pass noted as a known gap, not a blocker.
    - strategy: Hybrid (automated scan covers roughly the machine-checkable portion; a human screen-reader pass is Agent-Probe)

16. **Performance stays inside a budget.** On a simulated mid-range phone and a throttled connection, the Home page reaches a usable first view quickly, with the interactive effects deferred until after the first paint; each page's script size stays under a set budget.
    - proven by: Worker build size check plus a bundle-size gate script (like the sibling project's); E2E `perf-smoke` measures time to first view and layout shift on the throttled profile. Exact thresholds are set in PLAN from a first measurement (see Q11).
    - strategy: Hybrid (budget gates automated; real-device feel is Agent-Probe)

17. **Light theme and fonts hold.** The site never switches to dark for dark-mode visitors, headings use the chosen display face and body uses IBM Plex, and Vietnamese accents (such as "Gia Thảo") render without fallback boxes.
    - proven by: existing E2E dark-colour-scheme smoke, extended with `vietnamese-glyphs` (computed font and glyph check).
    - strategy: Fully-Automated

18. **Placeholders are honest and findable.** Wherever a real screenshot is missing, a designed placeholder frame is shown, no page contains a broken image, and a report lists every placeholder still in use.
    - proven by: unit `placeholder-registry`; E2E `no-broken-images`.
    - strategy: Fully-Automated

19. **Metadata and sharing work.** Every page has a title, description and share image; a sitemap lists public pages; the 404 returns a real 404 status; locked-project pages do not expose hidden content in their HTML.
    - proven by: E2E `seo-and-status`; unit `locked-content-not-in-markup`.
    - strategy: Fully-Automated

20. **The overall design matches the approved direction.** A reviewer compares Home, Work and one case study against the agreed palette, type and layout and says yes.
    - proven by: Agent-Probe `design-review-against-direction` (screenshots at 1440 and 390 shared with Thao). Known gap: taste cannot be automated; the automated criteria above cover correctness only.
    - strategy: Agent-Probe

## Out Of Scope

- Sign-in, user accounts, comments or any visitor profile.
- A content admin or CMS interface; projects are edited as files and re-seeded.
- Sending email (notifications, confirmations, auto-replies) and any newsletter.
- Analytics, trackers, cookie banners and A/B testing (the reference site loads many; we load none for now).
- A dark theme.
- Writing the case-study copy itself and capturing missing screenshots or videos; those need Thao's input and are tracked on the ask list, not built here.
- A blog or a full writing section beyond the single Article variant.
- Internationalisation beyond using Vietnamese names and accents correctly (the site is English only for now).
- WebGL, 3D scenes, scroll-jacking or heavy animation libraries.
- Embedding or syncing live product demos.
- Copying any text, image or code from the reference site.

## Constraints

**From the user**
- Structure modelled on the reference site; content, assets and brand are Thao's own.
- Light theme, white base, blue and navy palette (#2563eb accent, navy proposed #0b1f4d); IBM Plex Sans and Mono; a free extended display face for headings.
- Highly interactive and polished, but also professional and calm.
- Must be excellent on mobile, not a shrunken desktop.

**From the existing project (process and platform)**
- Deployed as a Cloudflare Worker; the database is Cloudflare D1 with raw SQL, seeded from the repository's content folder; the schema file must stay safe to apply repeatedly.
- Fonts are bundled with the site (self-hosted), never loaded from a font CDN; the display face must be chosen from one that can be bundled.
- Colours come from named design tokens only, never raw hex values in components.
- Animations use the existing animation library and every animated component respects reduce-motion; animation code is client-side only and loaded so it does not slow the first view.
- No sending of email, no secrets in the repository, one heavy build or test at a time.
- The existing test lanes (typecheck, lint, unit, isolated browser tests, Worker build) are the verification tools; new behaviour must be covered there.

**From research (reference site findings)**
- The reference leaves hover states stuck after a tap on touch screens, hides the table of contents on phones, opens projects in new tabs and has no next-project module; this SPEC requires the opposite on all four.
- The reference's captures are Chromium only; iOS Safari behaviour for sticky elements, blur and scroll is unverified and needs a real-device check.
- Brand logos and product screenshots are third-party material with no found usage licence; they are shown for identification only and stay out of the committed repository until permission is confirmed (see ask list).
- Several metrics in the old content are role-level (for example "8 modules") rather than business outcomes; wording must not overstate them.
- Do not display the phone number unless Thao confirms.

## Open Questions

Owner is shown in brackets. Under an interactive session these block PLAN; they are all answerable by Thao in one pass.

1. **[user] Headshot and bio photo.** Can you supply a square headshot (1000 px or larger, plain background)? Until then the hero uses a designed placeholder. LinkedIn blocked automated access, so nothing could be fetched.
2. **[user] Which projects headline the Featured work and which become full case studies first?** Suggested: Lumicap, COSAP and PAC as cards; Zalo (+30% ad revenue) and ReOrc (-40% rework) as the first written studies because their numbers are the strongest.
3. **[user] Display face for headings.** Candidates to preview (all free, bundleable): Unbounded, Syne, or Archivo in its expanded width. Pick after seeing a sample, or accept the recommendation chosen in INNOVATE. Must support Vietnamese accents if used in Vietnamese names, else restrict to Latin headings.
4. **[user] Navy shade.** Keep the proposed #0b1f4d, or choose a different navy? Also confirm that blue #2563eb stays as the single accent.
5. **[user] What happens to form submissions?** Recommended: save them to the database and show the contact email; no email service is in scope. Alternatives: a mailto link only (nothing stored), or add email sending later. Which do you want, and who reads stored submissions (a manual database query, or a later admin)?
6. **[user] Confidentiality and permissions.** For Lumicap, COSAP, PAC, ReOrc, Zalo and SkyLab: may we show logos, public-site screenshots, sanitised internal UI, and the headline numbers (30%, 15%, 3%, 40%, 20%, 95%)? Which projects should be locked behind request-access instead?
7. **[user] Earlier roles.** Include Chợ Tốt, MoMo and Creatio Marketing Club, or leave them out? Note the old notes give MoMo and Chợ Tốt an identical bullet, so one of them is wrong and needs correcting before publishing.
8. **[user] Phone number and domain.** Show the phone number (currently hidden by design)? Is the intended domain itsjiathao.space, or a different one?
9. **[user] Talks, writing, hackathon photos, certificates.** Do you have any to show in the recognition area? None were found online.
10. **[user] Case-study depth for a first launch.** Launch with real summaries and designed placeholders and fill studies in later, or hold launch until at least one full case study is written?
11. **[next-phase / PLAN] Performance budget numbers** (first-view time, script size per page) to be set from a first measurement, not guessed here.
12. **[next-phase / INNOVATE] How the liquid fill, dot grid and page transitions are built** (approach is deliberately not chosen in this SPEC) and whether the dot grid should use a lightweight canvas or pure CSS.

## Background / Research Findings

Full research lives beside this file: `reference-site_REPORT_03-10-26.md`, `content-inventory_REPORT_03-10-26.md`, `assets_REPORT_03-10-26.md`. Screenshots are local-only in `research-private/` (gitignored). Key facts that shaped the requirements:

- **The reference is quiet and simple.** Built in Webflow with no animation libraries, no canvas or video, no custom cursor, no page transitions. Its feel comes from the floating pill nav, a wide display face, colour-coded rounded cards, a sticky scroll-spy table of contents and tiny hover nudges (150 to 400 ms). Everything can be rebuilt without anything heavy.
- **It has clear gaps** this SPEC fixes: no section navigation on phones, hover states stick after a tap, projects open in new tabs, no next-project card, the nav overlaps text without backdrop, some TOC entries point to non-existent sections, and no reduced-motion handling.
- **One shared page shell serves many page types:** product case study, long article, short article, event page, "coming soon" teaser and locked/restricted. That is why this SPEC defines four variants on one shell and a reusable block list.
- **The old portfolio is thin on case-study material.** There are zero written case studies, no images, no headshot and only short summaries for Lumicap, COSAP and PAC. The strongest proof is in Zalo and ReOrc roles. The old site used a warm off-white paper look with one royal blue; the new direction moves to a white base with navy and blue.
- **Assets found:** logos for SkyLab (icon only), Lumicap, COSAP, ReOrc and Zalo; top-of-page screenshots for the same five at 1440 and 390 px. Not obtainable: LinkedIn photo (blocked), any internal product UI, PAC visuals, Ledgr and Cortex Sentinel captures, demo videos, talks.
- **The starter project already provides** a light-only design token set, IBM Plex fonts, a project table in the database seeded from content files, five basic content block types, an animation library, unit tests, an isolated browser test lane, and a Cloudflare Worker build. This SPEC builds on that without choosing how.
- **User brainstorm input (verbatim intent):** professional and highly interactive; light theme; structure like the reference; her own content and assets; blue/navy palette; liquid or water-fill hover on pill buttons and nav; dots that react to the cursor; logo and icon hover; mobile versions of everything; avoid sticky hover after tap.

### Ask list for Thao (everything needed to move from placeholders to real content)

1. Headshot (square, 1000 px or larger, plain background) and a preferred bio or share photo.
2. Permission to show company logos and public-site screenshots (Zalo/VNG, ReOrc, SkyLab) and any employer brand guidelines.
3. For Lumicap, COSAP, PAC: sanitised screenshots, Figma exports, flow diagrams or redacted mockups, plus NDA or client constraints (Korean and Singaporean COSAP clients, PAC tenants).
4. Zalo Game Center tracking dashboard and A/B result charts, sanitised versions, and whether the 30% / 15% / 3% numbers can be published.
5. ReOrc data lineage and governance screens, and whether 40% / 20% / 95% can be published.
6. Short demo recordings (screen captures) of Lumicap, COSAP, Ledgr and the Cortex Sentinel triage copilot.
7. Whether it is fine to screenshot the live Ledgr app (it uses Vietnamese labour-law data) and the Cortex Sentinel repo (it sits under another organisation).
8. Approval of role wording for Lumicap, COSAP and PAC (for example "owned the crypto core") for public use.
9. Confirm the intended domain, and any talks, articles, hackathon photos or award certificates.
10. Include or leave out Chợ Tốt, MoMo and Creatio, and correct the duplicated MoMo / Chợ Tốt bullet.
11. Phone number: show or keep hidden.
12. Which projects to lock behind request-access, and which to show openly.
