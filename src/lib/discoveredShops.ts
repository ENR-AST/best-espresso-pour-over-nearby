import type { CoffeeShop } from "../types/coffee";

const STORAGE_KEY = "wali-espresso-discovered-shops";

export function loadDiscoveredShops(): CoffeeShop[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CoffeeShop[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDiscoveredShops(shops: CoffeeShop[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
}
