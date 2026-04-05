import type { CuratedCafeRecord } from "../types/coffee";
import { coffeeGeekRecords } from "./curated/coffeeGeek";
import { dailyCoffeeNewsRecords } from "./curated/dailyCoffeeNews";
import { europeanCoffeeTripRecords } from "./curated/europeanCoffeeTrip";
import { sprudgeRecords } from "./curated/sprudge";

export const curatedCafeRecords: CuratedCafeRecord[] = [
  ...sprudgeRecords,
  ...dailyCoffeeNewsRecords,
  ...europeanCoffeeTripRecords,
  ...coffeeGeekRecords
];
