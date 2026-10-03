// Pure helpers for run-isolated-e2e.mjs: undo `next build`'s tsconfig.json edits.

export function stripStaleE2eIncludes(config, dirExists) {
  if (!Array.isArray(config.include)) return config;
  return {
    ...config,
    include: config.include.filter(
      (entry) => !(typeof entry === "string" && entry.startsWith(".next-e2e-") && !dirExists(entry.split("/")[0]))
    ),
  };
}

/** The text to write back, or null to leave the file alone. */
export function restoredTsconfigText(beforeText, afterText, dirExists) {
  let before;
  let after;
  try {
    before = JSON.parse(beforeText);
    after = JSON.parse(afterText);
  } catch {
    return null;
  }
  const cleanBefore = stripStaleE2eIncludes(before, dirExists);
  const cleanAfter = stripStaleE2eIncludes(after, dirExists);
  if (JSON.stringify(cleanAfter) !== JSON.stringify(cleanBefore)) return null;
  // Keep the before-text byte for byte when it had nothing stale in it.
  return JSON.stringify(cleanBefore) === JSON.stringify(before) ? beforeText : `${JSON.stringify(cleanBefore, null, 2)}\n`;
}
