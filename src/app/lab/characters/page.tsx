import { labOnly } from "@/lib/lab-only";
import type { Metadata } from "next";
import { CharacterLab } from "./lab-client";

export const metadata: Metadata = { title: "Lab · characters", robots: { index: false, follow: false } };

export default function Page() {
  labOnly();
  return <CharacterLab />;
}
