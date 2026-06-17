import { createSupabaseClient } from "./supabaseClient";

export interface SavedCity {
  label: string;
  value: string;
}

const SAVED_CITIES_STORAGE_KEY = "wali-espresso-saved-cities";

export function loadSavedCitiesFromStorage(defaultCities: SavedCity[]): SavedCity[] {
  if (typeof window === "undefined") return defaultCities;

  try {
    const raw = window.localStorage.getItem(SAVED_CITIES_STORAGE_KEY);
    if (!raw) return defaultCities;

    const parsed = JSON.parse(raw) as SavedCity[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultCities;

    return parsed.filter((entry) => entry?.label && entry?.value);
  } catch {
    return defaultCities;
  }
}

export function saveSavedCitiesToStorage(cities: SavedCity[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_CITIES_STORAGE_KEY, JSON.stringify(cities));
}

export async function loadSavedCitiesFromSupabase(): Promise<SavedCity[] | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("personal_saved_cities")
    .select("label, value, position")
    .order("position", { ascending: true });

  if (error) {
    return null;
  }

  const rows = (data ?? []) as Array<{ label: string | null; value: string | null }>;
  const cities = rows
    .filter((row) => row.label && row.value)
    .map((row) => ({
      label: row.label as string,
      value: row.value as string
    }));

  return cities.length > 0 ? cities : null;
}

export async function saveSavedCitiesToSupabase(cities: SavedCity[]): Promise<boolean> {
  const supabase = createSupabaseClient();
  if (!supabase) return false;

  const { error: deleteError } = await supabase
    .from("personal_saved_cities")
    .delete()
    .gte("position", 0);

  if (deleteError) {
    return false;
  }

  const payload = cities.map((city, index) => ({
    label: city.label,
    value: city.value,
    position: index
  }));

  const { error: insertError } = await supabase
    .from("personal_saved_cities")
    .insert(payload);

  return !insertError;
}
