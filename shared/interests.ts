export const INTERESTS = [
  { key: "technology", label: "Technology" },
  { key: "design", label: "Design" },
  { key: "creative", label: "Creative work" },
  { key: "business", label: "Business" },
  { key: "entrepreneurship", label: "Entrepreneurship" },
  { key: "community", label: "Community" },
  { key: "education", label: "Education" },
  { key: "music", label: "Music" },
  { key: "film", label: "Film & media" },
  { key: "wellbeing", label: "Wellbeing" },
  { key: "social-impact", label: "Social impact" },
  { key: "local", label: "Local discovery" },
] as const;

export type InterestKey = (typeof INTERESTS)[number]["key"];
export const INTEREST_KEYS = INTERESTS.map((interest) => interest.key) as [InterestKey, ...InterestKey[]];
export function getInterestLabel(key: string) { return INTERESTS.find((interest) => interest.key === key)?.label || key; }
