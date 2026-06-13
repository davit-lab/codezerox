# Code Review Findings - CodeZerox

## CRITICAL BUGS (Fix Immediately)

### 1. XP Awarded Multiple Times on Login
**Status**: Fixed with migration `20250405_fix_xp_login_issue.sql`
**Issue**: User reported XP being added every time they log in
**Root Cause**: `useJoinChallenge` hook calls `award_xp` RPC after inserting participant, but no duplicate check
**Fix Applied**: 
- Added UNIQUE constraint on `hub_challenge_participants(challenge_id, user_id)`
- Created `award_xp_safe` function that checks for existing transactions
- Created `check_xp_already_awarded` helper function

**Files**: 
- `/src/hooks/useHubChallenges.ts` lines 87-126
- `/supabase/migrations/20250405_fix_xp_login_issue.sql`

---

### 2. Missing Duplicate Check Before Awarding XP
**Status**: Needs Fix
**Issue**: `useJoinChallenge` mutation doesn't check if user already has XP for this challenge
**Code**: Line 109-114 in useHubChallenges.ts
```typescript
await supabase.rpc('award_xp', {
  _user_id: userId,
  _amount: (challenge as any).points,
  _action: 'challenge_join',
  _ref: challengeId,
});
```
**Risk**: If duplicate join somehow happens, XP is awarded twice
**Fix**: Frontend should check `user_has_joined` before calling mutate, or use `award_xp_safe`

---

### 3. Console.log in Production Code
**Status**: Needs Fix
**Files**:
- `/src/hooks/useHubProjects.ts` line 128, 137, 141, 149 (console.log, console.error)
- `/src/hooks/useAuth.tsx` line 159-168 (console.log in updateProfile)
- `/src/pages/PaymentSuccess.tsx` likely has debug logs

**Fix**: Remove all console statements or use proper logging service

---

## MEDIUM PRIORITY ISSUES

### 4. Type Safety Issues - "as any" Casting
**Status**: Needs Refactoring
**Files with excessive "as any" usage**:
- `/src/hooks/useHubChallenges.ts` - lines 48, 95, 96, 103, 109, 157, 224
- `/src/hooks/useHubProjects.ts` - lines 40, 52, 130, 136, 179, 186, 202
- `/src/hooks/useChallengeSubmissions.ts` - lines 30, 68, 97, 202
- `/src/hooks/usePurchases.ts` - minimal usage

**Risk**: Runtime errors that TypeScript can't catch
**Fix**: Define proper Supabase types and use them

---

### 5. Missing Error Handling
**Status**: Needs Fix
**Files**:
- `/src/hooks/useHubChallenges.ts` line 117-124 - onError just shows toast without logging
- `/src/hooks/useHubProjects.ts` line 166 - onError missing for useDeleteHubProject
- `/src/pages/Admin.tsx` - CustomTooltip doesn't handle edge cases

---

### 6. Race Condition in useToggleProjectLike
**Status**: Needs Fix
**File**: `/src/hooks/useHubProjects.ts` lines 170-192
**Issue**: No optimistic update, UI can show wrong state during network delay
**Fix**: Use React Query optimistic updates

---

### 7. Memory Leak in Header.tsx
**Status**: Needs Fix
**File**: `/src/components/layout/Header.tsx` lines 18-41
**Issue**: Multiple useEffect hooks without proper cleanup
**Fix**: Ensure all event listeners are removed

---

## MINOR ISSUES

### 8. Hardcoded Magic Numbers
**Status**: Low Priority
**Files**:
- `/src/hooks/useUserXP.ts` line 37-40 (XP tiers hardcoded)
- `/src/hooks/useCredits.ts` line 42 (5000ms refetch interval)
- `/src/pages/PaymentSuccess.tsx` line 54 (maxAttempts = 20)

**Fix**: Move to config/constants files

---

### 9. Missing Loading States
**Status**: Low Priority
**Files**:
- `/src/hooks/useHubProjects.ts` - useToggleProjectLike no loading state
- `/src/hooks/useHubChallenges.ts` - useLeaveChallenge no loading state

---

### 10. Inconsistent Error Messages
**Status**: Low Priority
**Issue**: Mix of Georgian and English error messages
**Fix**: Standardize all user-facing messages to Georgian

---

## SECURITY CONSIDERATIONS

### 11. RLS Policy Review Needed
**Status**: Check Required
**Files**: `/supabase/migrations/20250405_fix_rls_policies.sql`
**Action**: Verify all tables have proper RLS policies

### 12. Input Sanitization
**Status**: Check Required
**Files**: 
- `/src/pages/Checkout.tsx` - card input validation
- `/src/components/hub/HubSnippets.tsx` - code submission
**Action**: Ensure all user inputs are sanitized before database operations

---

## PERFORMANCE ISSUES

### 13. N+1 Query in useHubProjects
**Status**: Partially Fixed
**File**: `/src/hooks/useHubProjects.ts` lines 39-57
**Issue**: Multiple parallel queries but still fetching all data at once
**Fix**: Consider pagination or cursor-based fetching

### 14. Excessive Re-rendering
**Status**: Check Required
**File**: `/src/hooks/useUserXP.ts` line 42
**Issue**: Credits refetch every 5 seconds (refetchInterval: 5000)
**Fix**: Use WebSocket or longer interval with manual refresh

---

## RECOMMENDATIONS

1. **Add Error Boundary** - Wrap routes with error boundaries
2. **Add Sentry/Rollbar** - For production error tracking
3. **Add React Query Devtools** - For debugging cache issues
4. **Add Unit Tests** - Critical paths need test coverage
5. **TypeScript Strict Mode** - Enable for better type safety

---

## FILES TO PRIORITIZE FOR FIXING

1. `/src/hooks/useHubChallenges.ts` - XP duplication bug
2. `/src/hooks/useHubProjects.ts` - Remove console.logs, add error handling
3. `/src/hooks/useAuth.tsx` - Remove console.logs
4. `/src/components/layout/Header.tsx` - Fix memory leaks
5. All files with `as any` - Add proper types

---

Generated: April 5, 2026
Reviewer: Cascade
