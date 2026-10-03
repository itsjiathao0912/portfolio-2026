"use client";

import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";
import { SPRING } from "@/components/motion/springs";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DISCLOSURES, DISCLOSURES_FOOTNOTE } from "./disclosures-data";

/**
 * Footer link plus a calm glass sheet: bottom sheet on phones, centred card on
 * wider screens. Radix Dialog gives the focus trap, Esc and focus return.
 */
export function Disclosures() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-testid="disclosures-link"
          className="inline-flex min-h-11 items-center px-3 text-sm text-ink-3 underline-offset-2 hover:text-ink-1 hover:underline"
        >
          How numbers are labelled
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-black/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
              />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center sm:items-center sm:p-6">
              <Dialog.Content asChild forceMount aria-describedby="disclosures-desc">
                <motion.div
                  data-testid="disclosures-sheet"
                  className="glass pointer-events-auto max-h-[85dvh] w-full overflow-y-auto rounded-t-xl p-6 pb-8 outline-none sm:max-w-[520px] sm:rounded-xl"
                  data-tint="light"
                  style={{ background: "#fff" }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 48 }}
                  transition={reduce ? { duration: 0 } : SPRING.sheet}
                >
                  <span aria-hidden="true" className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-black/15 sm:hidden" />
                  <div className="flex items-start justify-between gap-4">
                    <Dialog.Title className="text-[24px] leading-[1.2]">How numbers are labelled</Dialog.Title>
                    <Dialog.Close
                      aria-label="Close"
                      className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:text-ink-1"
                    >
                      <X className="size-5" aria-hidden="true" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description id="disclosures-desc" className="mt-2 text-[15px] text-ink-2">
                    Every figure on this site carries one of these labels, so you know how far to trust it.
                  </Dialog.Description>
                  <dl className="mt-5 flex flex-col divide-y divide-hairline">
                    {DISCLOSURES.map((d) => (
                      <div key={d.id} className="flex flex-col gap-1 py-3" data-testid="disclosure-item">
                        <dt className="font-medium text-ink-1">{d.label}</dt>
                        <dd className="text-[15px] text-ink-2">{d.meaning}</dd>
                        <dd className="text-[14px] text-ink-3">Example: {d.example}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-[13px] text-ink-3">{DISCLOSURES_FOOTNOTE}</p>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
