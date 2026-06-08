# UI Layout Audit — Pre-Phase 3

**Date:** June 2026  
**Trigger:** Visual verification after GlassCard migration

---

## Root Cause Summary

| Issue | Root cause |
|-------|------------|
| Audio/pronunciation icon clipped | `GlassCard` `overflow: 'hidden'` + pulse ring scales to 118% outside 44px bounds |
| Card decorative glow clipped | `WordCard` gradient at `top: -50` inside clipped GlassCard |
| Compressed word title | `adjustsFontSizeToFit` + tight header row without `minWidth: 0` on text flex child |
| Onboarding bolt badge cut off | Absolute `bottom: -20` inside fixed `height: 300` canvas with overflow hidden |
| Suggestions overlap/misplace | Hardcoded `top: 120` on absolute suggestions panel |
| Word Details header overlap | Fixed `height: 56` + manual Android `marginTop: 24` instead of safe area insets |
| Small touch targets | Search/mic icons ~28px; save button ~36px tall |
| Bento whitespace on small screens | Fixed row layout without `flexShrink` / `minWidth: 0` on text columns |

---

## GlassCard Usages

| Screen / Component | Issue | Fix |
|--------------------|-------|-----|
| `WordCard` | Clips glow + audio pulse | Layer blur under content; decorations outside clip path; audio slot 56×56 |
| `OnboardingSearchSlide` | Fixed height clips bolt badge | `minHeight` + flow layout for badge |
| `OnboardingAudioSlide` | Wave bars scaleY clipped | Vertical padding on wave container |
| `OnboardingOfflineSlide` | OK | Minor padding adjustment |
| `OnboardingFinalSlide` | OK | `width: 100%` on card |
| `ErrorView` | Status cells OK | Ensure `flex: 1` + `minWidth: 0` |

---

## Icon Placements

| Icon | Location | Issue | Fix |
|------|----------|-------|-----|
| Pronunciation | `PronunciationButton` | 44px + pulse clipped | 48px button, 56px slot, container 64px |
| Search | `SearchBar` | 28px touch area | `minWidth/minHeight: 44` |
| Mic / Clear | `SearchBar` | 28px touch area | 44×44 hit area |
| Bookmark | `WordCard` | OK size, tight row | `minHeight: 44` on save button |
| Tab icons | `VerbaTabBar` | OK | `minHeight: 56` on tab item |

---

## Affected Screens

1. **Discover** — WOTD WordCard, suggestions panel, bento grid  
2. **Word Details** — WordCard, custom header, accent chips  
3. **Onboarding** — all four slides  
4. **Error states** — minor flex fixes  
5. **Global** — `GlassCard`, `PronunciationButton`, `SearchBar`

---

## Files Modified

- `src/components/GlassCard.tsx`
- `src/components/WordCard.tsx`
- `src/components/PronunciationButton.tsx`
- `src/components/SearchBar.tsx`
- `src/components/VerbaTabBar.tsx`
- `src/components/onboarding/OnboardingSearchSlide.tsx`
- `src/components/onboarding/OnboardingAudioSlide.tsx`
- `src/screens/DiscoverScreen.tsx`
- `src/screens/WordDetailsScreen.tsx`
