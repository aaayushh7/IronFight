export type MealType =
  | "morning"
  | "breakfast"
  | "lunch"
  | "eveningSnack"
  | "dinner"
  | "beforeBed";

export type MealStatus = "pending" | "completed" | "missed" | "skipped";

export type ItemTag =
  | "iron-rich"
  | "vitamin-c"
  | "protein"
  | "recovery-best"
  | "light-meal";

export interface MealItemDetail {
  name: string;
  tags: ItemTag[];
}

export interface MealConfig {
  type: MealType;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  startTime: string; // "HH:MM" 24h
  endTime: string;
  items: string[]; // kept for backward compat
  itemDetails: MealItemDetail[];
}

export interface MealCompletion {
  id: string;
  date: string;
  mealType: MealType;
  items: string[];
  status: MealStatus;
  notes?: string | null;
  completedAt: string;
}

export interface Complaint {
  id: string;
  mealType: MealType;
  itemName: string;
  note?: string | null;
  status: "open" | "resolved";
  createdAt: string;
}

export interface DayProgress {
  date: string;
  totalMeals: number;
  completedMeals: number;
  missedMeals: number;
  skippedMeals: number;
  completionPercentage: number;
  completions: MealCompletion[];
}

export interface WeeklyStats {
  streak: number;
  weeklyAverage: number;
  bestDay: string | null;
  totalCompleted: number;
}

export interface MostMissedItem {
  itemName: string;
  count: number;
  mealType: MealType;
}

// ─── Tag metadata for display ────────────────────────────────────────────────
export const TAG_META: Record<ItemTag, { label: string; color: string; bg: string; emoji: string }> = {
  "iron-rich":      { label: "Iron",       color: "text-red-600",    bg: "bg-red-50 border-red-100",    emoji: "🩸" },
  "vitamin-c":      { label: "Vitamin C",  color: "text-orange-600", bg: "bg-orange-50 border-orange-100", emoji: "🍊" },
  "protein":        { label: "Protein",    color: "text-blue-600",   bg: "bg-blue-50 border-blue-100",  emoji: "💪" },
  "recovery-best":  { label: "Best",       color: "text-pink-600",   bg: "bg-pink-50 border-pink-100",  emoji: "💖" },
  "light-meal":     { label: "Light",      color: "text-teal-600",   bg: "bg-teal-50 border-teal-100",  emoji: "🌿" },
};

// ─── Default meal configs ─────────────────────────────────────────────────────

function d(name: string, tags: ItemTag[]): MealItemDetail {
  return { name, tags };
}

export const DEFAULT_MEAL_CONFIGS: MealConfig[] = [
  {
    type: "morning",
    label: "Morning Ritual",
    emoji: "🌅",
    color: "#FFD6A5",
    gradient: "from-amber-100 to-orange-50",
    startTime: "06:00",
    endTime: "07:30",
    items: [
      "Dates (khajoor)",
      "Soaked raisins",
      "Warm water",
      "Soaked almonds",
      "Soaked black chana",
      "Amla juice",
      "Lemon water",
      "Honey water",
    ],
    itemDetails: [
      d("Dates (khajoor)",    ["iron-rich", "recovery-best"]),
      d("Soaked raisins",     ["iron-rich", "recovery-best"]),
      d("Warm water",         ["light-meal"]),
      d("Soaked almonds",     ["protein", "recovery-best"]),
      d("Soaked black chana", ["iron-rich", "protein"]),
      d("Amla juice",         ["vitamin-c", "recovery-best"]),
      d("Lemon water",        ["vitamin-c", "light-meal"]),
      d("Honey water",        ["light-meal"]),
    ],
  },
  {
    type: "breakfast",
    label: "Breakfast",
    emoji: "🌸",
    color: "#F4B8C7",
    gradient: "from-rose-100 to-pink-50",
    startTime: "08:00",
    endTime: "10:00",
    items: [
      "Veg poha + peanuts",
      "Upma",
      "Besan chilla",
      "Moong dal chilla",
      "2 eggs (boiled/omelette)",
      "Paneer bhurji",
      "Sprouts salad",
      "Paratha (light)",
      "Idli + sambar",
      "Dosa",
      "Oats with nuts",
      "Fruit bowl",
      "Orange / Amla",
      "Banana",
    ],
    itemDetails: [
      d("Veg poha + peanuts",     ["iron-rich", "protein"]),
      d("Upma",                   ["light-meal"]),
      d("Besan chilla",           ["protein", "iron-rich"]),
      d("Moong dal chilla",       ["protein", "iron-rich"]),
      d("2 eggs (boiled/omelette)",["protein", "recovery-best"]),
      d("Paneer bhurji",          ["protein"]),
      d("Sprouts salad",          ["iron-rich", "protein", "recovery-best"]),
      d("Paratha (light)",        ["light-meal"]),
      d("Idli + sambar",          ["iron-rich", "light-meal"]),
      d("Dosa",                   ["light-meal"]),
      d("Oats with nuts",         ["iron-rich", "protein"]),
      d("Fruit bowl",             ["vitamin-c", "recovery-best"]),
      d("Orange / Amla",          ["vitamin-c", "recovery-best"]),
      d("Banana",                 ["recovery-best"]),
    ],
  },
  {
    type: "lunch",
    label: "Lunch",
    emoji: "🌿",
    color: "#B8E4C9",
    gradient: "from-emerald-100 to-teal-50",
    startTime: "12:30",
    endTime: "14:30",
    items: [
      "Dal",
      "Roti",
      "Rice",
      "Palak sabzi",
      "Methi sabzi",
      "Bathua sabzi",
      "Sabzi",
      "Chana",
      "Rajma",
      "Lobia",
      "Soybean / tofu",
      "Paneer",
      "Sprouts",
      "Curd",
      "Salad",
      "Lemon (mandatory)",
    ],
    itemDetails: [
      d("Dal",               ["iron-rich", "protein", "recovery-best"]),
      d("Roti",              ["light-meal"]),
      d("Rice",              ["light-meal"]),
      d("Palak sabzi",       ["iron-rich", "recovery-best"]),
      d("Methi sabzi",       ["iron-rich", "recovery-best"]),
      d("Bathua sabzi",      ["iron-rich"]),
      d("Sabzi",             ["light-meal"]),
      d("Chana",             ["iron-rich", "protein", "recovery-best"]),
      d("Rajma",             ["iron-rich", "protein"]),
      d("Lobia",             ["iron-rich", "protein"]),
      d("Soybean / tofu",    ["iron-rich", "protein"]),
      d("Paneer",            ["protein"]),
      d("Sprouts",           ["iron-rich", "protein"]),
      d("Curd",              ["protein", "light-meal"]),
      d("Salad",             ["vitamin-c", "light-meal"]),
      d("Lemon (mandatory)", ["vitamin-c", "recovery-best"]),
    ],
  },
  {
    type: "eveningSnack",
    label: "Evening Snack",
    emoji: "☁️",
    color: "#A8D8EA",
    gradient: "from-sky-100 to-blue-50",
    startTime: "16:30",
    endTime: "18:00",
    items: [
      "Roasted chana",
      "Peanuts",
      "Foxnuts (makhana)",
      "Sprouts chaat",
      "Orange / Guava / Amla",
      "Mosambi",
      "Boiled corn",
      "Dry fruit mix",
      "Peanut chikki",
      "Jaggery + nuts",
      "Pomegranate",
    ],
    itemDetails: [
      d("Roasted chana",          ["iron-rich", "protein", "recovery-best"]),
      d("Peanuts",                ["protein", "iron-rich"]),
      d("Foxnuts (makhana)",      ["light-meal"]),
      d("Sprouts chaat",          ["iron-rich", "protein"]),
      d("Orange / Guava / Amla",  ["vitamin-c", "recovery-best"]),
      d("Mosambi",                ["vitamin-c"]),
      d("Boiled corn",            ["light-meal"]),
      d("Dry fruit mix",          ["iron-rich", "recovery-best"]),
      d("Peanut chikki",          ["iron-rich", "protein"]),
      d("Jaggery + nuts",         ["iron-rich", "recovery-best"]),
      d("Pomegranate",            ["iron-rich", "vitamin-c"]),
    ],
  },
  {
    type: "dinner",
    label: "Dinner",
    emoji: "🌙",
    color: "#C9A7EB",
    gradient: "from-violet-100 to-purple-50",
    startTime: "19:30",
    endTime: "21:30",
    items: [
      "Dal",
      "Roti",
      "Palak sabzi",
      "Methi sabzi",
      "Sabzi",
      "Chana (light)",
      "Sprouts",
      "Beetroot salad",
      "Vegetable soup",
      "Khichdi",
      "Salad",
      "Lemon",
      "Rice (small portion)",
    ],
    itemDetails: [
      d("Dal",               ["iron-rich", "protein", "recovery-best"]),
      d("Roti",              ["light-meal"]),
      d("Palak sabzi",       ["iron-rich", "recovery-best"]),
      d("Methi sabzi",       ["iron-rich"]),
      d("Sabzi",             ["light-meal"]),
      d("Chana (light)",     ["iron-rich", "protein"]),
      d("Sprouts",           ["iron-rich", "protein"]),
      d("Beetroot salad",    ["iron-rich", "recovery-best"]),
      d("Vegetable soup",    ["light-meal", "recovery-best"]),
      d("Khichdi",           ["iron-rich", "light-meal"]),
      d("Salad",             ["light-meal", "vitamin-c"]),
      d("Lemon",             ["vitamin-c", "recovery-best"]),
      d("Rice (small portion)", ["light-meal"]),
    ],
  },
  {
    type: "beforeBed",
    label: "Before Bed",
    emoji: "✨",
    color: "#E8D5F5",
    gradient: "from-purple-100 to-pink-50",
    startTime: "21:30",
    endTime: "22:30",
    items: [
      "Date",
      "Jaggery (gud)",
      "Warm water",
      "Soaked raisins",
      "Light milk (optional)",
    ],
    itemDetails: [
      d("Date",                ["iron-rich", "recovery-best"]),
      d("Jaggery (gud)",       ["iron-rich", "recovery-best"]),
      d("Warm water",          ["light-meal"]),
      d("Soaked raisins",      ["iron-rich"]),
      d("Light milk (optional)",["protein", "light-meal"]),
    ],
  },
];
