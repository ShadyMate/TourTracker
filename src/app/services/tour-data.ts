// Supported transportation categories for a tour entry.
export type TravelMode = 'hiking' | 'cycling' | 'driving';

// Canonical shape used by the UI and helper functions.
export interface TourItem {
  readonly id: number;
  readonly name: string;
  readonly from: string;
  readonly to: string;
  readonly distanceKm: number;
  readonly durationMinutes: number;
  readonly mode: TravelMode;
  readonly favorite: boolean;
}

// Aggregate values derived from a list of tours.
export interface TourStats {
  readonly count: number;
  readonly totalDistanceKm: number;
  readonly averageDurationMinutes: number;
}

// Tiny in-memory seed dataset for development/demo purposes.
export const TOURS: readonly TourItem[] = [
  {
    id: 1,
    name: 'Vienna City Loop',
    from: 'Vienna',
    to: 'Vienna',
    distanceKm: 18,
    durationMinutes: 160,
    mode: 'cycling',
    favorite: true,
  },
  {
    id: 2,
    name: 'Salzburg Old Town Walk',
    from: 'Salzburg',
    to: 'Hohensalzburg Fortress',
    distanceKm: 6,
    durationMinutes: 90,
    mode: 'hiking',
    favorite: false,
  },
  {
    id: 3,
    name: 'Innsbruck Panorama Drive',
    from: 'Innsbruck',
    to: 'Nordkette Base',
    distanceKm: 22,
    durationMinutes: 45,
    mode: 'driving',
    favorite: true,
  },
] as const;

// Pure filter helper: returns tours whose name/from/to contains the query text.
export function filterToursByQuery(
  tours: readonly TourItem[],
  query: string,
): TourItem[] {
  // Normalize once so matching is case-insensitive and whitespace-tolerant.
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    // Return a new array to keep this function side-effect free.
    return [...tours];
  }

  return tours.filter((tour) => {
    const searchableText = `${tour.name} ${tour.from} ${tour.to}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
}

// Pure aggregation helper for rendering list summary values.
export function summarizeTours(tours: readonly TourItem[]): TourStats {
  const count = tours.length;
  const totalDistanceKm = tours.reduce((sum, tour) => sum + tour.distanceKm, 0);
  const totalDurationMinutes = tours.reduce(
    (sum, tour) => sum + tour.durationMinutes,
    0,
  );

  return {
    count,
    totalDistanceKm,
    // Avoid division by zero for an empty result set.
    averageDurationMinutes: count === 0 ? 0 : totalDurationMinutes / count,
  };
}

// Example usage of the filter helper.
export const filteredToursExample: TourItem[] = filterToursByQuery(TOURS, 'salzburg');
// Example usage of the summary helper.
export const tourStatsExample: TourStats = summarizeTours(TOURS);


// TASK 5 BEGINS HERE //


// Domain variant for mode-specific behavior.
// `mode` is the discriminator used for safe type narrowing.
export type TravelModeDetails =
  | {
      mode: 'hiking';
      averageSpeedKmH: 5;
      terrain: 'trail' | 'mixed';
    }
  | {
      mode: 'cycling';
      averageSpeedKmH: 16;
      bikeType: 'road' | 'city' | 'mountain';
    }
  | {
      mode: 'driving';
      averageSpeedKmH: 60;
      fuel: 'ev' | 'gasoline' | 'diesel';
    };

// Exhaustiveness guard: compile-time protection for forgotten cases.
function assertNever(value: never): never {
  throw new Error(`Unhandled travel mode variant: ${JSON.stringify(value)}`);
}

// Example processor using narrowing + exhaustive switch.
export function estimateDurationMinutes(
  distanceKm: number,
  details: TravelModeDetails,
): number {
  switch (details.mode) {
    case 'hiking':
      return Math.round((distanceKm / details.averageSpeedKmH) * 60);
    case 'cycling':
      return Math.round((distanceKm / details.averageSpeedKmH) * 60);
    case 'driving':
      return Math.round((distanceKm / details.averageSpeedKmH) * 60);
    default:
      return assertNever(details);
  }
}

/*
Maintainability benefit:
- Adding a new mode forces compile errors in every switch that forgot to handle it.
- This prevents silent runtime gaps and keeps domain logic explicit.
*/