# Latest-build checklist

**The user is on the latest build only when you can show it from THEIR browser (a build label or a
log line they produced), not from the server.**

Run this before ANY "ready to retest" message. Most reliable first.

1. **Visible build label + a log line the user produced.** The page shows a build stamp (commit sha + time). Ask the user to read it out (or the time), then confirm that `build=<sha>` appears in the dev-log lines their device wrote. Add the stamp to the page if it is missing.
2. **Fresh tab, clear old files once.** Phone: a NEW private tab. Laptop: hard refresh, or DevTools Network > Disable cache once. Old tabs mix old and new chunks.
3. **Check whose browser wrote the log line.** A laptop line without `build=` means that laptop is stale while the phone is fresh.
4. **A no-store header or cache rule on dev assets**, so a normal reload suffices. Check it is actually in effect for the host the user is using.

Never judge by a server version endpoint (it always reports the server's own sha) or by the main-chunk label alone: lazy chunks and workers load separately, so a stale tab can still run old code under a fresh label.

Every "it's live" message must carry:
- the tip sha and the time;
- the refresh instruction per device (and permission-reset steps if relevant);
- a one-line health check (page returns 200, no compile error in the dev log);
- what is NOT yet on the link;
- a real-device checklist for what automation cannot test.

Also remember: merging into the served worktree reloads the user's page mid-test.

Project specifics (dev URLs, cache rule, restart command, build stamp env var): this repo's platform context group (`process/context/platform/all-platform.md`); no phone/tunnel doc exists yet.
