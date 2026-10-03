import { OG_CONTENT_TYPE, OG_SIZE, sectionOg } from "@/lib/seo/og";

export const alt = "About Thao Dao — Technical Product Manager";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return sectionOg({
    kicker: "About",
    title: "About Thao",
    line: "Technical Product Manager. 4+ years across fintech, cloud and blockchain, based in Ho Chi Minh City.",
  });
}
