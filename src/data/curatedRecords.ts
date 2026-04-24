import type { CuratedCafeRecord } from "../types/coffee";
import { baristappRecords } from "./curated/baristapp";
import { beanhunterRecords } from "./curated/beanhunter";
import { beanconquerorRecords } from "./curated/beanconqueror";
import { coffeeGeekRecords } from "./curated/coffeeGeek";
import { dailyCoffeeNewsRecords } from "./curated/dailyCoffeeNews";
import { europeanCoffeeTripRecords } from "./curated/europeanCoffeeTrip";
import { homeBaristaRecords } from "./curated/homeBarista";
import { perfectDailyGrindRecords } from "./curated/perfectDailyGrind";
import { regionalPriorityRecords } from "./curated/regionalPriority";
import { roastersAppRecords } from "./curated/roastersApp";
import { sprudgeRecords } from "./curated/sprudge";

export const curatedCafeRecords: CuratedCafeRecord[] = [
  ...sprudgeRecords,
  ...dailyCoffeeNewsRecords,
  ...europeanCoffeeTripRecords,
  ...coffeeGeekRecords,
  ...perfectDailyGrindRecords,
  ...homeBaristaRecords,
  ...beanhunterRecords,
  ...beanconquerorRecords,
  ...regionalPriorityRecords,
  ...roastersAppRecords,
  ...baristappRecords
];
