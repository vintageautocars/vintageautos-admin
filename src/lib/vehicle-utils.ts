export const CATEGORY_LABELS: Record<string, string> = {
  CLASSIC_VINTAGE: 'Classic & Vintage',
  VINTAGE_MERCEDES: 'Vintage Mercedes-Benz',
  CLASSIC_CONVERTIBLE: 'Classic Convertibles',
  CLASSIC_SUV: 'Classic SUVs',
  VINTAGE_SPORTS: 'Vintage Sports Cars',
  OTHER_COLLECTIBLE: 'Other Collectibles',
};

export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}
