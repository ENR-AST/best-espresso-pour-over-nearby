import type { CoffeeShop } from "../types/coffee";

export const mockCoffeeShops: CoffeeShop[] = [
  {
    id: "ninth-street",
    name: "Ninth Street Espresso",
    neighborhood: "SoHo",
    city: "New York",
    zipCode: "10013",
    latitude: 40.7244,
    longitude: -74.0013,
    openNow: true,
    tags: ["espresso", "specialty"],
    distanceHintMiles: 0.3,
    espressoEvidence: 9.5,
    pourOverEvidence: 6.8,
    roasterProgram: 6.5,
    credibilitySignals: 8.4,
    publicRating: 4.6,
    whyRecommended:
      "A long-running specialty standard with strong espresso consistency and repeated editorial mentions.",
    sources: [
      {
        source: "Sprudge",
        category: "editorial",
        note: "Recognized for specialty coffee credibility and espresso consistency.",
        weight: 1,
        url: "https://sprudge.com"
      },
      {
        source: "CoffeeGeek",
        category: "community",
        note: "Forum mentions praise dialed-in shots and reliable bar flow.",
        weight: 0.7,
        url: "https://coffeegeek.com"
      },
      {
        source: "Beanhunter",
        category: "curated-app",
        note: "Repeatedly tagged as an espresso-first stop.",
        weight: 0.8,
        url: "https://www.beanhunter.com"
      }
    ],
    externalLinks: [
      { label: "Website", url: "https://ninthstreetespresso.com" },
      { label: "Instagram", url: "https://instagram.com/ninthstreetespresso" }
    ]
  },
  {
    id: "la-cabranewyork",
    name: "La Cabra NYC",
    neighborhood: "SoHo",
    city: "New York",
    zipCode: "10013",
    latitude: 40.7227,
    longitude: -74.0022,
    openNow: true,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 0.2,
    espressoEvidence: 8.9,
    pourOverEvidence: 9.6,
    roasterProgram: 9.4,
    credibilitySignals: 9.1,
    publicRating: 4.7,
    whyRecommended:
      "An internationally respected roaster with unusually strong pour-over credibility and a serious coffee menu.",
    sources: [
      {
        source: "European Coffee Trip",
        category: "editorial",
        note: "Featured for coffee program depth and destination-worthy brew service.",
        weight: 1,
        url: "https://europeancoffeetrip.com"
      },
      {
        source: "Daily Coffee News",
        category: "editorial",
        note: "Covered as a notable roaster-led specialty operator.",
        weight: 1,
        url: "https://dailycoffeenews.com"
      },
      {
        source: "Roasters app",
        category: "curated-app",
        note: "Listed as a roaster destination with retail presence.",
        weight: 0.8,
        url: "https://apps.apple.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://lacabra.com" }]
  },
  {
    id: "sey-brooklyn",
    name: "SEY Coffee",
    neighborhood: "East Williamsburg",
    city: "Brooklyn",
    zipCode: "11206",
    latitude: 40.7079,
    longitude: -73.9346,
    openNow: true,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 3.9,
    espressoEvidence: 8.8,
    pourOverEvidence: 9.7,
    roasterProgram: 9.8,
    credibilitySignals: 9.3,
    publicRating: 4.8,
    whyRecommended:
      "One of the strongest filter-coffee destinations in the city, with roastery credibility and competition-level sourcing.",
    sources: [
      {
        source: "Perfect Daily Grind",
        category: "editorial",
        note: "Editorially aligned with high-transparency specialty roasting.",
        weight: 1,
        url: "https://perfectdailygrind.com"
      },
      {
        source: "Home-Barista",
        category: "community",
        note: "Community discussion highlights roast quality and brew clarity.",
        weight: 0.7,
        url: "https://www.home-barista.com"
      },
      {
        source: "Baristapp",
        category: "curated-app",
        note: "Appears in barista-focused lists for high-end coffee service.",
        weight: 0.8,
        url: "https://baristapp.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://seycoffee.com" }]
  },
  {
    id: "devocion-wburg",
    name: "Devocion Williamsburg",
    neighborhood: "Williamsburg",
    city: "Brooklyn",
    zipCode: "11211",
    latitude: 40.7191,
    longitude: -73.9584,
    openNow: true,
    tags: ["espresso", "roaster", "specialty"],
    distanceHintMiles: 2.5,
    espressoEvidence: 8.2,
    pourOverEvidence: 7.1,
    roasterProgram: 9.2,
    credibilitySignals: 8.5,
    publicRating: 4.7,
    whyRecommended:
      "Roaster-led cafe with strong freshness story and a polished espresso-focused experience.",
    sources: [
      {
        source: "Daily Coffee News",
        category: "editorial",
        note: "Covered for sourcing and roasting program.",
        weight: 1,
        url: "https://dailycoffeenews.com"
      },
      {
        source: "Beanconqueror",
        category: "curated-app",
        note: "Included in brew logs and enthusiast roaster tracking.",
        weight: 0.6,
        url: "https://beanconqueror.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://www.devocion.com" }]
  },
  {
    id: "st-kilda",
    name: "St Kilda Coffee",
    neighborhood: "Hell's Kitchen",
    city: "New York",
    zipCode: "10019",
    latitude: 40.7635,
    longitude: -73.9894,
    openNow: false,
    tags: ["espresso", "pour-over", "specialty"],
    distanceHintMiles: 2.8,
    espressoEvidence: 8.1,
    pourOverEvidence: 8.4,
    roasterProgram: 5.4,
    credibilitySignals: 7.9,
    publicRating: 4.7,
    whyRecommended:
      "Balanced specialty shop with both espresso and manual brew signals, useful when you want brew quality over hype.",
    sources: [
      {
        source: "CoffeeGeek",
        category: "community",
        note: "Mentioned favorably for brew execution and shot quality.",
        weight: 0.7,
        url: "https://coffeegeek.com"
      },
      {
        source: "Beanhunter",
        category: "curated-app",
        note: "Tagged by specialty-focused users rather than tourist traffic.",
        weight: 0.8,
        url: "https://www.beanhunter.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://www.stkildacoffee.com" }]
  },
  {
    id: "blue-bottle-bryant",
    name: "Blue Bottle Bryant Park",
    neighborhood: "Midtown",
    city: "New York",
    zipCode: "10018",
    latitude: 40.7542,
    longitude: -73.9838,
    openNow: true,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 2.6,
    espressoEvidence: 7.9,
    pourOverEvidence: 8.7,
    roasterProgram: 8.8,
    credibilitySignals: 8.1,
    publicRating: 4.5,
    whyRecommended:
      "Reliable roaster cafe with a strong brew bar reputation and enough evidence to stay in the specialty tier.",
    sources: [
      {
        source: "Sprudge",
        category: "editorial",
        note: "Covered as part of specialty coffee evolution and standards.",
        weight: 1,
        url: "https://sprudge.com"
      },
      {
        source: "Roasters app",
        category: "curated-app",
        note: "Recognized as a roaster-backed location.",
        weight: 0.8,
        url: "https://apps.apple.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://bluebottlecoffee.com" }]
  },
  {
    id: "coffee-project-east-village",
    name: "Coffee Project New York",
    neighborhood: "East Village",
    city: "New York",
    zipCode: "10009",
    latitude: 40.7275,
    longitude: -73.9844,
    openNow: true,
    tags: ["espresso", "pour-over", "specialty"],
    distanceHintMiles: 1.4,
    espressoEvidence: 8.7,
    pourOverEvidence: 8.8,
    roasterProgram: 6.1,
    credibilitySignals: 9,
    publicRating: 4.7,
    whyRecommended:
      "Strong barista credibility, competition-minded drinks, and a reputation for taking both espresso and filter service seriously.",
    sources: [
      {
        source: "Perfect Daily Grind",
        category: "editorial",
        note: "Editorially aligned with serious brewing craft.",
        weight: 1,
        url: "https://perfectdailygrind.com"
      },
      {
        source: "Baristapp",
        category: "curated-app",
        note: "Noted for training and barista development relevance.",
        weight: 0.8,
        url: "https://baristapp.com"
      },
      {
        source: "Home-Barista",
        category: "community",
        note: "Enthusiast praise for drink quality and workflow.",
        weight: 0.7,
        url: "https://www.home-barista.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://coffeeprojectny.com" }]
  },
  {
    id: "onyx-nolita-lab",
    name: "Onyx Lab Pop-Up",
    neighborhood: "NoLita",
    city: "New York",
    zipCode: "10012",
    latitude: 40.7237,
    longitude: -73.9946,
    openNow: false,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 0.7,
    espressoEvidence: 8.5,
    pourOverEvidence: 9.1,
    roasterProgram: 9.5,
    credibilitySignals: 9.2,
    publicRating: 4.4,
    whyRecommended:
      "Roaster credibility is extremely high, and the brew menu is built for people who care about cup quality, not just ambiance.",
    sources: [
      {
        source: "Daily Coffee News",
        category: "editorial",
        note: "Strong specialty roaster recognition.",
        weight: 1,
        url: "https://dailycoffeenews.com"
      },
      {
        source: "Roasters app",
        category: "curated-app",
        note: "Roaster-backed listing reinforces credibility.",
        weight: 0.8,
        url: "https://apps.apple.com"
      },
      {
        source: "Beanconqueror",
        category: "curated-app",
        note: "Frequently tracked by brew enthusiasts.",
        weight: 0.6,
        url: "https://beanconqueror.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://onyxcoffeelab.com" }]
  },
  {
    id: "philz-mission",
    name: "Philz Coffee Mission",
    neighborhood: "Mission District",
    city: "San Francisco",
    zipCode: "94110",
    latitude: 37.7605,
    longitude: -122.4144,
    openNow: true,
    tags: ["specialty"],
    distanceHintMiles: 0.4,
    espressoEvidence: 4.5,
    pourOverEvidence: 3.8,
    roasterProgram: 6.8,
    credibilitySignals: 4.9,
    publicRating: 4.6,
    whyRecommended:
      "Popular and convenient, but it ranks lower because specialty espresso and pour-over evidence is limited.",
    sources: [
      {
        source: "Beanhunter",
        category: "public-review",
        note: "Mostly public-review driven support.",
        weight: 0.4,
        url: "https://www.beanhunter.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://www.philzcoffee.com" }]
  },
  {
    id: "sightglass-mission",
    name: "Sightglass Coffee",
    neighborhood: "SoMa",
    city: "San Francisco",
    zipCode: "94103",
    latitude: 37.7764,
    longitude: -122.4082,
    openNow: true,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 0.6,
    espressoEvidence: 8.8,
    pourOverEvidence: 8.9,
    roasterProgram: 9.3,
    credibilitySignals: 8.8,
    publicRating: 4.7,
    whyRecommended:
      "A strong all-around specialty pick with roaster credibility and depth across espresso and filter offerings.",
    sources: [
      {
        source: "Sprudge",
        category: "editorial",
        note: "Editorially recognized as an important specialty cafe-roaster.",
        weight: 1,
        url: "https://sprudge.com"
      },
      {
        source: "Roasters app",
        category: "curated-app",
        note: "Listed as a notable roaster destination.",
        weight: 0.8,
        url: "https://apps.apple.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://sightglasscoffee.com" }]
  },
  {
    id: "verve-market",
    name: "Verve Coffee Roasters Market Street",
    neighborhood: "Downtown",
    city: "San Francisco",
    zipCode: "94103",
    latitude: 37.7851,
    longitude: -122.4063,
    openNow: false,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 1.2,
    espressoEvidence: 8.1,
    pourOverEvidence: 8.5,
    roasterProgram: 9.1,
    credibilitySignals: 8.2,
    publicRating: 4.6,
    whyRecommended:
      "Roaster-backed shop with real specialty depth, especially when you want both espresso and filter options.",
    sources: [
      {
        source: "Daily Coffee News",
        category: "editorial",
        note: "Covered as a specialty roaster and cafe operator.",
        weight: 1,
        url: "https://dailycoffeenews.com"
      },
      {
        source: "European Coffee Trip",
        category: "editorial",
        note: "Destination-grade specialty recognition.",
        weight: 1,
        url: "https://europeancoffeetrip.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://www.vervecoffee.com" }]
  },
  {
    id: "ritual-valencia",
    name: "Ritual Coffee Roasters Valencia",
    neighborhood: "Mission District",
    city: "San Francisco",
    zipCode: "94110",
    latitude: 37.7642,
    longitude: -122.4212,
    openNow: true,
    tags: ["espresso", "pour-over", "roaster", "specialty"],
    distanceHintMiles: 0.7,
    espressoEvidence: 8.4,
    pourOverEvidence: 8.3,
    roasterProgram: 9.2,
    credibilitySignals: 8.4,
    publicRating: 4.7,
    whyRecommended:
      "A classic roaster-cafe pick with broad specialty support and a menu that rewards coffee-first visitors.",
    sources: [
      {
        source: "Sprudge",
        category: "editorial",
        note: "Consistently recognized in specialty coffee coverage.",
        weight: 1,
        url: "https://sprudge.com"
      },
      {
        source: "Beanhunter",
        category: "curated-app",
        note: "Enthusiast users still identify it as a specialty destination.",
        weight: 0.8,
        url: "https://www.beanhunter.com"
      }
    ],
    externalLinks: [{ label: "Website", url: "https://ritualcoffee.com" }]
  }
];
