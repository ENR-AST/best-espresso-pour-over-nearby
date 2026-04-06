import type { CuratedCafeRecord } from "../types/coffee";
import { beanhunterRecords } from "./curated/beanhunter";
import { coffeeGeekRecords } from "./curated/coffeeGeek";
import { dailyCoffeeNewsRecords } from "./curated/dailyCoffeeNews";
import { europeanCoffeeTripRecords } from "./curated/europeanCoffeeTrip";
import { homeBaristaRecords } from "./curated/homeBarista";
import { perfectDailyGrindRecords } from "./curated/perfectDailyGrind";
import { sprudgeRecords } from "./curated/sprudge";

export const curatedCafeRecords: CuratedCafeRecord[] = [
  ...sprudgeRecords,
  ...dailyCoffeeNewsRecords,
  ...europeanCoffeeTripRecords,
  ...coffeeGeekRecords,
  ...perfectDailyGrindRecords,
  ...homeBaristaRecords,
  ...beanhunterRecords
];
