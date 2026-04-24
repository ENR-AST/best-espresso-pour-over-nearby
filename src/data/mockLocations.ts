import type { SearchLocation } from "../types/coffee";

interface MockLocationEntry extends SearchLocation {
  aliases: string[];
}

function cleanText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");
}

export const mockLocationEntries: MockLocationEntry[] = [
  {
    label: "Bethesda, MD",
    latitude: 38.9847,
    longitude: -77.0947,
    source: "manual",
    aliases: [
      "bethesda",
      "bethesda md",
      "20814",
      "20816",
      "zip 20814",
      "zip 20816",
      "woodmont triangle"
    ]
  },
  {
    label: "Jersey City, NJ",
    latitude: 40.7178,
    longitude: -74.0431,
    source: "manual",
    aliases: [
      "jersey city",
      "jersey city nj",
      "07302",
      "07310",
      "zip 07302",
      "zip 07310"
    ]
  },
  {
    label: "Venice, FL",
    latitude: 27.0998,
    longitude: -82.4543,
    source: "manual",
    aliases: [
      "venice",
      "venice fl",
      "34285",
      "34293",
      "zip 34285",
      "zip 34293"
    ]
  },
  {
    label: "SoHo, New York, NY",
    latitude: 40.7233,
    longitude: -74.003,
    source: "manual",
    aliases: [
      "soho",
      "soho nyc",
      "soho new york",
      "new york",
      "nyc",
      "manhattan",
      "10013",
      "zip 10013",
      "new york ny"
    ]
  },
  {
    label: "Williamsburg, Brooklyn, NY",
    latitude: 40.718,
    longitude: -73.9571,
    source: "manual",
    aliases: [
      "brooklyn",
      "williamsburg",
      "williamsburg brooklyn",
      "11211",
      "zip 11211",
      "brooklyn ny"
    ]
  },
  {
    label: "Mission District, San Francisco, CA",
    latitude: 37.7599,
    longitude: -122.4148,
    source: "manual",
    aliases: [
      "mission",
      "mission district",
      "san francisco",
      "sf",
      "94110",
      "zip 94110",
      "san francisco ca"
    ]
  },
  {
    label: "ZIP 94103, San Francisco, CA",
    latitude: 37.7739,
    longitude: -122.4112,
    source: "manual",
    aliases: [
      "94103",
      "zip 94103",
      "soma",
      "so ma",
      "downtown sf",
      "downtown san francisco"
    ]
  }
];

export function findMockLocation(query: string): SearchLocation | null {
  const normalized = cleanText(query);

  if (!normalized) {
    return null;
  }

  const zipMatch = normalized.match(/\b\d{5}\b/);
  if (zipMatch) {
    const byZip = mockLocationEntries.find((entry) =>
      entry.aliases.some((alias) => cleanText(alias) === zipMatch[0])
    );

    if (byZip) {
      return {
        label: byZip.label,
        latitude: byZip.latitude,
        longitude: byZip.longitude,
        source: "manual"
      };
    }
  }

  const exactMatch = mockLocationEntries.find((entry) =>
    entry.aliases.some((alias) => cleanText(alias) === normalized)
  );

  if (exactMatch) {
    return {
      label: exactMatch.label,
      latitude: exactMatch.latitude,
      longitude: exactMatch.longitude,
      source: "manual"
    };
  }

  const queryWords = normalized.split(" ").filter(Boolean);

  const scoredMatches = mockLocationEntries
    .map((entry) => {
      const aliasMatches = entry.aliases.map((alias) => cleanText(alias));
      const score = aliasMatches.reduce((best, alias) => {
        let current = 0;

        if (alias.includes(normalized) || normalized.includes(alias)) {
          current += 4;
        }

        const matchedWords = queryWords.filter((word) => alias.includes(word)).length;
        current += matchedWords;

        return Math.max(best, current);
      }, 0);

      return { entry, score };
    })
    .sort((a, b) => b.score - a.score);

  if (!scoredMatches[0] || scoredMatches[0].score < 2) {
    return null;
  }

  const best = scoredMatches[0].entry;

  return {
    label: best.label,
    latitude: best.latitude,
    longitude: best.longitude,
    source: "manual"
  };
}

export const defaultLocation: SearchLocation = {
  label: "Bethesda, MD",
  latitude: 38.9847,
  longitude: -77.0947,
  source: "default"
};
