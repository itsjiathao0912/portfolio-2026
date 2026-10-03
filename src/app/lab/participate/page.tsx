import type { Metadata } from "next";
import { LabParticipate } from "./lab-client";

export const metadata: Metadata = { title: "Lab · Participate", robots: { index: false, follow: false } };

export default function Page() {
  return <LabParticipate />;
}
