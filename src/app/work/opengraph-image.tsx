import { bundledCaseStudies } from "@/lib/seo/site-meta";
import { OG_CONTENT_TYPE, OG_SIZE, sectionOg } from "@/lib/seo/og";

export const alt = "Selected work by Thao Dao";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const count = bundledCaseStudies().length;
  return sectionOg({
    kicker: "Work",
    title: "Selected work",
    line: `${count} case studies: platforms owned end to end, growth and data work, and a few products of my own.`,
  });
}
