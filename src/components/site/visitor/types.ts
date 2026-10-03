// Visitor identity: shared avatar types (P0). Imported by the clay avatar
// system (P2), the picker (P3) and the guide (P4).

/** The four character poses, made by rotating or translating limb groups. */
export type ClayPose = "walk" | "wave" | "point" | "talk";

export const CLAY_POSES = ["walk", "wave", "point", "talk"] as const satisfies readonly ClayPose[];

/**
 * Default look of one role's character. Every field is an index into the
 * matching table in `src/components/clay/palette.ts` (owned by P2); the index
 * form keeps this contract free of colour values.
 */
export type AvatarSpec = {
  /** Skin tone index. */
  skin: number;
  /** Hair colour index. */
  hair: number;
  /** Hair style index. */
  hairStyle: number;
  /** Outfit accent colour index. */
  accent: number;
};
