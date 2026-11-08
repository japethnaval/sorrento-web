export interface Amenity {
  name: string;
  maxAdvanceDays: number;
}

export const AMENITIES = {
  "phase-1-swimming-pool": {
    name: "Phase 1 Swimming Pool",
    maxAdvanceDays: 30,
  },
  "phase-2-swimming-pool": {
    name: "Phase 2 Swimming Pool",
    maxAdvanceDays: 30,
  },
  fitness: {
    name: "Fitness",
    maxAdvanceDays: 30,
  },
  "game-room": {
    name: "Game Room",
    maxAdvanceDays: 30,
  },
  "upper-clubhouse": {
    name: "Upper Clubhouse",
    maxAdvanceDays: 30,
  },
  "music-room": {
    name: "Music Room",
    maxAdvanceDays: 30,
  },
  "basketball-court": {
    name: "Basketball Court",
    maxAdvanceDays: 30,
  },
  "indoor-play-room": {
    name: "Indoor Play Room",
    maxAdvanceDays: 30,
  },
  "tennis-court": {
    name: "Tennis Court",
    maxAdvanceDays: 30,
  },
} as const satisfies Record<string, Amenity>;

export type AmenityId = keyof typeof AMENITIES;

export const AMENITY_IDS = Object.keys(AMENITIES) as [AmenityId, ...AmenityId[]];

export function isAmenityId(value: string): value is AmenityId {
  return value in AMENITIES;
}
