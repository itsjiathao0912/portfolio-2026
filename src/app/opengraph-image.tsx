import site from "@content/site.ts";
import { homeOg, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og";

export const alt = `${site.profile.name} — ${site.profile.title}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const { profile } = site;
  return homeOg({
    name: profile.name,
    title: profile.title,
    line: "Fintech, payments and compliance products that ship.",
    location: "Ho Chi Minh City",
  });
}
