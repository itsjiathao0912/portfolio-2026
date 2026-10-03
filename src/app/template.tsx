// Page transition. A template remounts on every navigation, so this CSS
// animation replays for each new page: a short fade. Opacity only, never a
// transform, so fixed-position UI inside a page stays fixed to the viewport.
// Pure CSS: content is visible without JavaScript, and it never blocks clicks.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
