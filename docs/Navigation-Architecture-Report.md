# Navigation Architecture Report

**Date:** June 2026  
**Scope:** `stitch_verba_intelligence_platform` design assets vs `Integrated Situation.md` assessment  
**Status:** Approved direction — single primary navigation (bottom tabs), no drawer duplicate, no Translate

---

## Executive Summary

The current React Native app uses **two primary navigation layers** (bottom tabs + secondary drawer) with **four tabs including Translate and Profile**, duplicating routes that also exist in the drawer. This does not match the assessed dictionary product and creates clutter.

**Recommended architecture:** **3 bottom tabs** (Dictionary · History · Saved) with **stack screens** for Word Details and Settings. **No drawer navigator.** Activity 4 history requirements are satisfied by the **History tab** plus **Recent Searches chips** on Discover (present in `verba_home_search_insights` design).

---

## Design Evidence Summary

### Mobile bottom navigation (HTML `md:hidden fixed bottom-0`)

| Screen folder | Mobile tabs shown | Notes |
|---------------|-------------------|-------|
| `verba_home_search_insights` | Dictionary · Translate · History · Profile | Exploration / platform vision |
| `search_live_suggestions` | Translate · Dictionary · History · Profile | Same 4-tab exploration set |
| `search_history` | Translate · Dictionary · History · Profile | History tab active |
| `search_loading_empty_states` | Translate · Dictionary · History · Profile | |
| `saved_words_collections` | Translate · Dictionary · **Saved Words** · History · Profile | 5-tab variant |
| `word_details_ethereal` | **Search** · Dictionary · History · Profile | **No Translate** |
| `audio_experience_eloquent` | Search · Dictionary · History · Profile | **No Translate** |

### Desktop sidebar (`hidden md:flex`)

Present on: `verba_home_search_insights`, `settings_preferences`, `saved_words_collections`, `navigation_main_drawer`.  
Contains: Home, Saved Words, History, Settings, About — **not shown on mobile**.

### Header patterns (mobile)

`verba_home_search_insights`: **menu** (left) · **Verba** (center) · **account_circle** (right)  
`search_live_suggestions`: menu · search field · profile icon

**Conclusion:** Designs mix a 4-tab exploration shell with dictionary-focused variants that omit Translate. Desktop drawer is **not** mobile primary navigation. Profile/account is often a **header affordance**, not always a tab.

---

## Assessment Requirements (`Integrated Situation.md`)

| Activity | Navigation implication |
|----------|------------------------|
| 1 — Search | Discover / search screen |
| 2 — Word details | Stack push from search |
| 3 — Audio | Word Details (no separate tab) |
| 4 — Drawer & history | History storage, list display, tap-to-re-search |
| 5 — Errors | Inline on Word Details / states |

**Translate:** Not mentioned anywhere in assessment.  
**Profile tab:** Not required.  
**Drawer (literal text):** Activity 4 says "drawer navigation" and "display … in the drawer menu."

### Activity 4 — Drawer vs History screen

| Requirement | Drawer-only? | Alternative |
|-------------|--------------|-------------|
| Store search history | No | `HistoryContext` |
| Display searched items | No | `search_history` screen + Discover chips |
| Tap word → re-fetch | No | Navigate to Word Details |
| Prevent duplicates | No | Context logic |

**Verdict:** Functional requirements are fully satisfied by **History tab + Recent Searches on Discover** without a visible drawer. The assessment wording reflects a teaching pattern; the design assets themselves place history on a **dedicated tab** and **home chips**, not in a mobile drawer.

---

## Translate Review

| Question | Answer |
|----------|--------|
| Exists in design exploration? | Yes — most 4-tab HTML shells |
| Part of assessed product? | **No** — not in Integrated Situation |
| Essential to design system? | **No** — `DESIGN.md` does not define Translate; `word_details_ethereal` and `audio_experience_eloquent` omit it |
| Action | **Remove** tab and placeholder screen |

---

## Current Issues

1. **Double hierarchy:** `RootStack → Drawer → Tabs → Stacks` — drawer duplicates tab destinations.
2. **Cluttered 4-tab bar:** Translate (non-assessed) + Profile (redundant with header account pattern).
3. **Duplicate routes:** Home, Saved Words, History, Settings reachable from both tabs and drawer.
4. **Tab bar styling:** Generic React Navigation defaults — missing glass blur, active pill, label-caps typography from designs.
5. **Hamburger opens full drawer menu** — conflicts with bottom tabs as single primary pattern.

---

## Proposed Navigation Map

```
RootStack
├── Onboarding
└── MainTabs (Bottom Tabs — ONLY primary navigation)
    ├── Dictionary (Stack)
    │   ├── Discover        ← Search, suggestions, WOTD, recent chips
    │   ├── WordDetails     ← API results, audio, errors
    │   └── Settings        ← Header account icon (stack push)
    ├── History             ← Full search history (Activity 4 list)
    └── Saved               ← Saved words & collections
```

### Screen classification

| Screen | Type | Entry | Parent | Destinations |
|--------|------|-------|--------|--------------|
| Splash | Transient | App launch | — | Onboarding / Main |
| Onboarding | Stack (root) | First launch | — | Main |
| Discover | Tab + Stack | Dictionary tab | MainTabs | WordDetails, Settings |
| Search suggestions | Inline overlay | Discover typing | Discover | WordDetails |
| Word Details | Stack | Search / History / Saved / chips | Dictionary | Back, related words |
| History | Tab | History tab | MainTabs | WordDetails (cross-tab) |
| Saved Words | Tab | Saved tab | MainTabs | WordDetails (cross-tab) |
| Settings | Stack (secondary) | Account icon on Discover | Dictionary | Onboarding (reset) |
| Error states | Inline | Word Details / API | Word Details | Retry, Saved (offline) |

---

## Screens to Remove

| Item | Reason |
|------|--------|
| `TranslatePlaceholderScreen` | Not assessed, not core design |
| `ProfileScreen` (hub) | Redundant; Settings via header |
| `DrawerContent` + drawer navigator | Duplicates tabs; not mobile design primary |
| Profile tab | Account icon pattern sufficient |
| Translate tab | Not required |

---

## Screens to Merge / Relocate

| From | To |
|------|-----|
| Profile stack (Settings, SavedWords) | Settings → Dictionary stack; SavedWords → Saved tab |
| Drawer "Home" | Dictionary tab (already default) |
| Drawer recent searches | Already on Discover chips + History tab |
| Drawer WOTD | Discover WOTD card (already present) |

---

## Bottom Tab Bar — Design Spec (from DESIGN.md + HTML)

| Property | Value |
|----------|-------|
| Background | `surface` @ 80% opacity + backdrop blur |
| Border | 1px top `white/10` |
| Shadow | `0 -4px 20px rgba(79, 70, 229, 0.08)` |
| Corner radius | `rounded-t-xl` (12px) |
| Padding | `px-16 py-12` + safe area |
| Active color | `secondary` |
| Active background | `secondaryFixed` @ 20%, `rounded-xl` pill |
| Inactive color | `onSurfaceVariant` @ 60% |
| Label | label-caps: 12px, weight 600, letter-spacing 0.05em |
| Active icon | Filled variant |
| Tabs | Dictionary (`menu-book`), History (`history`), Saved (`bookmark`) |

---

## Implementation Checklist

- [x] Remove drawer navigator wrapper
- [x] 3-tab bottom navigation
- [x] Custom tab bar aligned to design tokens
- [x] Settings in Dictionary stack (header account icon)
- [x] Remove Translate and Profile tab
- [x] Simplify navigation helpers
- [x] Preserve Activity 4 via History + Discover recent chips
