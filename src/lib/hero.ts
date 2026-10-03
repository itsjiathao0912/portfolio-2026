/** "<name> is <title> at <company>", unless the author already wrote that sentence. */
export function heroHeadline(profile: { name: string; title: string; company: string; headline: string }) {
  if (profile.headline.includes(" is ")) return profile.headline;
  return profile.company ? `${profile.name} is ${profile.title} at ${profile.company}` : `${profile.name} is ${profile.title}`;
}
