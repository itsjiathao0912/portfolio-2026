import { notFound } from "next/navigation";

/** /lab pages are component demos for development only; they 404 in production builds. */
export function labOnly() {
  if (process.env["NODE_ENV"] === "production") notFound();
}
