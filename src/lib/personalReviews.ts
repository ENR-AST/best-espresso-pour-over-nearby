import type { PersonalReview } from "../types/coffee";

const STORAGE_KEY = "wali-espresso-personal-reviews";

export type PersonalReviewMap = Record<string, PersonalReview>;

export function loadPersonalReviews(): PersonalReviewMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersonalReviewMap;

    return Object.fromEntries(
      Object.entries(parsed ?? {}).map(([shopId, review]) => {
        const fallbackOverallScore = (
          review.espressoScore +
          review.pourOverScore +
          review.beanTransparencyScore +
          review.menuFocusScore +
          review.serviceScore +
          review.ambianceScore
        ) / 6;

        return [
          shopId,
          {
            ...review,
            overallScore: review.overallScore ?? Number(fallbackOverallScore.toFixed(1))
          }
        ];
      })
    );
  } catch {
    return {};
  }
}

export function savePersonalReviews(reviews: PersonalReviewMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getPersonalReviewScore(review: PersonalReview): number {
  const numericAverage = (
    review.espressoScore +
    review.pourOverScore +
    review.beanTransparencyScore +
    review.menuFocusScore +
    review.serviceScore +
    review.ambianceScore
  ) / 6;

  const blendedScore = review.overallScore * 0.7 + numericAverage * 0.3;
  const returnBonus = review.wouldReturn ? 0.4 : -0.8;
  return Math.max(0, Math.min(10, blendedScore + returnBonus));
}
