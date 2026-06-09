# REMAINING_WORK_PLAN.md

This document outlines the analysis and implementation plan for the 7 high-priority issues identified in the Verba project.

---

## 1. Incorrect Synonym Handling
*   **Analysis:** Synonyms are currently aggregated globally across all meanings, leading to irrelevant results for the specific sense being viewed. There is also a lack of normalization during parsing (case sensitivity, whitespace, duplicates).
*   **Affected Files:**
    *   `src/utils/apiParser.ts` (Normalization & provenance)
    *   `src/utils/pronunciationHelpers.ts` (Aggregation logic)
    *   `src/screens/WordDetailsScreen.tsx` (Display & Navigation)
    *   `src/screens/AudioExperienceScreen.tsx` (Display & Navigation)
*   **Complexity:** Medium
*   **Dependencies:** None
*   **Recommendation:** Implement normalization in `apiParser` first, then update screens to use meaning-specific synonyms.

## 2. Discover Screen Clutter
*   **Analysis:** The screen likely lacks proper visual hierarchy, has excessive density of elements, or redundant information from the audit's perspective of "clutter".
*   **Affected Files:**
    *   `src/screens/DiscoverScreen.tsx`
    *   `src/components/WordCard.tsx` (if used here)
*   **Complexity:** Medium (UI/UX refinement)
*   **Dependencies:** Design Mapping guidelines
*   **Recommendation:** Refactor layout to introduce more white space and focus on "Word of the Day" or primary discovery targets.

## 3. Oversized Card Borders and Excessive Padding
*   **Analysis:** UI components (GlassCard, WordCard, etc.) do not match the "polish" level in Design Mapping, using default or overly large values for borders/padding.
*   **Affected Files:**
    *   `src/components/GlassCard.tsx`
    *   `src/components/WordCard.tsx`
    *   `src/components/SavedWordCard.tsx`
    *   `src/screens/WordDetailsScreen.tsx`
*   **Complexity:** Low
*   **Dependencies:** `ThemeContext.tsx`, `Design.md`
*   **Recommendation:** Global audit of padding/border constants. Update `GlassCard` as the base component.

## 4. Saved Words Layout Issues
*   **Analysis:** Inconsistencies in list rendering, potential clipping on smaller screens, and poor handling of long word/definition lengths as noted in `SAVEDWORDS_LAYOUT_AUDIT.md`.
*   **Affected Files:**
    *   `src/screens/SavedWordsScreen.tsx`
    *   `src/components/SavedWordCard.tsx`
*   **Complexity:** Medium
*   **Dependencies:** None
*   **Recommendation:** Fix responsiveness issues (flex wrapping, truncation) and ensure the Quiz modal is usable.

## 5. Audio Loading Performance
*   **Analysis:** Latency in audio playback, likely due to eager loading or lack of proper buffering/caching in the `AudioContext`.
*   **Affected Files:**
    *   `src/context/AudioContext.tsx`
    *   `src/components/audio/AudioPlayer.tsx` (if exists)
*   **Complexity:** High
*   **Dependencies:** `expo-av`
*   **Recommendation:** Implement a pre-fetching or caching strategy for word pronunciations.

## 6. Guest Mode ("Continue without account")
*   **Analysis:** The "Guest Mode" is either missing or partially implemented, preventing users from accessing core features without signing in.
*   **Affected Files:**
    *   `src/context/AuthContext.tsx`
    *   `src/screens/auth/LoginScreen.tsx` (or equivalent)
    *   `src/navigation/` (Guard logic)
*   **Complexity:** Medium
*   **Dependencies:** `AuthContext`
*   **Recommendation:** Implement a dummy/guest state in `AuthContext` and update navigation guards to allow limited access.

## 7. Collection Assignment when Saving Words
*   **Analysis:** Currently, saving a word might just be a binary state (saved/unsaved) without the ability to categorize it into collections as required by the product vision.
*   **Affected Files:**
    *   `src/context/SavedContext.tsx`
    *   `src/screens/WordDetailsScreen.tsx` (Save action)
    *   `src/components/CollectionPicker.tsx` (to be created/updated)
*   **Complexity:** Medium/High
*   **Dependencies:** `SavedContext`
*   **Recommendation:** Update `SavedContext` to support collections and add a UI picker when the "Save" button is pressed/held.

---

## Recommended Implementation Order

1.  **Oversized Card Borders and Excessive Padding (3):** Quick wins that improve overall look immediately.
2.  **Incorrect Synonym Handling (1):** High impact on core functional quality.
3.  **Saved Words Layout Issues (4):** Critical for the primary utility of the app.
4.  **Collection Assignment when Saving Words (7):** Adds significant product value; fits well after fixing Saved Words.
5.  **Guest Mode (6):** Improves onboarding and accessibility.
6.  **Discover Screen Clutter (2):** UI refinement once functional issues are addressed.
7.  **Audio Loading Performance (5):** Complex performance optimization to be done after UI/Logic is stable.
