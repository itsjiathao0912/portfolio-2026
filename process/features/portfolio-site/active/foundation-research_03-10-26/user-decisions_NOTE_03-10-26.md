# User decisions (Thao) - 03-10-26

Source of truth for content. Confirmed by Thao unless marked OPEN.

## Confirmed
- Cortex Sentinel: 2nd place, AABW (Agentic AI Build Week) Fintech track.
- Ledgr: validated with ~20 people at a buildstuffs meetup (Build Stuffs, buildstuffs.duma.so). Show Ledgr publicly (no IP concern).
- Lumicap ($635M AUM, 17 investors) and COSAP (60% / 24hr / 40%) marketing figures: OK to show, labelled as company facts.
- Ledgr rule count: state the code-accurate figure; frame "100+ rules" as roadmap/vision, clearly labelled. See Evidence below for the count.
- Internal product screenshots: not yet; use placeholders.
- Earlier: no forms; email + socials only; show everything (no NDA locks); include every experience; hide talks.

## Previously OPEN - now RESOLVED (Thao's final answers, CONFIRMED)
- MoMo: use only info from her CV PDF and the old resume/portfolio; if none, show title + dates only.
- Zalo: CV version (Feb 2023, Product Owner).
- ReOrc start date: CV version.
- ReOrc 40% metric: CV wording.
- Creatio: her figures (2,500+, 20+).
- Notion work-sample PDFs: later.
- Youpreneur/LocoZ: leave out.

## Evidence

### Ledgr rule count (code-accurate)
Repo: research-private/media/projects/_repos/ledgr-webapp/supabase/migrations
- 20260616000002_seed_labor_rules.sql: 15 rules (labor_contract: min wage x4 regions, probation caps x3, probation wage floor, overtime x2, BHXH, PIT withholding, fixed-term renewals, working hours, annual leave).
- 20260618000001_seed_doctype_rules.sql: 12 rules (accounting_voucher 2, einvoice 2, pit_finalization 3, vat_declaration 2, vendor_service 3).
- **Total seeded in migrations: 27 rules across 6 document types** (no other INSERT INTO rules found in supabase/, scripts/, src/). Rule_sources table also seeded (crawler URLs) - not rules.
- Landing page in the meetup photos shows a "100+" stat - that is marketing/roadmap, not the seeded count. Suggested copy: "27 verified rules across 6 document types today; 100+ is the roadmap." Caveat: rules may be added at runtime by the crawler/verify pipeline (verify-rules.ts); count is for seeded migrations only. Nine doc types are labelled in the UI (doc-type-labels.ts).

### Meetup evidence (buildstuffs.duma.so)
Series: https://buildstuffs.duma.so (13 sessions, BS30-BS40). Thao's posts titled "Thao Dao - Ledgr" exist in three sessions; all link https://ledgr-webapp.vercel.app/ ("Ledgr - AI Compliance Assistant for Vietnamese SMEs"):
| Session | Date | URL | Posts (attendees) | Thao post | Demo intent |
|---|---|---|---|---|---|
| BS33 "Cowork Showcase for Tech/Growth Builders" | 2026-06-20 | https://buildstuffs.duma.so/bs33 | 31 (all 31 verified) | a0pv6lu6wjrmqm9fve1, "Will you demo: Yes" | Yes 11 / Maybe later 11 / No 3 / blank 6 |
| BS34 "Build Stuffs #34" | 2026-07-04 | https://buildstuffs.duma.so/bs34 | 71 (63 verified) | 9q95rw6k1m8mr6iw6dz, demo "No" | Yes 24 / later 25 / No 14 |
| BS36 | 2026-08-01 | https://buildstuffs.duma.so/bs36 | 85 | fd7wi87xcsbms8xz1f2, demo "No" | - |
(BS35 post is "Thao Dao - Duma", not Ledgr.)

**Best candidate for "validated with ~20 people": BS33.** It is the only Ledgr post with demo intent "Yes", it carries 5 photos + a video clip of the Ledgr landing page on a laptop and the projected room, and 11 declared demoers + 31 attendees fits "~20". Ky-Nam (host) commented "thank youuuuu". BS34 is the alternative (large group photo, 13 videos, 71 attendees). **Thao should confirm which session**; the ~20 figure itself is Thao's claim, not verifiable from the platform (no votes/feedback recorded; voting disabled on BS33).
- BS33 post text: "I'm building Ledgr - AI Compliance Assistant for Vietnamese SMEs. I'm using ky-nam vibecode promax to cook this project..." (Thao's own post).
- Luma event page: BS33 has no linked Luma event in Duma (lumaEventSlug null), and a web search found none. Luma slugs exist for BS35-BS40 (e.g. bs36 uno30t0p) only. Attendee count sourced = Duma post count above.

### Files (research-private/media/ledgr-meetup/, gitignored)
- bs33-session-page.png, bs33-session-page-text.txt (public page capture)
- posts_bs33.json, posts_bs34.json, posts_bs36.json (public post.listBySession API responses)
- contact-sheet_thao-own-uploads.jpg (all images below, bs33 x5, bs34 x6, bs36 x1)
- bs33/: thao_cshi7j6s2vlmqm9hlzf.jpg (dark room, projector, Thao at laptop, wide scene), thao_0w3pjeknmndbmqm9hlxo.jpg / thao_kz3if55cwxdmqm9g3jh.jpg / thao_rv9vp17cm3mqm9g3i6.jpg / thao_ybcphay4g1mqm9hls8.jpg (Ledgr landing "Check every compliance document - employment, social insurance, tax - in minutes" on laptop screen; no people), thao_b14pclxvz6dmqm9g3nm.mp4 (clip of presentations; video-bs33-frames.jpg = 3 frames)
- bs34/: thao_xcle07ech8mr6iy5j6.jpg, 18azee..., 3gxjpl..., 4sunn3..., mesbsm... = same group photo of the whole room (many faces; use only if attendees consent, else skip); thao_05tkxlunsm53mr6iw8mk.jpg = laptop screen
- bs36/: thao_iyeerybdcysms8y28xr.jpg (not reviewed in detail)
Best publishable picks: bs33 laptop-landing shots (no faces) and bs33 wide room shot (faces tiny/dark). All are Thao's own uploads, public on the Duma gallery.
Not downloaded: other attendees' photos (skipped by instruction).

## Round 5 decisions (Thao delegated, 2026-10-03)

CONFIRMED for all builders:

1. **Cortex "−186 reviewed per period"**: meaning unconfirmed. Do NOT show this figure anywhere. Any threshold slider uses only clearly defined deck figures: 6.5% auto-closed, 0 true positives missed, manual review 100 → 81.6, labelled as a backtest on sample data.
2. **COSAP + Luminet decks (marked confidential)**: results figures MAY be shown (labelled with deck + page). Customer/client names stay hidden (Chong Wei, WAPS, Taiwan Steel, ARIZE become "a manufacturing client" etc.). Do NOT quote deck text verbatim beyond short phrases; paraphrase. Diagrams are redrawn, never raw deck pages.
3. **GoCrypto**: present as "independent product strategy (2026), built from public sources". No claim about a job application or employer.
4. **Ledgr "~20 people"**: refers to Build Stuffs #33 (2026-06-20, where she demoed). Phrase it as her statement.
5. **Zalo "+3% paying users"**: show exactly as written in her CV ("+3% paying users"), no pp/percent reinterpretation. No dashboard screenshot exists; use charts/illustration only.
6. **AABW**: "2nd place, Agentic AI Build Week 2026", no track name. Guardline: no placement claim. AABW team photo: crop to Thao only unless she later confirms teammates' consent.
