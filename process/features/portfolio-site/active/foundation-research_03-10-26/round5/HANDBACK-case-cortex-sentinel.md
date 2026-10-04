# Handback: case/cortex-sentinel (03-10-26)

1. `tests/unit/case-study-round4.test.ts:70-73` asserts `public/work/cortex-sentinel/demo-loop.mp4` exists. The page no longer uses that clip (it shows bystanders' faces and a laptop screen, and the team-photo rule says crop to Thao only). Please drop that test so the file can be deleted; it is still publicly served until then.
2. `tests/unit/case-study-dataviz.test.ts` "Ledgr rule chart" fails on the current tree (not caused by this lane).
