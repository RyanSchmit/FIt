import type { FoodItem } from "./nutrition";

/**
 * Built-in catalog of calorie-dense, easy-to-eat foods for closing a daily
 * surplus gap. Values are approximate per the listed serving.
 */
export const BULK_FOODS: FoodItem[] = [
  { id: "bulk-milk", name: "Whole milk", calories: 150, protein: 8, servingLabel: "1 cup" },
  { id: "bulk-pb", name: "Peanut butter", calories: 190, protein: 7, servingLabel: "2 tbsp" },
  { id: "bulk-trailmix", name: "Trail mix", calories: 290, protein: 8, servingLabel: "1/2 cup" },
  { id: "bulk-granola", name: "Granola", calories: 280, protein: 6, servingLabel: "1/2 cup" },
  { id: "bulk-oliveoil", name: "Olive oil drizzle", calories: 120, protein: 0, servingLabel: "1 tbsp" },
  { id: "bulk-yogurt", name: "Greek yogurt", calories: 150, protein: 17, servingLabel: "1 cup" },
  { id: "bulk-shake", name: "Mass-gainer shake", calories: 380, protein: 30, servingLabel: "1 scoop + milk" },
  { id: "bulk-avocado", name: "Avocado", calories: 240, protein: 3, servingLabel: "1 whole" },
  { id: "bulk-cheese", name: "Cheddar cheese", calories: 115, protein: 7, servingLabel: "1 oz" },
  { id: "bulk-banana-pb", name: "Banana + peanut butter", calories: 295, protein: 8, servingLabel: "1 + 2 tbsp" },
  { id: "bulk-eggs", name: "Whole eggs", calories: 140, protein: 12, servingLabel: "2 eggs" },
  { id: "bulk-oats", name: "Oats w/ honey", calories: 320, protein: 10, servingLabel: "1 cup cooked" },
];

export interface Suggestion {
  id: string;
  label: string;
  items: { food: FoodItem; servings: number }[];
  calories: number;
  protein: number;
}

/**
 * Propose foods to fill the remaining calorie gap for the day. Returns up to
 * three single-food options (1-4 servings each) ranked by how closely they hit
 * the gap, with a tie-break favoring protein density.
 */
export function suggestToFill(
  remainingKcal: number,
  library: FoodItem[],
): Suggestion[] {
  if (remainingKcal <= 50) return [];

  // De-duplicate the pool by lowercased name; the user's own library wins.
  const pool = new Map<string, FoodItem>();
  for (const f of BULK_FOODS) pool.set(f.name.toLowerCase(), f);
  for (const f of library) {
    if (f.calories > 0) pool.set(f.name.toLowerCase(), f);
  }

  const candidates: Suggestion[] = [];
  for (const food of pool.values()) {
    if (food.calories <= 0) continue;
    const ideal = Math.round(remainingKcal / food.calories);
    const servings = Math.max(1, Math.min(4, ideal));
    const calories = food.calories * servings;
    const protein = food.protein * servings;
    // Skip options that blow far past the gap with a single serving.
    if (servings === 1 && calories > remainingKcal * 1.6) continue;

    candidates.push({
      id: food.id,
      label: servings > 1 ? `${servings}x ${food.name}` : food.name,
      items: [{ food, servings }],
      calories,
      protein,
    });
  }

  const proteinWeight = 4; // bias toward protein-rich options
  candidates.sort((a, b) => {
    const scoreA = -Math.abs(remainingKcal - a.calories) + proteinWeight * a.protein;
    const scoreB = -Math.abs(remainingKcal - b.calories) + proteinWeight * b.protein;
    return scoreB - scoreA;
  });

  return candidates.slice(0, 3);
}
