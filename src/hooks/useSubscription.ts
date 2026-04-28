import { useAuthStore } from "../stores/authStore";
import type { SubscriptionTier } from "../types";

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

export function useSubscription() {
  const subscription = useAuthStore((s) => s.subscription);

  function canAccess(requiredTier: SubscriptionTier): boolean {
    return TIER_HIERARCHY[subscription] >= TIER_HIERARCHY[requiredTier];
  }

  function requireTier(requiredTier: SubscriptionTier): {
    allowed: boolean;
    currentTier: SubscriptionTier;
    requiredTier: SubscriptionTier;
  } {
    return {
      allowed: canAccess(requiredTier),
      currentTier: subscription,
      requiredTier,
    };
  }

  return {
    subscription,
    canAccess,
    requireTier,
    isFree: subscription === "free",
    isPlus: subscription === "plus",
    isPro: subscription === "pro",
  };
}
