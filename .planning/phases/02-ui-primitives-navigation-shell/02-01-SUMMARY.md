# Plan 02-01: NativeWindUI Component Library (15+ Primitives)

## Goal
Build 15+ reusable UI components that replicate the web app's shadcn/ui component library using NativeWind v4 + React Native primitives. Every component must use the existing design system tokens (HSL CSS variables) and support dark mode.

## Requirements
- ONBD-01, ONBD-02, ONBD-03 (onboarding uses Button, Card, Badge, Progress)
- DASH-09 (dashboard cards, progress bars, avatars)
- OFFL-02 (offline banner uses Alert, Badge)

## Components to Build (porting from shadcn/ui → React Native)

### Tier 1 — Core Primitives (used everywhere)
1. **Button** — variant (default/destructive/outline/secondary/ghost/link), size (default/sm/lg/icon), Pressable-based, scale-press animation
2. **Input** — text input with border, focus ring, placeholder, disabled state
3. **Textarea** — multiline TextInput matching Input styling
4. **Card** — Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter (View-based)
5. **Badge** — variant (default/secondary/destructive/outline)
6. **Label** — accessible label for form controls

### Tier 2 — Feedback & Overlay
7. **Alert** — Alert/AlertTitle/AlertDescription with variant (default/destructive)
8. **Toast** — Sonner-style toast via react-native-toast-message, themed to match design tokens
9. **Progress** — animated progress bar using Reanimated
10. **Skeleton** — animated pulse placeholder (Animated.View)
11. **Sheet** — bottom sheet using @gorhom/bottom-sheet with backdrop, snap points

### Tier 3 — Form & Selection
12. **Checkbox** — custom Pressable with Check icon, controlled checked state
13. **RadioGroup** — RadioGroup/RadioGroupItem with Circle indicator
14. **Switch** — RN Switch themed with primary color
15. **Select** — Modal-based picker (ActionSheetIOS on iOS, Modal on Android)

### Tier 4 — Display
16. **Avatar** — Avatar/AvatarImage/AvatarFallback with Image + initials fallback
17. **Separator** — horizontal/vertical divider

## Implementation Approach
- All components use `className` via NativeWind v4 (no StyleSheet.create)
- CVA-like variant system via a lightweight `cva()` utility (class-variance-authority pattern ported to RN)
- Each component in `components/ui/` matching the web app structure
- Barrel export in `components/ui/index.ts`
- Use `@studentos/shared` cn() utility for className merging
- Icons from `lucide-react-native` (already installed)
- Sheet uses `@gorhom/bottom-sheet` (needs install)
- Toast uses `react-native-toast-message` (needs install)

## Files to Create
- `apps/native/components/ui/button.tsx`
- `apps/native/components/ui/input.tsx`
- `apps/native/components/ui/textarea.tsx`
- `apps/native/components/ui/card.tsx`
- `apps/native/components/ui/badge.tsx`
- `apps/native/components/ui/label.tsx`
- `apps/native/components/ui/alert.tsx`
- `apps/native/components/ui/toast.tsx`
- `apps/native/components/ui/progress.tsx`
- `apps/native/components/ui/skeleton.tsx`
- `apps/native/components/ui/sheet.tsx`
- `apps/native/components/ui/checkbox.tsx`
- `apps/native/components/ui/radio-group.tsx`
- `apps/native/components/ui/switch.tsx`
- `apps/native/components/ui/select.tsx`
- `apps/native/components/ui/avatar.tsx`
- `apps/native/components/ui/separator.tsx`
- `apps/native/components/ui/index.ts`
- `apps/native/lib/cva.ts` (CVA utility for RN)

## Dependencies to Install
- `@gorhom/bottom-sheet` + `@gorhom/bottom-sheet-reanimated`
- `react-native-toast-message`
- `react-native-reanimated` (already installed)
- `react-native-svg` (already installed)

## Verification
- Each component renders with default, variant, and dark mode styles
- Button press animation (scale) works
- Sheet opens/closes with snap points
- Toast shows/hides with theme colors
- All components pass TypeScript strict mode
