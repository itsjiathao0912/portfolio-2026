// Page transition. A template remounts on every navigation, so this CSS
// animation replays for each new page: a short fade with a slight upward
// settle. Pure CSS — content is visible without JavaScript, and it never
// blocks clicks. Reduced motion: fade only (see globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
