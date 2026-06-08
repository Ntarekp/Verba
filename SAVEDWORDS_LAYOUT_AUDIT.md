# Saved Words Screen — Layout & Responsiveness Audit

**Date:** June 8, 2026  
**Scope:** `SavedWordsScreen.tsx` and components **directly rendered** by it:

| Component | Render path |
|-----------|-------------|
| `SavedWordsScreen` | Root screen (includes Quiz `Modal` UI) |
| `SavedWordCard` | `FlatList` `renderItem` |
| `GlassCard` | Stats bento in `renderListHeader` |
| `SearchBar` | `renderListHeader` → `searchSection` |
| `EmptyState` | `FlatList` `ListEmptyComponent` |
| `LoadingSpinner` | Loading branch |
| `PronunciationButton` | Inside each `SavedWordCard` |
| `GlassCard` (nested) | Inside each `SavedWordCard` |

**Design reference:** `stitch_verba_intelligence_platform/saved_words_collections/code.html`  
**Out of scope:** Colors, typography tokens, business logic, navigation, unrelated files.

---

## 1. Executive Summary

| Severity | Count | Primary triggers |
|----------|-------|------------------|
| **High** | 3 | Quiz modal without scroll; stats row flex constraints; scaled subtitle line-height |
| **Medium** | 5 | Large-font stat row cramping; quiz content in landscape; long quiz words; inconsistent stat value scaling; nested scroll coupling |
| **Low** | 4 | EmptyState double padding; pronunciation pulse bleed; fixed stat divider height; intentional tab horizontal scroll |

**Page-level horizontal scroll:** Not observed in code paths for the main vertical `FlatList` — only the **collection tab strip** scrolls horizontally (matches design `overflow-x-auto` at HTML line 258).

**Overall:** Portrait phone layouts are mostly sound thanks to `minWidth: 0` on `SavedWordCard` title/definition columns. The highest-risk areas are the **Quiz modal** (no `ScrollView`) and the **stats bento row** under narrow width + Large font scale.

---

## 2. Issue Register (Prioritized)

### Priority 1 — High

---

#### SW-L01 — Quiz modal body clips content (no vertical scroll)

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → Quiz `Modal` → `quizBody` |
| **Symptoms** | Content clipped top/bottom; unreachable options or Next button |
| **Triggers** | Landscape orientation; small-height devices (iPhone SE); Large font scale; long definition options (4× multi-line) |
| **Root cause** | `quizBody` uses `flex: 1` + `justifyContent: 'center'` with **no `ScrollView`**. All quiz content is in a fixed vertical stack. Landscape reduces viewport height dramatically while option cards grow with wrapped text. |
| **Design reference** | No dedicated quiz modal in `saved_words_collections/code.html` (quiz button only at lines 226–229). N/A for screenshot parity. |
| **Recommended fix** | Wrap `quizBody` contents in `ScrollView` with `contentContainerStyle={{ flexGrow: 1, paddingVertical: … }}`. Replace `justifyContent: 'center'` with top-aligned scroll content; add `keyboardShouldPersistTaps="handled"`. Keep existing safe-area padding on `quizContainer`. |

---

#### SW-L02 — Stats bento text column can overflow narrow stat blocks

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → `renderListHeader` → `statsRow` → `statBlock` (both streak & mastered) |
| **Symptoms** | Label/value text overlaps icon or adjacent column; horizontal crowding; text truncated without ellipsis |
| **Triggers** | Small devices (≤320pt width); Large font scale on `statLabel` (uses `fontSizeMultiplier`); long label strings ("Words Mastered") |
| **Root cause** | `statBlock` has `flex: 1` and `minWidth: 0`, but the **inner text wrapper `<View>`** (sibling to `statIcon`) has **no `flex: 1`, `minWidth: 0`, or `flexShrink: 1`**. React Native Views default `flexShrink: 0`, so the text column resists compression in the side-by-side row sharing space with a 56px icon, 1px divider, and second column. |
| **Design reference** | `saved_words_collections/code.html` lines 199–224 — desktop uses `md:flex-row` with generous gap; mobile stacks stats vertically in responsive layout. Implementation keeps both stats **always side-by-side**, tighter than design on narrow screens. |
| **Recommended fix** | Add `flex: 1`, `minWidth: 0` to the text wrapper `View` inside each `statBlock`. Optionally allow `statLabel` to wrap (`flexWrap` not needed if Text wraps). Consider `flexWrap: 'wrap'` on `statsRow` below a width breakpoint using `useWindowDimensions` — **layout-only** row wrap, not visual redesign. |

---

#### SW-L03 — Subtitle text vertical clipping at Large font scale

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → `renderListHeader` → subtitle `Text` |
| **Symptoms** | Descenders clipped; lines visually cropped |
| **Triggers** | Settings → Font Scale → **Large** (`fontSizeMultiplier` 1.25) |
| **Root cause** | `fontSize` scales with `fontSizeMultiplier` (~15.3px) but `styles.subtitle.lineHeight` is **fixed at 24**. At 1.25× scale, line-height ratio falls below readable minimum (~1.55×). |
| **Design reference** | `saved_words_collections/code.html` line 186 — subtitle uses `definition-body` with proportional 18px/28px line-height. |
| **Recommended fix** | Set `lineHeight` dynamically: `typography.definitionBody.lineHeight * 0.85 * fontSizeMultiplier` (or remove fixed `lineHeight` from StyleSheet and compute inline). No font token changes required. |

---

### Priority 2 — Medium

---

#### SW-L04 — Stats value/unit do not scale with font preference (row height mismatch)

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → `statValue`, `statUnit` |
| **Symptoms** | Uneven vertical rhythm in stat blocks; label wraps while value stays small; divider shorter than content |
| **Triggers** | Large font scale on labels only |
| **Root cause** | `statLabel` uses `fontSizeMultiplier`; `statValue` is **hardcoded `fontSize: 28`** and `statUnit` **`fontSize: 13`** in StyleSheet. `statDivider` has **fixed `height: 48`**. |
| **Design reference** | Lines 206–221 — display values scale with design tokens proportionally. |
| **Recommended fix** | Apply `fontSizeMultiplier` to value/unit sizes inline (layout sizing only, same type family). Set `statDivider` to `alignSelf: 'stretch'` with `height: undefined` or `minHeight: 48` so it grows with taller stat blocks. |

---

#### SW-L05 — Quiz question word can overflow horizontally

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → Quiz `Modal` → `questionWord` |
| **Symptoms** | Long saved words extend past screen edge; horizontal clip |
| **Triggers** | Long compound words; Large font scale (`32 * fontSizeMultiplier` → 40px); landscape with split keyboard (reduced width) |
| **Root cause** | No `flexShrink`, `numberOfLines`, or horizontal padding constraint on quoted word. `textAlign: 'center'` alone does not force wrapping for unbroken strings. |
| **Design reference** | N/A (quiz UI not in stitch screen). |
| **Recommended fix** | Add `paddingHorizontal: spacing.gutter` on `questionWord` or parent; add `flexWrap` via allowing Text to wrap (default) with `maxWidth: '100%'` on container; optional `adjustsFontSizeToFit` + `numberOfLines={2}` for extreme lengths. |

---

#### SW-L06 — Quiz option definitions expand without scroll boundary

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → Quiz `Modal` → `optionCard` / `optionText` |
| **Symptoms** | Lower options and Next button pushed off-screen |
| **Triggers** | API-length definition strings in quiz options; multiple saved words with long summaries |
| **Root cause** | `optionText` wraps (good) but parent `optionsContainer` has no max height; combined with SW-L01 non-scroll body, total content height can exceed viewport. `optionText` uses fixed `fontSize: 16` — does not grow with accessibility setting (reduces but does not eliminate issue). |
| **Design reference** | N/A |
| **Recommended fix** | Primary: SW-L01 `ScrollView`. Secondary: add `flexShrink: 1` on `optionsContainer`; ensure `optionText` has `flexShrink: 1` inside `optionCard`. |

---

#### SW-L07 — Collection tabs: nested horizontal scroll inside vertical list header

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordsScreen` → `tabsContainer` → horizontal `FlatList` |
| **Symptoms** | Horizontal scrolling **within tab strip only** (intentional); occasional scroll gesture conflict with parent vertical list |
| **Triggers** | All widths; more noticeable when swiping diagonally on tab row |
| **Root cause** | Horizontal `FlatList` embedded in `ListHeaderComponent` of vertical `FlatList`. Four tabs with `paddingHorizontal: 16` pills exceed narrow screen width — requires horizontal scroll (by design). |
| **Design reference** | `saved_words_collections/code.html` lines 257–276 — `overflow-x-auto` tab strip with `whitespace-nowrap`. **Matches design intent.** |
| **Recommended fix** | **Not a page-level horizontal scroll bug.** Optional: replace inner `FlatList` with `ScrollView horizontal` + `flexDirection: 'row'` for simpler nesting; add `nestedScrollEnabled` on Android. Reduce pill `paddingHorizontal` slightly on narrow screens via `useWindowDimensions` if tabs feel cramped. |

---

#### SW-L08 — Saved word card header compression on very narrow + Large font

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordCard` → `header` → `titleCol` + `actions` |
| **Symptoms** | Word title squeezes to 1–2 narrow columns; phonetic pushed below badge aggressively |
| **Triggers** | ≤320pt width + Large font scale on `wordName` |
| **Root cause** | `actions` is `flexShrink: 0` (~98px: pronunciation slot 54px + remove 44px). `titleCol` has `minWidth: 0` (good) but `wordName` scales to `sectionHeading * 0.65 * 1.25` ≈ **22.75px** with heavy weight — competes for ~150px usable width after card padding. |
| **Design reference** | Lines 281–297 — card header uses `justify-between` with similar action cluster; design shows shorter sample words. |
| **Recommended fix** | Ensure `wordName` keeps `numberOfLines={2}` (already set). Add `flex: 1` explicitly on `titleCol` (redundant but safe). Consider stacking `actions` below title on narrow widths via `flexWrap: 'wrap'` on `header` — layout-only responsive wrap. |

---

### Priority 3 — Low

---

#### SW-L09 — EmptyState double horizontal padding narrows message column

| Field | Detail |
|-------|--------|
| **Component** | `EmptyState` (as `ListEmptyComponent`) |
| **Symptoms** | Description wraps excessively; excessive whitespace margins |
| **Triggers** | Small devices; long `searchQuery` in description string |
| **Root cause** | Parent `listContent` already applies `paddingHorizontal: spacing.gutter` (16). `EmptyState` adds **`paddingHorizontal: spacing.containerPadding` (24)**. Effective horizontal inset ≈ 40px per side. `desc` also has `maxWidth: 260` which further constrains on top of insets. |
| **Design reference** | Empty state not shown in stitch saved words screen. |
| **Recommended fix** | Pass a prop or use zero horizontal padding on `EmptyState` when used inside padded lists; or remove `paddingHorizontal` from `EmptyState.container` and let parent control insets. Widen `maxWidth` to `'100%'` with parent padding only. |

---

#### SW-L10 — Pronunciation pulse ring may bleed outside card bounds

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordCard` → `PronunciationButton` inside `GlassCard` |
| **Symptoms** | Pulse animation visually overlaps adjacent list items or card border |
| **Triggers** | Active audio state; pulse scale 1.15× on 40px button in 54px slot |
| **Root cause** | `GlassCard` uses `overflow: 'visible'` (intentional, per `GlassCard.tsx` comment). Pulse ring is `position: 'absolute'` within slot; slot fits button but glow extends to card edge. |
| **Design reference** | Lines 290–292 — `animate-pulse` on 40px audio button inside card. |
| **Recommended fix** | Low priority if no clip reported. Add small `marginRight` on `actions` or increase `header` `gap` to absorb pulse. Optional `overflow: 'hidden'` on card header row only (not entire card). |

---

#### SW-L11 — Saved card footer row lacks flex shrink on date label

| Field | Detail |
|-------|--------|
| **Component** | `SavedWordCard` → `footer` → `dateText` |
| **Symptoms** | Rare horizontal pressure between date and mastery dots |
| **Triggers** | Large font on `dateText` (currently fixed 12px — low risk unless later scaled) |
| **Root cause** | `dateText` has no `flex: 1` / `flexShrink: 1` / `numberOfLines={1}`; `masteryDots` is `flexShrink: 0`. |
| **Design reference** | Lines 305–311 — footer `justify-between` with short date string. |
| **Recommended fix** | Add `flex: 1`, `minWidth: 0`, `numberOfLines={1}` to `dateText`. |

---

#### SW-L12 — Loading state message has no width constraint

| Field | Detail |
|-------|--------|
| **Component** | `LoadingSpinner` (loading branch) |
| **Symptoms** | Theoretical wrap issue with very long `message` prop |
| **Triggers** | Current message `"Loading your collection..."` is short — **not reproducible today** |
| **Root cause** | `messageText` in `LoadingSpinner` has no `maxWidth` or horizontal padding |
| **Design reference** | N/A |
| **Recommended fix** | Add `paddingHorizontal: spacing.containerPadding` and `textAlign: 'center'` on message if future messages lengthen. **Defer** unless message copy changes. |

---

## 3. Component-Level Pass/Fail Matrix

| Component / Region | Small device (320pt) | Large font (1.25×) | Landscape | Horizontal page scroll |
|--------------------|----------------------|--------------------|-----------|-------------------------|
| Subtitle | ⚠️ L03 | ⚠️ L03 | ✅ | ✅ |
| Stats bento (`GlassCard`) | ⚠️ L02, L04 | ⚠️ L02, L04 | ✅ | ✅ |
| Quiz button | ✅ | ✅ | ✅ | ✅ |
| `SearchBar` | ✅ | ✅ | ✅ | ✅ |
| Collection tabs | ✅ (H-scroll intended) | ✅ | ✅ | ✅ (strip only) |
| `SavedWordCard` list | ⚠️ L08 | ⚠️ L08 | ✅ | ✅ |
| `EmptyState` | ⚠️ L09 | ⚠️ L09 | ✅ | ✅ |
| Quiz `Modal` | ⚠️ L01, L05, L06 | ⚠️ L01, L05 | ❌ L01, L06 | ⚠️ L05 |
| `LoadingSpinner` | ✅ | ✅ | ✅ | ✅ |

---

## 4. Recommended Fix Order (Layout-only)

| Order | Issue ID | Effort | Files to touch (when approved) |
|-------|----------|--------|--------------------------------|
| 1 | SW-L01 | Medium | `SavedWordsScreen.tsx` |
| 2 | SW-L02 | Low | `SavedWordsScreen.tsx` |
| 3 | SW-L03 | Low | `SavedWordsScreen.tsx` |
| 4 | SW-L04 | Low | `SavedWordsScreen.tsx` |
| 5 | SW-L05, SW-L06 | Low | `SavedWordsScreen.tsx` (same ScrollView change) |
| 6 | SW-L08 | Low | `SavedWordCard.tsx` |
| 7 | SW-L09 | Low | `EmptyState.tsx` or `SavedWordsScreen.tsx` (padding override) |
| 8 | SW-L11 | Trivial | `SavedWordCard.tsx` |
| 9 | SW-L07, L10, L12 | Optional | As needed |

**Estimated total:** 1–2 hours for items 1–6; addresses all High and most Medium issues.

---

## 5. What Is NOT Broken (Verified OK)

| Element | Why it passes |
|---------|---------------|
| Main `FlatList` vertical scroll | `flex: 1` container; bottom safe-area padding via `insets.bottom` |
| `SearchBar` | `flex: 1` + `minWidth: 0` on input; fixed 44px icon hits |
| `SavedWordCard` definition row | `flex: 1`, `minWidth: 0` on definition `Text`; wraps correctly |
| `SavedWordCard` example | `numberOfLines={3}` prevents unbounded height |
| `SavedWordCard` meta row | `flexWrap: 'wrap'` on `metaRow` |
| Quiz modal safe areas | `paddingTop: insets.top`, `paddingBottom: insets.bottom` |
| `GlassCard` width | `width: '100%'` on saved cards; no explicit overflow hidden on content |

---

## 6. Design vs Implementation — Layout Notes

| Design region (HTML) | Implementation | Layout delta |
|---------------------|----------------|--------------|
| Stats card (L197–231) | Side-by-side stats always | Design stacks on mobile via responsive classes; RN version never stacks → more pressure on SW-L02 |
| Tab strip (L257–276) | Horizontal `FlatList` | Aligned — intentional horizontal scroll |
| Word grid (L278+) | Single-column `FlatList` | Design uses 2–3 columns on `md+`; mobile single column matches `grid-cols-1` |
| Search (L234–244) | Full-width `SearchBar` | Aligned |

---

## 7. Testing Checklist (Post-fix verification)

- [ ] iPhone SE (320×568) portrait — stats row, cards, tabs
- [ ] iPhone 14 Pro Max portrait — no regressions
- [ ] Landscape — quiz modal fully scrollable; all options reachable
- [ ] Settings → Font Scale → Large — subtitle, stats, card titles readable without clip
- [ ] Save word with 30+ character name — card header and quiz question OK
- [ ] Save words with long definitions — quiz options scrollable
- [ ] Empty state with 40+ character search query — description wraps, no horizontal scroll
- [ ] Confirm main screen does not scroll horizontally (tab strip may)

---

*Audit complete. No code was modified. Awaiting approval before implementing fixes.*
