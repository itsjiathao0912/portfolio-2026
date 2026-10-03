"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Aspect class for the inline frame. */
  aspect?: string;
}

/**
 * Body image at full column width with 20 px corners and no frame. Clicking
 * (or Enter/Space) opens it full-screen; Escape, the close button or a click
 * on the backdrop closes it and returns focus to the image.
 */
export function ZoomImage({ src, alt, className, sizes, aspect = "aspect-[16/10]" }: ZoomImageProps) {
  const [open, setOpen] = useState(false);
  // The portal only exists after the first open, so SSR and hydration render nothing.
  const [mounted, setMounted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        aria-label={`Enlarge image: ${alt}`}
        data-testid="zoom-image"
        className={cn(
          "group relative block w-full cursor-zoom-in overflow-hidden rounded-[20px] bg-canvas focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-accent",
          aspect,
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes ?? "(min-width: 900px) 800px, 100vw"}
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
        />
      </button>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label={alt}
                  data-testid="lightbox"
                  className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 md:p-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    className="relative h-full w-full max-w-6xl"
                    initial={{ scale: reduce ? 1 : 0.96 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: reduce ? 1 : 0.96 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image src={src} alt={alt} fill unoptimized sizes="100vw" className="object-contain" />
                  </motion.div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close image"
                    className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-white text-ink-1 shadow-nav"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
