export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscription: SubscriptionTier;
  isBlocked: boolean;
  createdAt: string;
}