import { labOnly } from "@/lib/lab-only";
import type { Metadata } from "next";
import { ContactSheet } from "@/components/clay/contact-sheet";

export const metadata: Metadata = { title: "Lab · clay", robots: { index: false, follow: false } };

export default function Page() {
  labOnly();
  return <ContactSheet />;
}
