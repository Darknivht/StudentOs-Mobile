export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    aiCalls: 5,
    noteQuota: 3,
    flashcardQuota: 3,
    quizQuota: 3,
  },
  plus: {
    name: "Plus",
    aiCalls: 30,
    noteQuota: 10,
    flashcardQuota: 20,
    quizQuota: 10,
  },
  pro: {
    name: "Pro",
    aiCalls: 100,
    noteQuota: Infinity,
    flashcardQuota: Infinity,
    quizQuota: Infinity,
  },
} as const;

export const NAVIGATION_TABS = [
  { name: "Home", key: "home" },
  { name: "Study", key: "study" },
  { name: "Notes", key: "notes" },
  { name: "Focus", key: "focus" },
  { name: "Profile", key: "profile" },
] as const;

export const AI_PERSONAS = [
  { id: "chill", name: "Chill", description: "Relaxed, encouraging" },
  { id: "strict", name: "Strict", description: "Precise, no-nonsense" },
  { id: "fun", name: "Fun", description: "Playful, witty" },
  { id: "motivator", name: "Motivator", description: "Energetic cheerleader" },
] as const;
