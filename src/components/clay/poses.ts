// Pose table for the clay figure. Pure data + a pure lookup, so it is unit
// tested. Angles are degrees applied about the shoulder or hip. Positive angle
// swings an arm/leg toward the viewer's left (SVG rotate is clockwise).
// lArm is the viewer-left arm and always holds the role prop; rArm gestures.

export const POSE_NAMES = ["idle", "walk", "jump", "wave", "point", "talk"] as const;
export type ClayPoseName = (typeof POSE_NAMES)[number];

export type PoseSpec = {
  lLeg: number;
  rLeg: number;
  lArm: number;
  rArm: number;
  /** vertical body offset in viewBox units (negative = up) */
  bodyY: number;
  /** body lean in degrees about the feet */
  lean: number;
  /** head tilt in degrees about the neck */
  tilt: number;
  /** lifts the leg (negative y) to read as a step */
  lLift: number;
  rLift: number;
  mouth: "smile" | "open" | "grin";
  /** ground shadow scale (jump shrinks it) */
  shadow: number;
};

const base: PoseSpec = { lLeg: 3, rLeg: -3, lArm: 9, rArm: -9, bodyY: 0, lean: 0, tilt: 0, lLift: 0, rLift: 0, mouth: "smile", shadow: 1 };

/** Four walk frames (0-3). Legs alternate and lift, arms counter-swing, body bobs. */
export const WALK_FRAMES: readonly PoseSpec[] = [
  { ...base, lLeg: 20, rLeg: -14, lArm: 4, rArm: -30, bodyY: -1.5, lean: 1.5, lLift: -3, rLift: 0 },
  { ...base, lLeg: 6, rLeg: -6, lArm: 9, rArm: -12, bodyY: 0, lean: 0 },
  { ...base, lLeg: 14, rLeg: -20, lArm: 30, rArm: -4, bodyY: -1.5, lean: -1.5, lLift: 0, rLift: -3 },
  { ...base, lLeg: 6, rLeg: -6, lArm: 12, rArm: -9, bodyY: 0, lean: 0 },
];

const POSES: Record<Exclude<ClayPoseName, "walk">, PoseSpec> = {
  idle: base,
  // arms raised out to the sides (not overhead) so hands + prop stay clear of the big head
  jump: { ...base, lLeg: 16, rLeg: -16, lArm: 124, rArm: -124, bodyY: -12, lLift: -6, rLift: -6, mouth: "grin", shadow: 0.62 },
  wave: { ...base, rArm: -156, tilt: -3, mouth: "grin" },
  point: { ...base, rArm: -92, lean: -1, tilt: -2 },
  talk: { ...base, rArm: -112, lArm: 22, tilt: 3, mouth: "open" },
};

/** Resolve a pose; walk takes a frame index (wraps) so callers can step it. */
export function poseFor(pose: ClayPoseName, frame = 0): PoseSpec {
  if (pose === "walk") return WALK_FRAMES[((frame % 4) + 4) % 4]!;
  return POSES[pose];
}

/** Wave has two arm angles so the hand can flutter; frame parity picks one. */
export function waveAngle(frame: number) {
  return frame % 2 === 0 ? -156 : -138;
}
